import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { ROLES_KEY, type Role } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    type RequestWithUser = Request & {
      user?: { sub: string; walletAddress: string; role?: string; jti: string };
    };
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const role = req.user?.role ?? 'user';

    const allowed = required.includes(role as Role);
    if (!allowed) {
      throw new ForbiddenException('Insufficient role');
    }
    return true;
  }
}
