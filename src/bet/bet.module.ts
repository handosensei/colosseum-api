import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BettingPool } from './entities/betting-pool.entity';
import { Bet } from './entities/bet.entity';
import { AuthModule } from '../auth/auth.module';
import { BettingPoolService } from './service/betting-pool.service';
import { Participation } from '../battle/participation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bet, BettingPool, Participation]),
    AuthModule,
  ],
  controllers: [],
  providers: [BettingPoolService],
  exports: [BettingPoolService, TypeOrmModule],
})
export class BetModule {}
