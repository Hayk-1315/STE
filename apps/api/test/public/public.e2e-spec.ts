// This file contains end-to-end tests for the public API endpoints of the application.
// It uses a fully typed mock of the PersistenceRepository to isolate the API layer from the database.
// The tests cover basic functionality and error handling of the public endpoints.
process.env.CHAIN_ID = '8453';
process.env.RPC_URL_READONLY = 'https://mainnet.base.org';
process.env.FEE_RECIPIENT = '0x0000000000000000000000000000000000000001';
process.env.DEV_SKIP_SIGS = '1';
process.env.DATABASE_URL =
  'postgresql://ste:ste@localhost:5432/ste?schema=public';

import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication } from '@nestjs/common';
import request, { type Response } from 'supertest';
import { type Server } from 'http';
import { AppModule } from '../../src/app.module';
import { PersistenceRepository } from '../../src/matching/persistence.repository';

/// <reference types="jest" />

/**
 * Fully typed mock repository for public API e2e tests.
 * Only methods required by current modules are implemented.
 */
const mockRepo = {
  getTradingContext: (market?: string) => {
    if (market === 'FAKE-PAIR') {
      return Promise.reject(new Error('market not found'));
    }
    return Promise.resolve({
      id: '1',
      symbol: 'WETH-USDC',
      baseDecimals: 18,
      priceTickQ: 1n,
      minSizeB: 1n,
      minNotionalQ: 1n,
      baseAddress: '0x0000000000000000000000000000000000000001',
      quoteAddress: '0x0000000000000000000000000000000000000002',
    });
  },

  upsertOrderPlaced: (): Promise<void> => {
    return Promise.resolve();
  },

  cancelOrder: (): Promise<void> => {
    return Promise.resolve();
  },

  decreaseOrderRemaining: (): Promise<void> => {
    return Promise.resolve();
  },

  getOrderRemaining: (): Promise<bigint | null> => {
    return Promise.resolve(null);
  },

  listPlacedBySymbol: (): Promise<unknown[]> => {
    return Promise.resolve([]);
  },

  listMarketsBasic: (): Promise<
    Array<{
      id: string;
      symbol: string;
      baseAddress: string;
      quoteAddress: string;
    }>
  > => {
    return Promise.resolve([
      {
        id: '1',
        symbol: 'WETH-USDC',
        baseAddress: '0x0000000000000000000000000000000000000001',
        quoteAddress: '0x0000000000000000000000000000000000000002',
      },
    ]);
  },

  addTrade: (): Promise<void> => {
    return Promise.resolve();
  },

  appendEvent: (): Promise<void> => {
    return Promise.resolve();
  },

  expireOrder: (): Promise<void> => {
    return Promise.resolve();
  },

  findRawOrderByHash: (): Promise<null> => {
    return Promise.resolve(null);
  },
};

jest.setTimeout(30000); // 30s timeout for e2e tests, can be adjusted as needed
describe('Public API (e2e)', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PersistenceRepository)
      .useValue(mockRepo)
      .compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });

  it('POST /orders should reject malformed body', async (): Promise<void> => {
    const res: Response = await request(app.getHttpServer() as Server)
      .post('/orders')
      .send({});

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('POST /cancel should return controlled response for valid cancel request shape', async (): Promise<void> => {
    const res: Response = await request(app.getHttpServer() as Server)
      .post('/cancel')
      .send({
        marketId: 'WETH-USDC',
        orderHash: '0xapi-order-1',
        maker: '0x0000000000000000000000000000000000000011',
        signature:
          '0x111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111b',
      });

    expect([200, 201, 403]).toContain(res.status);
  });

  it('should reject invalid market', async (): Promise<void> => {
    const res: Response = await request(app.getHttpServer() as Server)
      .get('/orderbook')
      .query({
        symbol: 'FAKE-PAIR',
      });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
