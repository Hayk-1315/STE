# Hybrid Exchange (STE)

End-to-end hybrid DEX: a trading UI in Next.js/React, a strongly-typed NestJS API with in-memory limit order book backed by PostgreSQL, and on-chain settlement via 0x protocol (quotes, fills, partial fills, multifills, cancels and allowance flow).  
Includes WebSocket feeds, maker/taker panels, on-chain watchers for fills and cancels, health checks, and metrics wired into Prometheus/Grafana.  
Built as a near-production architecture: easy to spin up, easy to reason about, and focused on real trading flows rather than toy examples.

## TL;DR

Two live profiles are recommended:

- **Demo (Base Mainnet, read-only)** – see real markets safely.
- **Dev (Base Sepolia, interactive)** – place a tiny trade and watch metrics.

---

## Live Demos

### Demo – Base Mainnet (read-only)

`https://ste-web-five.vercel.app`  
**What you can do:** browse markets, live orderbook, recent trades, balances (read-only), health/WS indicators. Execution/approve disabled to avoid mainnet risk.

### Dev – Base Sepolia (interactive)

`https://ste-websepolia.vercel.app`  
**What you can do:** connect wallet, approve (if needed), place/cancel orders, watch live orderbook/trades update.  
**Optional metrics dashboard:** `http://localhost:3002` (see **Observability** below).

---

## Video walkthroughs (Loom)

To make it easier to understand how the app works end-to-end, here are a few short Loom videos:

1. **Video 1 – Quick tour of the UI (Base Mainnet, read-only).**  
   https://www.loom.com/share/8dfb8933950744c8b8878a5b0227465a  

2. **Video 2 – Sepolia Ethereum. Maker (sell) Place Limit, Approve and Cancel**   
   https://www.loom.com/share/3bcea1ac76a546f1816d3c0ec638827a  

3. **Video 3 – Taker (buy), Quote, Approve and Execute**   
   https://www.loom.com/share/e495d9d8cc2e42d59b8ba7434fc2108e  

4. **Video 4 – Multifill flow**  
   https://www.loom.com/share/3c0adc118c954515be268935c04f106c  

5. **Video 5 – Partial fill flow**  
   https://www.loom.com/share/5b6dc4691fc3427b99e05f3f439f4e5e  

> If you have any trouble watching the videos or accessing Loom, feel free to reach out.

---

## Quick Tour

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
┌─────────────────────────┐        REST + Socket.IO (WS)
│   Next.js UI (apps/web) │ <────────────────────────────────────┐
└───────────┬─────────────┘                                      │
            │                                                     │
            │ REST (markets, quote, orderbook, trades)            │
            │ WS  (book snapshots, orders feed, trades feed)      │
            ▼                                                     │
┌─────────────────────────┐      Prisma      ┌────────────────────┴─────────────┐
│  NestJS API (apps/api)  │ ───────────────► │            Postgres              │
│  - matching / LOB       │                  │  orders / trades / events / ...  │
│  - WS gateways          │                  └──────────────────────────────────┘
│  - fee + guardrails     │
│  - observability        │
│  - schedulers/ticks     │
└───────────┬─────────────┘
            │ JSON-RPC (read-only)
            │  (fills / cancels reconciliation)
            ▼
┌─────────────────────────┐
│   0x Exchange Proxy EP   │  (Base mainnet / Sepolia depending on profile)
└─────────────────────────┘

```

- Profiles: **DEV (Base Sepolia)** for interactive testing, **DEMO (Base Mainnet)** read-only.
- WS: broadcast top-10 snapshots per subscribed symbol, orders room per address.
- Metrics: Prometheus counters/gauges/histograms; optional Grafana dashboard.

---

## Environments & Profiles

**two deploys**:

### DEV (Ethereum Sepolia, interactive)

- **RPC_URL / RPC_URL_READONLY:** Base Sepolia
- **markets.json:** Sepolia token addresses
- **0x addresses:** Base Sepolia EP/targets
- **Trading enabled** (approve/execute), for cheap real demos.

### DEMO (Base Mainnet, read-only)

- **RPC_URL / RPC_URL_READONLY:** Base Mainnet
- **markets.json:** Mainnet token addresses
- **0x addresses:** Base mainnet EP/targets
- **Read-only** (disable/guard mutating endpoints and buttons)

### Markets configuration

- Markets are defined in JSON files (mainnet vs sepolia).
- The active set is selected by the environment profile (CHAIN_ID / NEXT_PUBLIC_PROFILE).

### FEES policy

- Demo fee (Sepolia Ethereum): 0.10% → 0xe02c543d4e8c89ab1f76b414fc3c75adc44cec2a (dev only)
- Base Mainnet demo: 0% (read-only, no execution)

---

## Quickstart Demo (Read-only Mainnet) --- Recommended

**Requirements: Node 22, pnpm, Docker (recommended for Postgres)**

### 1. Install dependencies

``` bash
pnpm install
```

### 2. Start Postgres

``` bash
pnpm db:up
pnpm prisma generate --schema apps/api/prisma/schema.prisma
```

### 3. Create API env file

Copy:

    apps/api/.env.example → apps/api/.env

### 4. Create Web env file

Copy:

    apps/web/.env.local.example → apps/web/.env.local

### 5. Run API (mainnet read-only)

``` bash
pnpm dev:api:mainnet
```

### 6. Run Web

``` bash
pnpm dev:web:mainnet
```

Open: http://localhost:3000

## Interactive Sepolia (Optional)

### 1. Copy env files

    apps/api/.env.sepolia.example → apps/api/.env.sepolia
    apps/web/.env.sepolia.local.example → apps/web/.env.sepolia.local

### 2. Run API

``` bash
pnpm dev:api:sepolia
```

### 3. Run Web

``` bash
pnpm dev:web:sepolia
```

---

## Observability (optional)

The API exposes Prometheus metrics at:

- `GET /metrics` (default: http://localhost:3001/metrics)

This repo includes:
- `prometheus.yml` (scrapes `host.docker.internal:3001/metrics`)
- a sample Grafana dashboard: `dashboards/ste-realtime.json`
- example output snapshot: `metrics_before.txt`

### Quick check (no Docker)

1) Start the API
2) Open: http://localhost:3001/metrics

### Prometheus (Docker, optional)

> Works best on Docker Desktop (macOS/Windows) where `host.docker.internal` is available.

``` bash
docker run -d --name ste-prom \
  --add-host=host.docker.internal:host-gateway \
  -p 9090:9090 \
  -v "$(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml:ro" \
  prom/prometheus --config.file=/etc/prometheus/prometheus.yml
``` 

Open: http://localhost:9090

### Grafana (optional)

``` bash
docker run -d --name ste-grafana -p 3002:3000 grafana/grafana
``` 
Open: http://localhost:3002 (default login: admin / admin)
Then:
- Add Prometheus datasource: http://host.docker.internal:9090
- Import dashboard: dashboards/ste-realtime.json

---

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

## License

MIT

