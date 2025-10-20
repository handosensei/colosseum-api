import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharacterController } from './character.controller';
import { CharacterService } from './character.service';
import { Character } from './character.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Character]), AuthModule],
  controllers: [CharacterController],
  providers: [CharacterService],
})
export class CharacterModule {}
