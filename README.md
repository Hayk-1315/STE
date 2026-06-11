# Full-Stack 0x-Based Hybrid DEX

End-to-end hybrid DEX architecture:

- Next.js / React trading UI
- NestJS API with off-chain order matching and in-memory limit order book
- PostgreSQL persistence via Prisma
- On-chain settlement via 0x Exchange Proxy
- WebSocket streams for order book, trades and orders
- Event watchers for on-chain fills & cancels reconciliation
- Smart Intents (SEA): conditional execution layer on top of the core engine
- Prometheus metrics and Grafana dashboard

This project is a serious prototype of a hybrid DEX architecture: off-chain matching with on-chain settlement, a unified trading surface (Market / Limit / Conditional), and an advanced conditional-execution layer (Smart Intents) built on top of the deterministic core. It models realistic system behavior and key architectural decisions, validated through targeted automated testing.

---

## Quick Tour

- **Trading panel** – a single surface with Market, Limit, and Conditional modes, with quote, allowance, and gas/balance checks in one flow.
- **Limit (maker)** – create limit orders with tick-level precision and rule validation, signed client-side (EIP-712) and placed off-chain; supports marketable-limit caps.
- **Market (taker)** – request quote (optional), approve, execute through 0x, with allowance validation and gas pre-checks; fills reconciled via watchers.
- **Smart Intents (SEA)** – conditional workflows: Conditional Limit (CL) places a pre-signed passive order when a trigger fires; Conditional Market Ready (CMR) arms a market execution when the trigger and full-size liquidity are met. Execution always requires manual wallet confirmation; the backend monitors and validates but never holds keys or settles autonomously.
- **Orderbook & Trades** – real-time top-10 order book with per-level timestamps and a recent trades stream.
- **Orders** – live order lifecycle (placed / partial / filled / cancelled / expired).
- **Smart Intents panel** – active intents with a history view for terminal/placed rows.
- **Balances & Allowances** – per-token balances with granular allowance management (enable / custom / revoke).
- **Cancel orders** – advanced controls (pair-wide cancel and single order-hash cancel), collapsed by default.
- **Profiles** – Base mainnet read-only demo and Ethereum Sepolia interactive.
- **Metrics** – WS broadcasts/subscribers, tick loop p95 latency, orders/quotes/fills/cancels.

---

## Live Profiles

### Base Mainnet (Read-Only, No Execution)

https://ste-web-five.vercel.app

- Browse markets
- Live orderbook & recent trades
- Balances & allowances
- Write actions and watchers disabled; no on-chain execution from this profile

### Ethereum Sepolia (Interactive)

https://ste-websepolia.vercel.app

- Connect wallet
- Approve tokens
- Place & cancel limit orders
- Execute taker trades, with partial fills & sequential multifill
- Smart Intents (CL / CMR)
- On-chain reconciliation via watchers

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
          │ │ REST (markets, orderbook, trades, quotes, intents)
          │ │ WS  (orderbook, orders, trades streams)
          │ ▼
┌─────────────────────────┐                        ┌───────────────────────────┐
│  NestJS API (apps/api)  │         Prisma         │       DB (Postgres)       │
│- order matching         │  ───────────────────►  │   - orders (raw + LOB)    │
│  (in-memory LOB)        │  ◄───────────────────  │   - trades / events       │
│- real-time gateway (WS) │                        │   - smart intents         │
│- SEA monitor            │                        └───────────────────────────┘
│  (CL / CMR triggers)    │
│- fees + constraints     │
│- metrics & monitoring   │
│- background jobs        │
│ (ticks, reconciliation) │
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
- **REST API** serves markets, orderbook snapshots, trades, quotes, balances, and Smart Intents.
- **WebSocket layer** streams real-time updates for orderbook, trades, and user orders.
- **API (NestJS)** performs off-chain matching using an in-memory order book (LOB) and enforces trading rules.
- **SEA monitor** evaluates Smart Intent triggers and readiness (CL / CMR) without holding keys or settling autonomously.
- **Postgres** persists orders (raw + derived state), trades, events, and intents for recovery and reconciliation.
- **0x Exchange Proxy** is used strictly for on-chain settlement (fills and cancels).
- **Watchers (JSON-RPC)** listen to on-chain events and reconcile backend state with blockchain activity.

---

## Execution Flow (End-to-End)

