import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BattleController } from './battle.controller';

import { BattleService } from './battle.service';

import { Battle } from './battle.entity';
import { Character } from '../character/character.entity';
import { Participation } from './participation.entity';

import { CharacterExistsConstraint } from './validators/character-exists.validator';

import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Battle, Character, Participation]),
    AuthModule,
  ],
  controllers: [BattleController],
  providers: [BattleService, CharacterExistsConstraint],
})
export class BattleModule {}
