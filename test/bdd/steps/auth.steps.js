const { BeforeAll, AfterAll, Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { Test } = require('@nestjs/testing');
const { TypeOrmModule } = require('@nestjs/typeorm');
const request = require('supertest');
const { Wallet } = require('ethers');

const { AuthModule } = require('../../../dist/auth/auth.module');
const { User } = require('../../../dist/user/user.entity');
const { Session } = require('../../../dist/auth/entity/session.entity');
const { Nonce } = require('../../../dist/auth/entity/nonce.entity');

setDefaultTimeout(60_000);

let app;
let http;

const ctx = {};

BeforeAll(async () => {
  const moduleFixture = await Test.createTestingModule({
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
  // Already bootstrapped
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
  const res = await request(http).get('/auth/nonce').query({ address: ctx.address });
  ctx.res = res;
  if (res.statusCode !== 200) {
    throw new Error('Expected 200 when requesting nonce, got ' + res.statusCode);
  }
  ctx.nonce = res.body.nonce;
  ctx.message = res.body.message;
});

When('I sign the nonce message with my wallet', async function () {
  ctx.signature = await ctx.wallet.signMessage(ctx.message);
});

When('I sign the nonce message with the other wallet', async function () {
  ctx.signature = await ctx.otherWallet.signMessage(ctx.message);
});

When('I verify the signature to login', async function () {
  const res = await request(http)
    .post('/auth/verify')
    .send({ address: ctx.address, signature: ctx.signature, nonce: ctx.nonce });
  ctx.verifyRes = res;
});

Then('I should receive an auth cookie', function () {
  const res = ctx.verifyRes;
  if (res.statusCode !== 200) throw new Error('Expected 200 on verify');
  const setCookie = res.headers['set-cookie'];
  if (!setCookie) throw new Error('No Set-Cookie header present');
  const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
  ctx.cookieHeader = cookies[0].split(';')[0];
});

When(/^I call GET \/auth\/me with the auth cookie$/, async function () {
  const res = await request(http).get('/auth/me').set('Cookie', ctx.cookieHeader);
  ctx.meRes = res;
});

Then('the response should include my wallet address', function () {
  const res = ctx.meRes;
  if (res.statusCode !== 200) throw new Error('Expected 200 on /auth/me');
  if (!res.body?.user?.walletAddress || res.body.user.walletAddress.toLowerCase() !== ctx.address) {
    throw new Error('Wallet address mismatch in /auth/me');
  }
});

When(/^I call POST \/auth\/logout with the auth cookie$/, async function () {
  const res = await request(http).post('/auth/logout').set('Cookie', ctx.cookieHeader);
  ctx.logoutRes = res;
});

Then('the logout response should be ok', function () {
  const res = ctx.logoutRes;
  if (res.statusCode !== 200) throw new Error('Expected 200 on logout');
  if (!res.body?.ok) throw new Error('Logout response not ok');
});

Then(/^calling GET \/auth\/me with the same cookie should be unauthorized$/, async function () {
  const res = await request(http).get('/auth/me').set('Cookie', ctx.cookieHeader);
  if (res.statusCode !== 401) throw new Error('Expected 401 after logout for /auth/me');
});

Then('verifying the signature should be unauthorized', async function () {
  const res = await request(http)
    .post('/auth/verify')
    .send({ address: ctx.address, signature: ctx.signature, nonce: ctx.nonce });
  if (res.statusCode !== 401) throw new Error('Expected 401 with wrong signature');
});
