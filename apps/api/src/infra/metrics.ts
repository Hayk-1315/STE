// apps/api/src/infra/metrics.ts
type CounterKey =
  | 'placed'
  | 'cancelled'
  | 'partial_fill'
  | 'filled'
  | 'expired';
type Counters = Record<CounterKey, number>;

const KEY = '__ste_metrics__';
const g = globalThis as unknown as Record<string, unknown>;

if (!g[KEY]) {
  g[KEY] = {
    counters: {
      placed: 0,
      cancelled: 0,
      partial_fill: 0,
      filled: 0,
      expired: 0,
    } as Counters,
    startedAt: Date.now(),
  };
}

type State = { counters: Counters; startedAt: number };

export const metrics = {
  inc(key: CounterKey, by = 1): void {
    const s = g[KEY] as State;
    s.counters[key] = (s.counters[key] ?? 0) + by;
  },
  snapshot(): { counters: Counters; uptimeSec: number } {
    const s = g[KEY] as State;
    return {
      counters: { ...s.counters },
      uptimeSec: Math.floor((Date.now() - s.startedAt) / 1000),
    };
  },
  toProm(): string {
    const snap = this.snapshot();
    const lines = [
      '# HELP ste_orders_total Total order lifecycle events',
      '# TYPE ste_orders_total counter',
      `ste_orders_total{type="placed"} ${snap.counters.placed}`,
      `ste_orders_total{type="cancelled"} ${snap.counters.cancelled}`,
      `ste_orders_total{type="partial_fill"} ${snap.counters.partial_fill}`,
      `ste_orders_total{type="filled"} ${snap.counters.filled}`,
      `ste_orders_total{type="expired"} ${snap.counters.expired}`,
      '',
      '# HELP ste_uptime_seconds Process uptime in seconds',
      '# TYPE ste_uptime_seconds gauge',
      `ste_uptime_seconds ${snap.uptimeSec}`,
      '',
    ];
    return lines.join('\n');
  },
} as const;
