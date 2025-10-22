import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BettingPool } from './betting-pool.entity';
import { Bet } from './bet.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Bet, BettingPool]), AuthModule],
  controllers: [],
  providers: [],
})
export class BetModule {}
