import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BettingPool } from './entities/betting-pool.entity';
import { Bet } from './entities/bet.entity';
import { AuthModule } from '../auth/auth.module';
import { BettingPoolService } from './service/betting-pool.service';
import { Participation } from '../battle/participation.entity';
import { BetController } from './bet.controller';
import { BetService } from './service/bet.service';
import { Battle } from '../battle/battle.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bet, BettingPool, Participation, Battle]),
    AuthModule,
  ],
  controllers: [BetController],
  providers: [BettingPoolService, BetService],
  exports: [BettingPoolService, TypeOrmModule],
})
export class BetModule {}
