# STE — Full-Stack 0x-Based Hybrid DEX

End-to-end hybrid DEX architecture:

- Next.js / React trading UI
- NestJS API with off-chain order matching and in-memory limit order book
- PostgreSQL persistence via Prisma
- On-chain settlement via 0x Exchange Proxy
- WebSocket streams for order book, trades and orders
- Event watchers for on-chain fills & cancels reconciliation
- Prometheus metrics and Grafana dashboard

This project is a serious prototype of a hybrid DEX architecture, designed to explore order matching, settlement flows and on-chain/off-chain coordination in decentralized trading systems. While not production-ready, it focuses on modeling realistic system behavior and key architectural decisions rather than production hardening.  

---

## Live Profiles

### Base Mainnet (Read-Only, No Execution)

https://ste-web-five.vercel.app

- Browse markets
- Live orderbook & recent trades
- Balances & allowances
- Execution disabled to avoid mainnet risk

### Ethereum Sepolia (Interactive)

https://ste-websepolia.vercel.app

- Connect wallet
- Approve tokens
- Place & cancel limit orders
- Execute taker trades
- Partial fills & sequential multifill
- Live reconciliation via on-chain watchers

---

## Video Walkthroughs

Short Loom demos explaining the full flow:

1. Base Mainnet read-only tour
   - https://www.loom.com/share/8dfb8933950744c8b8878a5b0227465a
2. Maker flow (place / approve / cancel)
   - https://www.loom.com/share/3bcea1ac76a546f1816d3c0ec638827a
3. Taker flow (quote / approve / execute)
   - https://www.loom.com/share/e495d9d8cc2e42d59b8ba7434fc2108e
4. Multifill (sequential txs)
   - https://www.loom.com/share/3c0adc118c954515be268935c04f106c
5. Partial fill
   - https://www.loom.com/share/5b6dc4691fc3427b99e05f3f439f4e5e

---

## Architecture

```
┌─────────────────────────┐   HTTP (REST) + WebSocket (real-time)
│   Next.js UI (apps/web) │ <────────────────────────────────────┐
└───────────┬─────────────┘                                      │                    
            │                                                    │
            │ REST (markets, orderbook, trades, pricing)         │
            │ WS  (orderbook, orders, trades streams)            │
            ▼                                                    │
┌─────────────────────────┐       Prisma     ┌───────────────────┴─────────────┐
│  NestJS API (apps/api)  │ ───────────────► │            Postgres             │
│- order matching         │                  │  orders / trades / events / ... │ 
│  (in-memory LOB)        │                  └─────────────────────────────────┘  
│- real-time data gateway │                     
│  (WebSocket)            │                    
│- fees + trading         │
│  constraints            │
│- metrics, logs          │
│  & monitoring           │
│- background jobs        │
└───────────┬─────────────┘
            │ JSON-RPC (read-only)
            │ on-chain state & event reconciliation
            ▼
┌─────────────────────────┐
│   0x Exchange Proxy EP  │  (Base mainnet / Sepolia depending on profile)
└─────────────────────────┘

```

---

## Quick Tour

- **Maker (limit order)** – create limit orders with tick-level precision, enforcing TIF policies and execution constraints.
- **Taker (market execution)** – request quote → (optional) approve → execute, with allowance validation and gas pre-checks.
- **Orderbook & Trades** – real-time top-10 order book with per-level timestamps and recent trades stream.
- **My Orders (live)** – real-time order lifecycle tracking (placed / partial / filled / cancelled / expired).
- **Balances & Allowances** – per-token balances with granular allowance management (enable / custom / revoke).
- **Status** – system health indicators (WebSocket, chain, account) with manual refresh controls.
- **Metrics** – system-level metrics: WS broadcasts/subscribers, tick loop p95 latency, orders/quotes/fills/cancels.

---

## Environments & Profiles

**Two deployments**:

### Base Mainnet (Read-Only)

- RPC_URL / RPC_URL_READONLY: Base Mainnet
- markets.json: Mainnet token addresses
- 0x addresses: Base Exchange Proxy / targets
- Read-only mode: mutating endpoints and UI actions disabled to prevent on-chain execution.

### Ethereum Sepolia (Interactive)

- RPC_URL / RPC_URL_READONLY: Ethereum Sepolia
- markets.json: Sepolia token addresses
- 0x addresses: Sepolia Exchange Proxy / targets
- Trading enabled (approve/execute) for low-cost, full end-to-end testing.

### Markets configuration

- Markets are defined in JSON files (mainnet vs sepolia).
- The active set is selected by the environment profile (CHAIN_ID / NEXT_PUBLIC_PROFILE).

### Fee Policy

- Sepolia (development environment): 0.10% → 0xe02c543d4e8c89ab1f76b414fc3c75adc44cec2a
- Base Mainnet (read-only): 0% (no transaction execution)

---

## Quickstart - Base Mainnet (Read-Only)

### Requirements

- Node 22
- pnpm
- Docker Desktop (for Postgres)
- Concurrently (already in repo deps)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start Postgres

```bash
pnpm db:up
```

### 3. Copy env files

    apps/api/.env.example → apps/api/.env
    apps/web/.env.local.example → apps/web/.env.local

### 4. Run API and Web

```bash
pnpm dev:stack:base
```

Open: http://localhost:3000

## Quickstart - Ethereum Sepolia (Interactive)

### 1. Copy env files

    apps/api/.env.sepolia.example → apps/api/.env.sepolia
    apps/web/.env.sepolia.local.example → apps/web/.env.sepolia.local

### 2. Run API and Web

```bash
pnpm dev:stack:sepolia
```

Open: http://localhost:3000

---

## Observability (Optional)

The API exposes Prometheus metrics:

```
GET http://localhost:3001/metrics
```

Includes:

- Order lifecycle counters
- Fills / cancels totals
- WS broadcast metrics
- Tick loop latency histogram

### Quick check (no Docker required)

1. Start API
2. Open:
   ```
   http://localhost:3001/metrics
   ```

### Prometheus (Optional)

```bash
docker run -d --name ste-prom   --add-host=host.docker.internal:host-gateway   -p 9090:9090   -v "$(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml:ro"   prom/prometheus --config.file=/etc/prometheus/prometheus.yml
```

Open:

```
http://localhost:9090
```

### Grafana (Optional)

```bash
docker run -d --name ste-grafana -p 3002:3000 grafana/grafana
```

Then:

- Open http://localhost:3002
- Add Prometheus datasource → `http://host.docker.internal:9090`
- Import dashboard:
  ```
  dashboards/ste-realtime.json
  ```

### Key metrics (examples used in the dashboard)

- WS Broadcasts rate (/s): emissions to book rooms per second.
- WS Subscribers: current subscribers across symbols.
- WS tick p95 (ms, 5m): loop latency percentile.
- Orders/Quotes/Fills/Cancels: both rate() and cumulative “totals”.

---

## Security & Guardrails

- No private keys stored anywhere
- Mainnet profile is read-only (API enforced)
- CORS allowlist per environment
- On-chain reconciliation for fills & cancels
- Explicit fee configuration per profile

---

## License

MIT
