import { Injectable } from '@nestjs/common';
import {
  JwtService,
  type JwtSignOptions,
  type JwtVerifyOptions,
} from '@nestjs/jwt';

const JWT_SECRET: string = process.env.JWT_SECRET ?? 'dev-secret';
const JWT_ISSUER = process.env.JWT_ISSUER ?? 'colosseum-api';
const JWT_AUDIENCE =
  process.env.jwt_AUDIENCE ?? process.env.JWT_AUDIENCE ?? 'colosseum-app';
const JWT_EXPIRES_IN = 3000000;

export type Claims = {
  sub: string; // user.id
  walletAddress: string;
  role?: string;
  jti: string; // Session.jwtId
};

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  signSession(claims: Claims): string {
    const { jti, ...payload } = claims;

    const options: JwtSignOptions = {
      jwtid: jti,
      expiresIn: JWT_EXPIRES_IN,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithm: 'HS256',
      secret: JWT_SECRET,
    };

    return this.jwt.sign(payload, options);
  }

  verifySession(token: string): Record<string, any> {
    const options: JwtVerifyOptions = {
      secret: JWT_SECRET,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    };
    return this.jwt.verify(token, options); // contains sub, walletAddress, role, jti
  }
}
