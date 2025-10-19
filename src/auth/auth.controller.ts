import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Body,
  Query,
  UnauthorizedException,
  Req,
  HttpCode,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nonce } from './entity/nonce.entity';
import { randomBytes, randomUUID } from 'crypto';
import { verifyMessage } from 'ethers';
import { AuthService } from './auth.service';
import { User } from '../user/user.entity';
import { Session } from './entity/session.entity';
import type { Request } from 'express';

const NONCE_EXP_MS = 5 * 60 * 1000; // 5 minutes
const SESSION_EXP_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

@Controller('auth')
export class AuthController {
  constructor(
    @InjectRepository(Nonce)
    private readonly nonceRepo: Repository<Nonce>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
    private readonly auth: AuthService,
  ) {}

  @Get('nonce')
  async getNonce(@Query('address') rawAddress?: string) {
    const address = rawAddress?.toLowerCase();
    if (!address) {
      throw new BadRequestException('address query param is required');
    }

    if (!/^0x[a-f0-9]{40}$/.test(address)) {
      throw new BadRequestException('invalid EVM address');
    }

    const nonce = randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + NONCE_EXP_MS);
    await this.nonceRepo.upsert(
      {
        id: randomUUID(),
        address,
        value: nonce,
        expiresAt,
      },
      {
        conflictPaths: ['address'],
        skipUpdateIfNoValuesChanged: false,
      },
    );

    // Re-read to get the persisted createdAt for deterministic message
    const stored = await this.nonceRepo.findOne({ where: { address } });

    return {
      nonce,
      message: this.buildSiweMessage(
        nonce,
        address,
        stored?.createdAt ?? new Date(),
      ),
      expiresAt: +expiresAt,
    };
  }

  @Post('verify')
  @HttpCode(200)
  async verify(
    @Body()
    body: {
      address?: string;
      signature?: string;
      nonce?: string;
    },
  ) {
    const { address, signature, nonce } = body ?? {};
    if (!address || !signature || !nonce) {
      throw new BadRequestException(
        'address, signature, and nonce are required',
      );
    }
    const normalized = address.toLowerCase();

    const stored = await this.nonceRepo.findOne({
      where: { address: normalized },
    });
    if (
      !stored ||
      stored.value !== nonce ||
      stored.expiresAt.getTime() < Date.now()
    ) {
      throw new BadRequestException('Invalid or expired nonce');
    }

    const message = this.buildSiweMessage(nonce, normalized, stored.createdAt);
    const recover = (msg: string, sig: string): string =>
      (verifyMessage as unknown as (m: string, s: string) => string)(msg, sig);
    let recovered = '';
    try {
      recovered = recover(message, signature).toLowerCase();
    } catch {
      throw new UnauthorizedException('Invalid signature');
    }
    if (recovered !== normalized) {
      throw new UnauthorizedException('Signature does not match address');
    }

    await this.nonceRepo.delete({ address: normalized });

    let user = await this.userRepo.findOne({
      where: { walletAddress: normalized },
    });
    if (!user) {
      user = await this.userRepo.save(
        this.userRepo.create({ walletAddress: normalized }),
      );
    } else {
      await this.userRepo.update(
        { id: user.id },
        {
          /* updatedAt auto */
        },
      );
    }

    const jti = randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_EXP_MS);
    await this.sessionRepo.save(
      this.sessionRepo.create({
        id: randomUUID(),
        userId: user.id,
        jwtId: jti,
        expiresAt,
      }),
    );

    const token = this.auth.signSession({
      sub: String(user.id),
      walletAddress: user.walletAddress,
      role: user.role ?? 'user',
      jti,
    });
    console.log('token', token);
    return {
      token,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        role: user.role,
        username: user.username ?? null,
        email: user.email ?? null,
      },
      session: { expiresAt },
    };
  }

  @Get('me')
  async me(@Req() req: Request) {
    const token = this.getTokenFromRequest(req);
    if (!token) throw new UnauthorizedException('No auth token');
    let payload: Record<string, any>;
    try {
      payload = this.auth.verifySession(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
    const jti = payload?.jti as string | undefined;
    const sub = payload?.sub as string | undefined;
    if (!jti || !sub) throw new UnauthorizedException('Invalid token');

    const session = await this.sessionRepo.findOne({ where: { jwtId: jti } });
    if (!session || session.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Session expired');
    }

    const user = await this.userRepo.findOne({
      where: { id: sub },
      select: [
        'id',
        'walletAddress',
        'username',
        'role',
        /* balance? */ 'createdAt',
      ],
    } as any);

    return { user };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request) {
    const token = this.getTokenFromRequest(req);
    if (token) {
      try {
        const payload = this.auth.verifySession(token);
        const jti = payload?.jti as string | undefined;
        if (jti) {
          await this.sessionRepo.delete({ jwtId: jti });
        }
      } catch {
        // ignore
      }
    }
    return { ok: true };
  }

  private buildSiweMessage(
    nonce: string,
    address: string,
    issuedAt?: Date,
  ): string {
    const ts = (issuedAt ?? new Date()).toISOString();
    return `Sign in to The Colosseum\n\nAddress: ${address}\nNonce: ${nonce}\nIssued At: ${ts}`;
  }

  private getTokenFromRequest(req: Request): string | null {
    const authHeader = req.get('authorization') ?? req.get('Authorization');
    if (!authHeader) return null;
    const prefix = 'Bearer ';
    if (authHeader.startsWith(prefix)) {
      return authHeader.slice(prefix.length).trim();
    }
    return null;
  }
}
