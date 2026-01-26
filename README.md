# SkyTrade Exchange (STE)

A minimal, production-flavored spot DEX front-to-back: clean UI (Next.js/React), a typed API (NestJS) with orderbook + WS, on-chain cancel/allowance flow, and observability (Prometheus/Grafana). Built to demonstrate a near-production architecture—fast to try, easy to reason about.

## TL;DR

Two live profiles are recommended:

- **Demo (Base Mainnet, read-only)** – see real markets safely.
- **Dev (Base Sepolia, interactive)** – place a tiny trade and watch metrics.

---

## Live Demos

### Demo – Base Mainnet (read-only)

`https://demo.example.com`  
**What you can do:** browse markets, live orderbook, recent trades, balances (read-only), health/WS indicators. Execution/approve disabled to avoid mainnet risk.

### Dev – Base Sepolia (interactive)

`https://dev.example.com`  
**What you can do:** connect wallet, approve (if needed), place/cancel orders, watch live orderbook/trades update.  
**Optional metrics dashboard:** `http://localhost:3002` (see **Observability** below).

> Replace the URLs above with your Vercel deployments when ready.

---

## Quick Tour (2 minutes)

- **Maker (limit)** – place a limit order with tick controls and TIF/policies enforced.
- **Taker (market)** – quote → (optional) approve → execute, with allowance and gas checks.
- **Orderbook & Trades** – top-10 book with per-level timestamps, recent trades feed.
- **My Orders (live)** – live lifecycle (placed/partial/filled/cancelled/expired).
- **Balances & Allowances** – per-token balances + enable/custom/revoke.
- **Status** – WS health badge, chain badge, account badge, and manual refresh.
- **Metrics** – WS broadcasts/subscribers, tick loop p95, orders/quotes/fills/cancels.

---

## Architecture

```
[ Next.js (apps/web) ]  ───────── WebSocket (book, orders) ──┐
        │  REST (markets, orderbook, trades)                  │
        ▼                                                     ▼
[ NestJS API (apps/api) ] ── Prisma ──► [ Postgres ]      [ 0x Exchange Proxy ]
        │                                   │                 (Base: Sepolia/Mainnet)
        ├── On-chain watchers (fills/cancels) │
        └── Observability (Prometheus)      └── Job scheduler (ticks, replay)
```

- Profiles: **DEV (Base Sepolia)** for interactive testing, **DEMO (Base Mainnet)** read-only.
- WS: broadcast top-10 snapshots per subscribed symbol, orders room per address.
- Metrics: Prometheus counters/gauges/histograms; optional Grafana dashboard.

---

## Environments & Profiles

You’ll keep **two deploys** (simpler and safer than hot-switching):

### DEV (Base Sepolia, interactive)

- **RPC_URL / RPC_URL_READONLY:** Base Sepolia
- **markets.json:** Sepolia token addresses
- **0x addresses:** Base Sepolia EP/targets
- **Trading enabled** (approve/execute), for cheap real demos.

### DEMO (Base Mainnet, read-only)

- **RPC_URL / RPC_URL_READONLY:** Base Mainnet
- **markets.json:** Mainnet token addresses
- **0x addresses:** Base mainnet EP/targets
- **Read-only** (disable/guard mutating endpoints and buttons)

> In the UI, clearly label the mode (“Read-only on Base Mainnet”).

### FEES policy

- Demo fee (Sepolia Ethereum): 0.10% → 0xe02c543d4e8c89ab1f76b414fc3c75adc44cec2a (dev only)
- Base Mainnet demo: 0% (read-only, no execution)

---

## Configuration

### Frontend (Next.js)

**Environment** (Vercel project settings or `.env.local`):

```ini
NEXT_PUBLIC_API_BASE_URL=https://api-dev.example.com   # or api-demo for mainnet demo
NEXT_PUBLIC_CHAIN_ID=84532                             # 84532=Base Sepolia, 8453=Base
NEXT_PUBLIC_PROFILE=sepolia                            # "sepolia" or "mainnet"
```

### Backend (NestJS)

**Environment** (`apps/api/.env` per deploy):

```ini
DATABASE_URL=postgres://user:pass@host:5432/ste
RPC_URL=...
RPC_URL_READONLY=...
EXCHANGE_PROXY=0x...            # 0x EP for that chain
READ_ONLY=false                 # true for the mainnet demo instance
```

### Markets

Two files (example):

- `markets.sepolia.json` – test tokens/decimals/ids
- `markets.mainnet.json` – mainnet tokens

Select file by deploy (build arg/ENV or separate branches).

---

## Local Development

Requires Node, pnpm, and Docker (for Postgres/Prom/Grafana).

### Install deps

```bash
pnpm install
```

### Database (local)

```bash
docker run -d --name ste_postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16-alpine
# set DATABASE_URL accordingly and run migrations if you have them
```

### API (dev)

```bash
cd apps/api
pnpm dev
# listens on http://localhost:3001
```

### Web (dev)

```bash
cd apps/web
pnpm dev
# listens on http://localhost:3000
```

---

## Observability (optional, adds polish)

### Prometheus

Place `prometheus.yml` in repo root (with `scrape_interval: 2s` and target `host.docker.internal:3001`), then run:

```powershell
docker run -d --name ste-prom `
  --add-host=host.docker.internal:host-gateway `
  -p 9090:9090 `
  -v ${PWD}\prometheus.yml:/etc/prometheus/prometheus.yml:ro `
  -v ${PWD}\prom-data:/prometheus `
  prom/prometheus `
  --config.file=/etc/prometheus/prometheus.yml `
  --storage.tsdb.path=/prometheus `
  --storage.tsdb.retention.time=15d
```

### Grafana

```powershell
docker run -d --name ste-grafana `
  -p 3002:3000 `
  -e GF_SECURITY_ADMIN_USER=admin `
  -e GF_SECURITY_ADMIN_PASSWORD=admin `
  -v ${PWD}\grafana-data:/var/lib/grafana `
  grafana/grafana
# Open http://localhost:3002 → add Prometheus DS: http://host.docker.internal:9090
# Import the included dashboard JSON (dashboards/ste-realtime.json)
```

### Key metrics (examples used in the dashboard)

- **WS Broadcasts rate (/s):** emissions to book rooms per second.
- **WS Subscribers:** current subscribers across symbols.
- **WS tick p95 (ms, 5m):** loop latency percentile.
- **Orders/Quotes/Fills/Cancels:** both `rate()` and cumulative “totals”.

---

## Security & Guardrails

- No private keys in frontends or repo.
- CORS allowlist per deploy.
- Read-only flag enforced in the API for mainnet demo.
- `/dev/*` endpoints disabled in non-dev builds.

---

## Roadmap / Nice-to-have

- Advanced UI theming & charting
- Per-account positions/PNL (if you add it later)
- More tests & synthetic load harness
- CI/CD pipelines (lint, typecheck, build, smoke)

---

## License

MIT (or your choice).

---

## Credits

0x Protocol, Base, Ethers, Next.js, NestJS, Prisma, Prometheus, Grafana.
