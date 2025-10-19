import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BattleService } from './battle.service';
import { BattleController } from './battle.controller';
import { Battle } from './entities/battle.entity';
import { Character } from './entities/character.entity';
import { Participation } from './entities/participation.entity';
import { AuthModule } from '../auth/auth.module';
import { CharacterExistsConstraint } from './validators/character-exists.validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([Battle, Character, Participation]),
    AuthModule,
  ],
  controllers: [BattleController],
  providers: [BattleService, CharacterExistsConstraint],
})
export class BattleModule {}
