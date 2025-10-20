import { Module } from '@nestjs/common';

import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { User } from './user/user.entity';
import { Session } from './auth/entity/session.entity';
import { Nonce } from './auth/entity/nonce.entity';
import { BattleModule } from './battle/battle.module';
import { Battle } from './battle/entities/battle.entity';
import { Character } from './character/character.entity';
import { Participation } from './battle/entities/participation.entity';
import { CharacterModule } from './character/character.module';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      max: 10000,
    }),
    ConfigModule.forRoot({
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: 3306,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [User, Session, Nonce, Battle, Character, Participation],
      synchronize: true,
    }),
    UserModule,
    AuthModule,
    BattleModule,
    CharacterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
