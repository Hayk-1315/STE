# STE — Full-Stack 0x-Based Hybrid DEX

End-to-end hybrid DEX architecture:

- Next.js / React trading UI
- NestJS API with off-chain order matching and in-memory limit order book
- PostgreSQL persistence via Prisma
- On-chain settlement via 0x Exchange Proxy
- WebSocket streams for order book, trades and orders
- Event watchers for on-chain fills & cancels reconciliation
- Prometheus metrics and Grafana dashboard

This project is a serious prototype of a hybrid DEX architecture, designed to explore order matching, settlement flows and on-chain/off-chain coordination in decentralized trading systems. While not production-ready, it focuses on modeling realistic system behavior, key architectural decisions, and validated core flows through targeted automated testing rather than production hardening.

---

## Quick Tour

- **Maker (limit order)** – create limit orders with tick-level precision, enforcing TIF policies and execution constraints.
- **Taker (market execution)** – request quote (optional), approve, execute, with allowance validation and gas pre-checks.
- **Orderbook & Trades** – real-time top-10 order book with per-level timestamps and recent trades stream.
- **My Orders (live)** – real-time order lifecycle tracking (placed / partial / filled / cancelled / expired).
- **Balances & Allowances** – per-token balances with granular allowance management (enable / custom / revoke).
- **Status** – system health indicators (WebSocket, chain, account) with manual refresh controls.
- **Metrics** – system-level metrics: WS broadcasts/subscribers, tick loop p95 latency, orders/quotes/fills/cancels.

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
┌─────────────────────────┐
│  Next.js UI (apps/web)  │
│- EIP-712 order signing  │
│     (client-side)       │
└───────────┬─────────────┘
          ▲ │ HTTP (REST) + WebSocket (real-time)
          │ │ REST (markets, orderbook, trades, pricing)
          │ │ WS  (orderbook, orders, trades streams)
          │ ▼
┌─────────────────────────┐                        ┌───────────────────────────┐
│  NestJS API (apps/api)  │         Prisma         │       DB (Postgres)       │
│- order matching         │  ───────────────────►  │     - orders (raw + LOB)  │
│  (in-memory LOB)        │  ◄───────────────────  │     - trades              │
│- real-time data gateway │                        │     - events              │
│  (WebSocket)            │                        └───────────────────────────┘
│- fees + trading         │
│  constraints            │
│- metrics, logs          │
│  & monitoring           │
│- background jobs        │
│ (ticks, reconciliation )│
└───────────┬─────────────┘
            │ JSON-RPC (read-only)
            │ watchers: fills / cancels reconciliation
            ▼
┌─────────────────────────┐
│    0x Exchange Proxy    │
│  (on-chain settlement)  │
└─────────────────────────┘
(Base mainnet / Sepolia depending on profile)

> Note: transactions are sent directly from the
user wallet to the 0x Exchange Proxy (not via backend)

```

### How it works

- **Client (Next.js)** signs orders locally using EIP-712 and interacts with the backend via REST and WebSocket.
- **REST API** is used for fetching data such as markets, orderbook snapshots, trades, and balances.
- **WebSocket layer** streams real-time updates for orderbook, trades, and user orders.
- **API (NestJS)** performs off-chain order matching using an in-memory order book (LOB) and enforces trading rules.
- **Postgres** persists orders (raw + derived state), trades, and events for recovery, reconciliation, and analytics.
- **0x Exchange Proxy** is used strictly for on-chain settlement, including fills and cancels.
- **Watchers (JSON-RPC)** listen to on-chain events and reconcile backend state with blockchain activity.

---

## Execution Flow (End-to-End)

This section describes how an order flows through the system, from creation to on-chain settlement and reconciliation.

1. **Maker signs order (EIP-712)**
   - User creates a limit order
   - Order is signed client-side using EIP-712

2. **Order stored off-chain**
   - API validates order (price, size, expiry)
   - Stored in DB + in-memory orderbook

3. **Orderbook broadcast (WebSocket)**
   - Top-of-book snapshots streamed in real-time
   - Clients subscribe per market

4. **Matching / Quote request**
   - Taker requests a quote (REST)
   - Matching logic selects best available orders

5. **Pre-trade validation**
   - Balance check
   - Allowance check (ERC20 approve)
   - Gas estimation

6. **On-chain settlement via 0x**
   - Transaction built using 0x Exchange Proxy
   - User signs and sends transaction

7. **On-chain execution**
   - Order is filled or partially filled
   - State changes emitted as events

8. **Watcher reconciliation**
   - Backend listens to fills/cancels
   - Updates DB and rehydrates orderbook

9. **Client updates (WebSocket)**
   - Book, trades, and user orders updated in real-time

---

## Design Decisions

- **Off-chain orderbook**
  → Orders are stored and matched off-chain to achieve low latency and avoid gas costs for every interaction.  
  → Enables real-time trading UX similar to centralized exchanges.

- **0x Exchange Proxy for settlement**
  → On-chain execution is delegated to 0x for standardized, battle-tested settlement.  
  → Ensures secure signature validation and token transfers without custom smart contracts.

- **Client-side EIP-712 signing**
  → Orders are signed in the frontend using the user’s wallet.  
  → The backend never holds private keys, improving security and trust assumptions.

- **In-memory matching engine (LOB)**
  → Order matching is performed in-memory for speed and deterministic execution.  
  → The database is used for persistence, not for matching logic.

- **WebSocket-first real-time layer**
  → Orderbook, trades, and user orders are streamed via WebSocket.  
  → Avoids polling and provides a responsive trading experience.

- **Event-driven reconciliation (watchers)**
  → Backend listens to on-chain fills and cancels via JSON-RPC.  
  → Keeps off-chain state eventually consistent with blockchain state.

- **Separation of execution and state**
  → Execution happens on-chain (0x), while state and UX live off-chain.  
  → This hybrid model balances decentralization with performance.

- **Multi-network support (Base mainnet / Sepolia)**
  → Mainnet can be used in read-only mode for safe exploration.  
  → Sepolia is used for testing full execution flows without real funds.

- **Single-node architecture (v1)**
  → Matching engine, API, and WebSocket gateway run in a single service.  
  → Keeps the system simple while remaining extensible for future scaling.

---

## Trade-offs & Limitations

- Matching engine runs in a single node (no horizontal scaling yet)
- No on-chain orderbook (off-chain trust assumptions)
- No MEV protection or advanced execution strategies
- Simplified risk and margin model (spot-only)

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

## Testing

The project includes a focused automated test suite covering the most critical exchange flows and engine behavior.

Current coverage includes:

- Order placement and validation rules
- Quote generation and matching logic
- Full and partial fills
- Order cancellation flows
- Reconciliation paths for simulated on-chain settlement
- Core public API endpoints
- Invalid request and edge-case handling

Tests were designed to validate the exchange’s functional core rather than maximize superficial coverage metrics.

**Current status:** 21 passing automated tests.

This approach prioritizes confidence in the matching engine, order lifecycle, and API behavior while keeping the codebase lean and iteration-friendly at prototype stage.

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

## License

MIT
