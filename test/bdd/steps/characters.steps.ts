/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { BeforeAll, AfterAll, Given, When, Then, setDefaultTimeout } from '@cucumber/cucumber';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as supertest from 'supertest';

import { AuthModule } from '../../../src/auth/auth.module';
import { CharacterModule } from '../../../src/character/character.module';

import { User } from '../../../src/user/entity/user.entity';
import { Session } from '../../../src/auth/entity/session.entity';
import { Nonce } from '../../../src/auth/entity/nonce.entity';
import { Character } from '../../../src/character/character.entity';
import { Battle } from '../../../src/battle/entities/battle.entity';
import { Participation } from '../../../src/battle/entities/participation.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from '../../../src/auth/auth.service';

setDefaultTimeout(60_000);

let app: INestApplication;
let http: any;

const ctx: Record<string, any> = {};

BeforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: 'sqlite',
        database: ':memory:',
        dropSchema: true,
        entities: [User, Session, Nonce, Character, Participation, Battle],
        synchronize: true,
        logging: false,
      }),
      AuthModule,
      CharacterModule,
    ],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();
  http = app.getHttpServer();

  ctx.userRepo = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
  ctx.sessionRepo = moduleFixture.get<Repository<Session>>(getRepositoryToken(Session));
  ctx.characterRepo = moduleFixture.get<Repository<Character>>(getRepositoryToken(Character));
  ctx.auth = moduleFixture.get<AuthService>(AuthService);
});

AfterAll(async () => {
  await app?.close();
});

Given('a fresh API server for characters', function () {
  // already initialized
});

Given('I am logged in as a user for characters', async function () {
  const suffix = Date.now().toString(16).slice(-8);
  const user = await ctx.userRepo.save(ctx.userRepo.create({ walletAddress: ('0xuser'.padEnd(42 - suffix.length, '0') + suffix), role: 'user' }));
  const jti = 'jti-user-1';
  await ctx.sessionRepo.save(ctx.sessionRepo.create({ id: 'sess-user-1', userId: user.id, jwtId: jti, expiresAt: new Date(Date.now() + 3600_000) }));
  const token = ctx.auth.signSession({ sub: String(user.id), walletAddress: user.walletAddress, role: 'user', jti });
  ctx.authHeader = 'Bearer ' + token;
});

Given('I am logged in as an admin for characters', async function () {
  const suffix = Date.now().toString(16).slice(-8);
  const user = await ctx.userRepo.save(ctx.userRepo.create({ walletAddress: ('0xadmin'.padEnd(42 - suffix.length, '0') + suffix), role: 'admin' }));
  const jti = 'jti-admin-1';
  await ctx.sessionRepo.save(ctx.sessionRepo.create({ id: 'sess-admin-1', userId: user.id, jwtId: jti, expiresAt: new Date(Date.now() + 3600_000) }));
  const token = ctx.auth.signSession({ sub: String(user.id), walletAddress: user.walletAddress, role: 'admin', jti });
  ctx.authHeader = 'Bearer ' + token;
});

Given('there are characters for characters:', async function (dataTable) {
  const rows = dataTable.hashes();
  for (const row of rows) {
    await ctx.characterRepo.save(ctx.characterRepo.create({ id: Number(row.id), name: row.name }));
  }
});

When(/^I call GET \/characters$/, async function () {
  ctx.res = await supertest(http).get('/characters').set('Authorization', ctx.authHeader);
});

Then('the characters response status should be {int}', function (status: number) {
  if (ctx.res?.statusCode !== status) {
    throw new Error(`Expected status ${status}, got ${ctx.res?.statusCode}`);
  }
});

Then('the character names should be in order:', function (_dataTable) {
  const names: string[] = (ctx.res?.body ?? []).map((c: any) => c.name);
  const sorted = [...names].sort((a, b) => a.localeCompare(b));
  for (let i = 0; i < names.length; i++) {
    if (names[i] !== sorted[i]) {
      throw new Error(`List is not alphabetically sorted at index ${i}: ${names[i]} vs ${sorted[i]}`);
    }
  }
});
