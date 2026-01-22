import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  collectDefaultMetrics,
  Counter,
  Gauge,
  Histogram,
  Registry,
} from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  readonly registry = new Registry();

  // Counters
  readonly ordersPlaced = new Counter({
    name: 'orders_placed_total',
    help: 'Orders placed',
    registers: [this.registry],
  });
  readonly ordersCancelled = new Counter({
    name: 'orders_cancelled_total',
    help: 'Orders cancelled',
    labelNames: ['kind', 'result'] as const,
    registers: [this.registry],
  });
  readonly fillsTotal = new Counter({
    name: 'fills_total',
    help: 'On-chain fills observed',
    labelNames: ['status'] as const,
    registers: [this.registry],
  });
  readonly quotesTotal = new Counter({
    name: 'quotes_total',
    help: 'match/quote calls',
    registers: [this.registry],
  });
  readonly wsBroadcasts = new Counter({
    name: 'ws_book_broadcasts_total',
    help: 'WS book payloads emitted',
    registers: [this.registry],
  });

  // Histograms (latencias en ms)
  readonly quoteLatency = new Histogram({
    name: 'quote_build_ms',
    help: 'quote() end-to-end',
    buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2000],
    registers: [this.registry],
  });
  readonly txBuildLatency = new Histogram({
    name: 'tx_build_ms',
    help: 'EP tx build latency',
    buckets: [1, 2, 5, 10, 20, 50, 100, 200, 500],
    registers: [this.registry],
  });
  readonly wsTickLatency = new Histogram({
    name: 'ws_tick_ms',
    help: 'WS tick loop duration',
    buckets: [5, 10, 20, 50, 100, 200, 500, 1000],
    registers: [this.registry],
  });

  // Gauges (estado)
  readonly wsSubscribers = new Gauge({
    name: 'ws_book_subscribers',
    help: 'Total WS subscribers (book:*)',
    registers: [this.registry],
  });
  readonly booksActive = new Gauge({
    name: 'ws_books_active',
    help: 'Symbols with listeners > 0',
    registers: [this.registry],
  });

  constructor() {
    collectDefaultMetrics({ register: this.registry });
  }

  // Touch metrics with zero so they show up at /metrics immediately
  onModuleInit(): void {
    // Counters sin labels → inc(0)
    this.ordersPlaced.inc(0);
    this.quotesTotal.inc(0);
    this.wsBroadcasts.inc(0);

    // Gauges → set(0)
    this.wsSubscribers.set(0);
    this.booksActive.set(0);

    // Nota: no “tocamos” counters con labels ni histograms para no crear series artificiales.
  }

  metrics(): Promise<string> {
    return this.registry.metrics();
  }
}
