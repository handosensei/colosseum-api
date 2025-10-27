/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { BeforeAll, AfterAll, Given, When, Then, setDefaultTimeout } from '@cucumber/cucumber';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as supertest from 'supertest';
import { Wallet } from 'ethers';

import { AuthModule } from '../../../src/auth/auth.module';
import { User } from '../../../src/user/entity/user.entity';
import { Session } from '../../../src/auth/entity/session.entity';
import { Nonce } from '../../../src/auth/entity/nonce.entity';

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
        entities: [User, Session, Nonce],
        synchronize: true,
        logging: false,
      }),
      AuthModule,
    ],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();
  http = app.getHttpServer();
});

AfterAll(async () => {
  await app?.close();
});

Given('a fresh API server', function () {
  // Already bootstrapped in BeforeAll
});

Given('I have a random wallet', function () {
  const wallet = Wallet.createRandom();
  ctx.wallet = wallet;
  ctx.address = wallet.address.toLowerCase();
});

Given('I also have another random wallet', function () {
  ctx.otherWallet = Wallet.createRandom();
});

When('I request a nonce for my wallet address', async function () {
  const res = await supertest(http).get('/auth/nonce').query({ address: ctx.address });
  ctx.res = res;
  if (res.statusCode !== 200) {
    throw new Error('Expected 200 when requesting nonce, got ' + res.statusCode);
  }
  ctx.nonce = res.body.nonce;
  ctx.message = res.body.message;
});

When('I sign the nonce message with my wallet', async function () {
  ctx.signature = await ctx.wallet.signMessage(ctx.message as string);
});

When('I sign the nonce message with the other wallet', async function () {
  ctx.signature = await ctx.otherWallet.signMessage(ctx.message as string);
});

When('I verify the signature to login', async function () {
  const res = await supertest(http)
    .post('/auth/verify')
    .send({ address: ctx.address, signature: ctx.signature, nonce: ctx.nonce });
  ctx.verifyRes = res;
});

Then('I should receive an auth token', function () {
  const res = ctx.verifyRes;
  if (res.statusCode !== 200) throw new Error('Expected 200 on verify');
  const token = res.body?.token;
  if (!token || typeof token !== 'string') throw new Error('No token in verify response');
  ctx.authHeader = `Bearer ${token}`;
});

When(/^I call GET \/auth\/me with the auth token$/, async function () {
  const res = await supertest(http).get('/auth/me').set('Authorization', ctx.authHeader);
  ctx.meRes = res;
});

Then('the response should include my wallet address', function () {
  const res = ctx.meRes;
  if (res.statusCode !== 200) throw new Error('Expected 200 on /auth/me');
  if (!res.body?.user?.walletAddress || res.body.user.walletAddress.toLowerCase() !== ctx.address) {
    throw new Error('Wallet address mismatch in /auth/me');
  }
});

When(/^I call POST \/auth\/logout with the auth token$/, async function () {
  const res = await supertest(http).post('/auth/logout').set('Authorization', ctx.authHeader);
  ctx.logoutRes = res;
});

Then('the logout response should be ok', function () {
  const res = ctx.logoutRes;
  if (res.statusCode !== 200) throw new Error('Expected 200 on logout');
  if (!res.body?.ok) throw new Error('Logout response not ok');
});

Then(/^calling GET \/auth\/me with the same token should be unauthorized$/, async function () {
  const res = await supertest(http).get('/auth/me').set('Authorization', ctx.authHeader);
  if (res.statusCode !== 401) throw new Error('Expected 401 after logout for /auth/me');
});

Then('verifying the signature should be unauthorized', async function () {
  const res = await supertest(http)
    .post('/auth/verify')
    .send({ address: ctx.address, signature: ctx.signature, nonce: ctx.nonce });
  if (res.statusCode !== 401) throw new Error('Expected 401 with wrong signature');
});
