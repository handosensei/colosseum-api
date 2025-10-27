/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { BeforeAll, AfterAll, Given, When, Then, setDefaultTimeout } from '@cucumber/cucumber';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as supertest from 'supertest';

import { AuthModule } from '../../../src/auth/auth.module';
import { BattleModule } from '../../../src/battle/battle.module';
import { CharacterModule } from '../../../src/character/character.module';

import { User } from '../../../src/user/entity/user.entity';
import { Session } from '../../../src/auth/entity/session.entity';
import { Nonce } from '../../../src/auth/entity/nonce.entity';
import { Battle } from '../../../src/battle/entities/battle.entity';
import { Character } from '../../../src/character/character.entity';
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
        entities: [User, Session, Nonce, Battle, Character, Participation],
        synchronize: true,
        logging: false,
      }),
      AuthModule,
      BattleModule,
      CharacterModule,
    ],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();
  http = app.getHttpServer();

  // Expose repos and services for seeding and auth
  ctx.userRepo = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
  ctx.sessionRepo = moduleFixture.get<Repository<Session>>(getRepositoryToken(Session));
  ctx.characterRepo = moduleFixture.get<Repository<Character>>(getRepositoryToken(Character));
  ctx.battleRepo = moduleFixture.get<Repository<Battle>>(getRepositoryToken(Battle));
  ctx.partRepo = moduleFixture.get<Repository<Participation>>(getRepositoryToken(Participation));
  ctx.auth = moduleFixture.get<AuthService>(AuthService);
});

AfterAll(async () => {
  await app?.close();
});

Given('a fresh API server for battles', function () {
  // already initialized
});

Given('I am logged in as a user', async function () {
  const suffix = Date.now().toString(16).slice(-8);
  const user = await ctx.userRepo.save(ctx.userRepo.create({ walletAddress: ('0xuser'.padEnd(42 - suffix.length, '0') + suffix), role: 'user' }));
  const jti = 'jti-user-1';
  await ctx.sessionRepo.save(ctx.sessionRepo.create({ id: 'sess-user-1', userId: user.id, jwtId: jti, expiresAt: new Date(Date.now() + 3600_000) }));
  const token = ctx.auth.signSession({ sub: String(user.id), walletAddress: user.walletAddress, role: 'user', jti });
  ctx.authHeader = 'Bearer ' + token;
});

Given('I am logged in as an admin', async function () {
  const suffix = Date.now().toString(16).slice(-8);
  const user = await ctx.userRepo.save(ctx.userRepo.create({ walletAddress: ('0xadmin'.padEnd(42 - suffix.length, '0') + suffix), role: 'admin' }));
  const jti = 'jti-admin-1';
  await ctx.sessionRepo.save(ctx.sessionRepo.create({ id: 'sess-admin-1', userId: user.id, jwtId: jti, expiresAt: new Date(Date.now() + 3600_000) }));
  const token = ctx.auth.signSession({ sub: String(user.id), walletAddress: user.walletAddress, role: 'admin', jti });
  ctx.authHeader = 'Bearer ' + token;
});

Given('there are characters:', async function (dataTable) {
  const rows = dataTable.hashes();
  for (const row of rows) {
    await ctx.characterRepo.save(ctx.characterRepo.create({ id: Number(row.id), name: row.name }));
  }
});

Given('there are battles with titles and times:', async function (dataTable) {
  const rows = dataTable.hashes();
  const now = Date.now();
  // ensure some participations exist by referencing characters 1 and 2 if available
  for (const row of rows) {
    const start = new Date(now + Number(row.startOffsetMinutes) * 60_000);
    const battle = ctx.battleRepo.create({
      title: row.title,
      startTime: start,
      participations: [
        ctx.partRepo.create({ character: { id: 1 }, isWinner: false }),
        ctx.partRepo.create({ character: { id: 2 }, isWinner: false }),
      ],
    });
    await ctx.battleRepo.save(battle);
  }
});

When(/^I call GET \/battles without auth$/, async function () {
  ctx.res = await supertest(http).get('/battles');
});

When(/^I call GET \/battles with page=(\d+) and limit=(\d+)$/, async function (page: string, limit: string) {
  ctx.res = await supertest(http).get('/battles').set('Authorization', ctx.authHeader).query({ page, limit });
});

When(/^I call GET \/battles with search="([^"]+)"$/, async function (q: string) {
  ctx.res = await supertest(http).get('/battles').set('Authorization', ctx.authHeader).query({ search: q });
});

When(/^I call GET \/battles\/next$/, async function () {
  ctx.res = await supertest(http).get('/battles/next').set('Authorization', ctx.authHeader);
});

When('I create a battle with title {string} starting in {int} minutes with participations:', async function (title: string, minutes: number, dataTable) {
  const start = new Date(Date.now() + minutes * 60_000).toISOString();
  const participations = dataTable.hashes().map((r: any) => ({ characterId: Number(r.characterId), isWinner: r.isWinner === 'true' }));
  ctx.res = await supertest(http)
    .post('/battles')
    .set('Authorization', ctx.authHeader)
    .send({ title, startTime: start, participations });
});

When(/^I call GET \/battles\/(\d+)$/, async function (id: string) {
  ctx.res = await supertest(http).get(`/battles/${id}`).set('Authorization', ctx.authHeader);
});

When(/^I call PATCH \/battles\/(\d+)$/, async function (id: string) {
  ctx.res = await supertest(http).patch(`/battles/${id}`).set('Authorization', ctx.authHeader).send({ title: 'updated' });
});

When(/^I call DELETE \/battles\/(\d+)$/, async function (id: string) {
  ctx.res = await supertest(http).delete(`/battles/${id}`).set('Authorization', ctx.authHeader);
});

Then('the response status should be {int}', function (status: number) {
  if (ctx.res?.statusCode !== status) {
    throw new Error(`Expected status ${status}, got ${ctx.res?.statusCode}`);
  }
});

Then('the response should contain at most {int} battles', function (limit: number) {
  const body = ctx.res?.body;
  if (!body || typeof body !== 'object') throw new Error('Expected response body');
  if (!Array.isArray(body.items)) throw new Error('Expected paginated items array');
  if (body.items.length > limit) throw new Error(`Expected at most ${limit} items, got ${body.items.length}`);
});

Then('all returned battles should include {string} in the title', function (q: string) {
  const items = ctx.res?.body?.items;
  if (!Array.isArray(items)) throw new Error('Expected items array');
  const lower = q.toLowerCase();
  for (const it of items) {
    if (typeof it.title !== 'string' || !it.title.toLowerCase().includes(lower)) {
      throw new Error(`Item title does not include '${q}': ${it.title}`);
    }
  }
});

Then('the response should be either a battle or a no-battle message', function () {
  const body = ctx.res?.body;
  if (!body) throw new Error('No body');
  if (body.message === 'No battle') return;
  if (!body.id || !body.title || !body.startTime) {
    throw new Error('Expected battle fields');
  }
});
