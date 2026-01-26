/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe.skip('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('ZEROEX_CONFIG')
      .useValue({
        chainId: 8453,
        rpcUrl: 'http://localhost:8545',
        exchangeProxy: '0xDef1C0ded9bEc7F1A1670819833240f027b25EfF',
        allowanceSpender: undefined,
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
