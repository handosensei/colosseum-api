import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Nonce } from './entity/nonce.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { User } from '../user/entity/user.entity';
import { Session } from './entity/session.entity';
import { JwtGuard } from './guards/jwt.guard';
import { RolesGuard } from './guards/roles.guard';
import { UserModule } from '../user/user.module';
import { PointTransactionService } from '../user/point-transaction.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Nonce, User, Session]),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev-secret',
      signOptions: {
        issuer: process.env.JWT_ISSUER ?? 'colosseum-api',
        audience: process.env.JWT_AUDIENCE ?? 'colosseum-app',
        algorithm: 'HS256',
      },
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtGuard, RolesGuard],
  exports: [TypeOrmModule, AuthService, JwtGuard, RolesGuard],
})
export class AuthModule {}
