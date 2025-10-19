import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BattleService } from './battle.service';
import { BattleController } from './battle.controller';
import { Battle } from './entities/battle.entity';
import { Character } from './entities/character.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Battle, Character])],
  controllers: [BattleController],
  providers: [BattleService],
})
export class BattleModule {}
