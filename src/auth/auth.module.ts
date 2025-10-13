import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Nonce } from './entity/nonce.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Nonce])],
  controllers: [AuthController],
})
export class AuthModule {}
