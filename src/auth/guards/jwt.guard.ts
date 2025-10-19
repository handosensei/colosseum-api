import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../entity/session.entity';

function getTokenFromRequest(req: Request): string | null {
  const authHeader = req.get('authorization') ?? req.get('Authorization');
  if (!authHeader) return null;
  const prefix = 'Bearer ';
  if (authHeader.startsWith(prefix)) {
    return authHeader.slice(prefix.length).trim();
  }
  return null;
}

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService,
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    type RequestWithUser = Request & {
      user?: { sub: string; walletAddress: string; role?: string; jti: string };
    };
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const token = getTokenFromRequest(req);
    if (!token) throw new UnauthorizedException('No auth token');

    let payload: Record<string, unknown>;
    try {
      payload = this.auth.verifySession(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    const jti = typeof payload?.jti === 'string' ? payload.jti : undefined;
    if (!jti) throw new UnauthorizedException('Invalid token');

    const session = await this.sessionRepo.findOne({ where: { jwtId: jti } });
    if (!session || session.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Session expired');
    }

    const sub = typeof payload?.sub === 'string' ? payload.sub : undefined;
    const walletAddress =
      typeof payload?.walletAddress === 'string'
        ? payload.walletAddress
        : undefined;
    const role = typeof payload?.role === 'string' ? payload.role : 'user';

    if (!sub || !walletAddress) {
      throw new UnauthorizedException('Invalid token');
    }

    // attach the user payload to request for downstream guards/handlers
    req.user = {
      sub,
      walletAddress,
      role,
      jti,
    };

    return true;
  }
}