### A. Limit / Market

1. **Maker signs order (EIP-712)** – user creates a limit order, signed client-side.
2. **Order stored off-chain** – API validates (price, size, expiry); stored in DB + in-memory orderbook.
3. **Orderbook broadcast (WebSocket)** – top-of-book snapshots streamed per market.
4. **Matching / quote** – taker requests a quote (REST); matching selects best available orders.
5. **Pre-trade validation** – balance, allowance (ERC20 approve), gas estimation.
6. **On-chain settlement via 0x** – transaction built for the 0x Exchange Proxy; user signs and sends.
7. **Execution** – order filled or partially filled; state changes emitted as events.
8. **Watcher reconciliation** – backend reconciles fills/cancels and rehydrates the orderbook.
9. **Client updates (WebSocket)** – book, trades, and user orders update in real-time.

### B. Smart Intents (SEA)

- **Conditional Limit (CL)** – the user pre-signs a passive 0x limit order; the backend validates and stores the intent; the monitor watches the trigger; when it fires and the order can still rest safely, the signed order is placed into the normal orderbook. Once placed, the underlying Order is managed through the normal Orders flow.
- **Conditional Market Ready (CMR)** – the backend monitors trigger and liquidity; READY requires the full requested size to be fillable at or better than the trigger; the user manually executes; a wallet-lock / execution token protects the execution window; the intent moves EXECUTING → EXECUTED or FAILED via watcher/sweeper reconciliation.

---

## Design Decisions

- **Off-chain orderbook** – orders are matched off-chain for low latency and a CEX-like UX; the database persists state, it does not match.
- **0x Exchange Proxy for settlement** – on-chain execution uses standardized, battle-tested settlement; no custom settlement contracts.
- **Client-side EIP-712 signing** – orders are signed in the user's wallet; the backend never signs EIP-712 and never holds private keys.
- **User-confirmed execution** – every on-chain action requires an explicit wallet confirmation; there is no autonomous settlement.
- **Smart Intents are monitored workflows, not custody** – the SEA monitor evaluates triggers/readiness deterministically; it does not delegate keys or auto-execute.
- **CMR uses fixed FOK in the UI** – CMR v1 means full requested size or no execution start.
- **PLACED Smart Intents are UI-history** – once a CL is placed, the underlying normal Order takes over and is managed in the Orders panel.
- **In-memory matching engine (LOB)** – matching is in-memory for speed and deterministic execution.
- **WebSocket-first real-time layer** – orderbook, trades, and user orders are streamed, not polled.
- **Event-driven reconciliation (watchers)** – backend reconciles on-chain fills/cancels via JSON-RPC.
- **Multi-network profiles** – Base mainnet is a read-only demo; Sepolia exercises full execution.
- **Single-node architecture (v1)** – matching engine, API, and WebSocket gateway run in one service.

---

## Trade-offs & Limitations

- Matching engine runs in a single node (no horizontal scaling yet)
- No on-chain orderbook (off-chain trust assumptions)
- RPC quota and watcher health affect live QA and reconciliation
- No production hardening; no MEV protection or advanced execution strategies
- Simplified risk and margin model (spot-only)

---

## Environments & Profiles

**Two profiles**, selected by environment:

### Base Mainnet (Read-Only)

- RPC vars: Base Mainnet
- markets.json: Mainnet token addresses
- 0x addresses: Base Exchange Proxy / targets
- `READ_ONLY=true`, `PROFILE=mainnet`: mutating endpoints, UI write actions, and watchers disabled

### Ethereum Sepolia (Interactive)

- RPC vars: Ethereum Sepolia
- markets.json: Sepolia token addresses
- 0x addresses: Sepolia Exchange Proxy / targets
- Trading enabled (approve / execute) and Smart Intents (CL / CMR) when SEA flags are configured

### Markets configuration

- Markets are defined in JSON files (mainnet vs sepolia).
- The active set is selected by the environment profile (`CHAIN_ID` / `NEXT_PUBLIC_PROFILE`).

### Fee Policy

- Sepolia: taker fee is env-configured (recipient set via environment).
- Base Mainnet (read-only): no transaction execution.

> Configure profiles through environment variables such as `READ_ONLY`, `PROFILE` / `NEXT_PUBLIC_PROFILE`, `CHAIN_ID`, RPC URLs, and SEA flags. Do not commit secrets.

