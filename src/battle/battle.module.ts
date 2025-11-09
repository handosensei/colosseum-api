import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClientModule } from '../client/client.module';
import { BattleWorkflowModule } from '../workflow/battle-workflow/battle-workflow.module';

import { BattleController } from './controllers/battle.controller';
import { BattleVideoController } from './controllers/battle-video.controller';

import { BattleService } from './battle.service';

import { Battle } from './entities/battle.entity';
import { Character } from '../character/character.entity';
import { Participation } from './entities/participation.entity';

import { CharacterExistsConstraint } from './validators/character-exists.validator';

import { AuthModule } from '../auth/auth.module';
import { BetModule } from '../bet/bet.module';
import { BattlePlaybackController } from './controllers/battle-playback.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Battle, Character, Participation]),
    AuthModule,
    BetModule,
    BattleWorkflowModule,
    ClientModule,
  ],
  controllers: [BattleController, BattleVideoController, BattlePlaybackController],
  providers: [BattleService, CharacterExistsConstraint],
})
export class BattleModule {}
