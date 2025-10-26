import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BattleController } from './battle.controller';

import { BattleService } from './battle.service';

import { Battle } from './entities/battle.entity';
import { Character } from '../character/character.entity';
import { Participation } from './entities/participation.entity';

import { CharacterExistsConstraint } from './validators/character-exists.validator';

import { AuthModule } from '../auth/auth.module';
import { BetModule } from '../bet/bet.module';
import { BattleWorkflowModule } from '../workflow/battle-workflow/battle-workflow.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Battle, Character, Participation]),
    AuthModule,
    BetModule,
    BattleWorkflowModule,
  ],
  controllers: [BattleController],
  providers: [BattleService, CharacterExistsConstraint],
})
export class BattleModule {}