---

## Quickstart - Base Mainnet (Read-Only)

### Requirements

- Node 22
- pnpm
- Docker Desktop (for Postgres)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start Postgres

```bash
pnpm db:up
```

### 3. Copy env files

```
apps/api/.env.example        → apps/api/.env
apps/web/.env.local.example  → apps/web/.env.local
```

Open `apps/api/.env` and replace `YOUR_KEY` in the RPC URL with your Alchemy
(or other provider) API key.

> Real `.env` files are gitignored and must **not** be committed. They are
> separate from the environment variables configured in Vercel / Render
> dashboards.

### 4. Run API and Web

```bash
pnpm dev:stack:base
```

This script applies the DB schema, wipes and re-seeds local market data, then
starts API + Web. The profile is read-only: write actions and watchers are
disabled.

Open: http://localhost:3000

---

## Quickstart - Ethereum Sepolia (Interactive)

### Requirements

Same as Base: Node 22, pnpm, Docker Desktop with Postgres running
(`pnpm db:up`).

### 1. Copy env files

```
apps/api/.env.sepolia.example          → apps/api/.env.sepolia
apps/web/.env.sepolia.local.example    → apps/web/.env.sepolia.local
```

### 2. Fill in required values

Open `apps/api/.env.sepolia` and set:

- **`RPC_URL` / `RPC_URL_READONLY`** — replace `YOUR_KEY` with your Alchemy
  (or other) Sepolia RPC key.
- **`SEA_LOCK_NONCE_SECRET`** and **`SEA_EXECUTION_TOKEN_SECRET`** — generate
  two distinct random values (e.g. `openssl rand -base64 32`). Both are required
  for CMR wallet-lock; without them CMR execution fails at runtime.

The example file already sets `SEA_MONITOR_ENABLED=1`,
`SEA_CMR_PREPARE_ENABLED=1`, and `DEV_ONCHAIN_WATCHER=1` for the full
interactive experience. Set `DEV_ONCHAIN_WATCHER=0` if your RPC quota is
limited and you want to skip on-chain reconciliation.

Open `apps/web/.env.sepolia.local` and set:

- **`NEXT_PUBLIC_RPC_URL`** — same Sepolia RPC key as above.
- **`NEXT_PUBLIC_WEB3AUTH_CLIENT_ID`** — your Web3Auth client ID from
  [console.web3auth.io](https://console.web3auth.io). Required for wallet
  connection; without it no wallet can connect.

> Real `.env` files are gitignored and must **not** be committed. They are
> separate from the environment variables configured in Vercel / Render
> dashboards.

### 3. Run API and Web

```bash
pnpm dev:stack:sepolia
```

This script applies the DB schema, **wipes and re-seeds local market data**,
then starts API + Web. Smart Intents (CL / CMR) are active once the env values
above are filled in.

Open: http://localhost:3000

> Per-process launchers are also available: `pnpm dev:api:sepolia`, `pnpm dev:web:sepolia`, `pnpm dev:api:mainnet`, `pnpm dev:web:mainnet`.

---

## Testing

The project includes a focused automated test suite covering the critical exchange flows and engine behavior.

Coverage includes:

- Order placement and validation rules
- Quote generation and matching logic
- Full and partial fills
- Order cancellation and pair-cancel flows
- Raw order / signature persistence regression
- Smart Intent (SEA) validation and CMR lifecycle pieces
- On-chain watcher reconciliation paths (where applicable)
- Core public API endpoints and edge-case handling

Run the tests:

```bash
pnpm --filter api test        # backend (jest)
pnpm --filter web typecheck   # frontend types
pnpm --filter web lint        # frontend lint
pnpm --filter web build       # frontend build
```

Tests validate the functional core rather than maximize superficial coverage metrics.

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
- Orders/Quotes/Fills/Cancels: both rate() and cumulative "totals".

---

## Planned: AI/NL Intent Assistant

A natural-language layer on top of the deterministic engine is planned, not implemented. The intended behavior:

- The user types a natural-language intent.
- The assistant proposes a structured CL or CMR draft.
- The user reviews and edits the draft before anything is created.
- Backend validation remains the source of truth.

It will not auto-execute, auto-sign, or take custody, and it is not investment advice.

---

## License

STE Exchange is licensed under AGPL-3.0-or-later.
Commercial/private licensing is available on request.
