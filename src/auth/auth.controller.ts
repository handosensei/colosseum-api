import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nonce } from './entity/nonce.entity';
import { randomBytes, randomUUID } from 'crypto';

const NONCE_EXP_MS = 5 * 60 * 1000; // 5 minutes

@Controller('auth')
export class AuthController {
  constructor(
    @InjectRepository(Nonce)
    private readonly nonceRepo: Repository<Nonce>,
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

    return {
      nonce,
      message: this.buildSiweMessage(nonce, address),
      expiresAt: +expiresAt,
    };
  }

  private buildSiweMessage(nonce: string, address: string): string {
    return `Sign in to The Colosseum\n\nAddress: ${address}\nNonce: ${nonce}\nIssued At: ${new Date().toISOString()}`;
  }
}
