import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';

import { BetController } from './bet.controller';

import { BettingPoolService } from './service/betting-pool.service';
import { BetService } from './service/bet.service';

import { Battle } from '../battle/entities/battle.entity';
import { Bet } from './entities/bet.entity';
import { BettingPool } from './entities/betting-pool.entity';
import { Participation } from '../battle/entities/participation.entity';
import { PointTransaction } from './entities/point-transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Bet,
      BettingPool,
      Participation,
      Battle,
      PointTransaction,
    ]),
    AuthModule,
  ],
  controllers: [BetController],
  providers: [BettingPoolService, BetService],
  exports: [BettingPoolService, TypeOrmModule],
})
export class BetModule {}
