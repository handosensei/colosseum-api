import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BattleService } from './battle.service';
import { BattleController } from './battle.controller';
import { Battle } from './entities/battle.entity';
import { Character } from './entities/character.entity';
import { Participation } from './entities/participation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Battle, Character, Participation])],
  controllers: [BattleController],
  providers: [BattleService],
})
export class BattleModule {}
