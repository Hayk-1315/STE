# Full-Stack 0x-Based Hybrid DEX

End-to-end hybrid DEX architecture:

- Next.js / React trading UI
- NestJS API with off-chain order matching and in-memory limit order book
- PostgreSQL persistence via Prisma
- On-chain settlement via 0x Exchange Proxy
- WebSocket streams for order book, trades and orders
- Event watchers for on-chain fills & cancels reconciliation
- Smart Intents (SEA): conditional execution layer on top of the core engine
- Delegated CMR (opt-in, Sepolia): a user-owned Nexus Smart Account executes a Conditional Market Ready intent at READY with no wallet popup, via Biconomy Smart Sessions; manual CMR stays the default
- AI Assist (optional, behind flags): natural-language helper for conditional intents, with deterministic validation authoritative
- Prometheus metrics and Grafana dashboard

This project is a serious prototype of a hybrid DEX architecture: off-chain matching with on-chain settlement, a unified trading surface (Market / Limit / Conditional), and an advanced conditional-execution layer (Smart Intents) built on top of the deterministic core. It models realistic system behavior and key architectural decisions, validated through targeted automated testing.

---

## Quick Tour

- **Trading panel** – a single surface with Market, Limit, and Conditional modes, with quote, allowance, and gas/balance checks in one flow.
- **Limit (maker)** – create limit orders with tick-level precision and rule validation, signed client-side (EIP-712) and placed off-chain; supports marketable-limit caps.
- **Market (taker)** – request quote (optional), approve, execute through 0x, with allowance validation and gas pre-checks; fills reconciled via watchers.
- **Smart Intents (SEA)** – conditional workflows: Conditional Limit (CL) places a pre-signed passive order when a trigger fires; Conditional Market Ready (CMR) arms a market execution when the trigger and full-size liquidity are met. By default, execution requires manual wallet confirmation; the backend monitors and validates but never holds user keys or settles autonomously.
- **Delegated CMR (opt-in)** – for CMR only, a user-owned Nexus Smart Account can execute at READY without a wallet popup, authorized by a scoped, single-use Smart Session grant; the backend holds only a scoped session key, never the user key. Manual CMR stays the default and universal fallback.
- **AI Assist (optional)** – a natural-language helper that previews a CMR/CL draft to apply to the manual form; deterministic validation stays authoritative and it never signs or executes.
- **Orderbook & Trades** – real-time top-10 order book with per-level timestamps and a recent trades stream.
- **Orders** – live order lifecycle (placed / partial / filled / cancelled / expired).
- **Smart Intents panel** – active intents with a history view for terminal/placed rows.
- **Balances & Allowances** – per-token balances with granular allowance management (enable / custom / revoke).
- **Cancel orders** – advanced controls (pair-wide cancel and single order-hash cancel), collapsed by default.
- **Profiles** – Base mainnet read-only and Ethereum Sepolia interactive.
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

## Video Walkthrough

Short Loom demo showing the current delegated CMR flow:

- Delegated Conditional Market Ready Exchange Flow
  https://www.loom.com/share/d50174ad689249fa8c2844901a2c789b

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
>
> Delegated CMR (opt-in) adds a user-owned Nexus Smart Account (the 0x taker)
> + a Smart Session grant (DelegationGrant), executed at READY by an in-API
> DelegatedExecutorWorker; the resulting 0x Exchange Proxy fill is reconciled
> back into the same orderbook / My Orders / Recent Trades as a manual fill.
```

### How it works

- **Client (Next.js)** signs orders locally using EIP-712 and interacts with the backend via REST and WebSocket.
- **REST API** serves markets, orderbook snapshots, trades, quotes, balances, and Smart Intents.
- **WebSocket layer** streams real-time updates for orderbook, trades, and user orders.
- **API (NestJS)** performs off-chain matching using an in-memory order book (LOB) and enforces trading rules.
- **SEA monitor** evaluates Smart Intent triggers and readiness (CL / CMR) without holding keys or settling autonomously.
- **SEA AI Assist (optional)** turns natural language into a restricted Conditional-tab draft; deterministic validation stays the source of truth and it never signs or executes.
- **Postgres** persists orders (raw + derived state), trades, events, and intents for recovery and reconciliation.
- **0x Exchange Proxy** is used strictly for on-chain settlement (fills and cancels).
- **Watchers (JSON-RPC)** listen to on-chain events and reconcile backend state with blockchain activity.
- **Delegated CMR (opt-in)** – a user-owned Nexus Smart Account (0x taker) executes a CMR at READY via a scoped Smart Session grant (DelegationGrant); the in-API DelegatedExecutorWorker submits the fill userOp (scoped backend session key only), settles through the 0x Exchange Proxy, and a delegated post-fill reconciler feeds the fill into the same orderbook / My Orders / Recent Trades as a manual fill.

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

Conditional intents can be set up manually or previewed with the optional AI Assist layer; either way the steps below are identical and deterministic validation stays authoritative.

- **Conditional Limit (CL)** – the user pre-signs a passive 0x limit order; the backend validates and stores the intent; the monitor watches the trigger; when it fires and the order can still rest safely, the signed order is placed into the normal orderbook. Once placed, the underlying Order is managed through the normal Orders flow.
- **Conditional Market Ready (CMR)** – the backend monitors trigger and liquidity; READY requires the full requested size to be fillable at or better than the trigger; the user manually executes; a wallet-lock / execution token protects the execution window; the intent moves EXECUTING → EXECUTED or FAILED via watcher/sweeper reconciliation.
- **Delegated CMR (opt-in, CMR only)** – same monitor/READY logic as manual CMR, but the taker is a user-owned Nexus Smart Account authorized by a scoped Biconomy Smart Session grant. At READY the in-API DelegatedExecutorWorker submits the fill userOp (scoped backend session key only — never the user key) with no wallet popup, provided STE-side policy checks pass; the fill settles via the 0x Exchange Proxy and a delegated post-fill reconciler feeds it into orderbook / Recent Trades / My Orders like a manual fill. Grants are single-use, expiry-bound, and target-bound to 0x fillLimitOrder; funds live in the Smart Account and the user can revoke or withdraw (escape hatch). Manual CMR stays the default fallback.

---

## Design Decisions

- **Off-chain orderbook** – orders are matched off-chain for low latency and a CEX-like UX; the database persists state, it does not match.
- **0x Exchange Proxy for settlement** – on-chain execution uses standardized, battle-tested settlement; no custom settlement contracts.
- **Client-side EIP-712 signing** – orders are signed in the user's wallet; the backend never signs EIP-712 and never holds private keys.
- **User-confirmed execution (default)** – every manual on-chain action requires an explicit wallet confirmation; there is no autonomous settlement. Opt-in Delegated CMR is the sole exception (see below), and only via a user-signed, scoped Smart Session grant.
- **Smart Intents are monitored workflows, not custody** – the SEA monitor evaluates triggers/readiness deterministically and never holds user keys; manual intents auto-execute nothing. (Opt-in Delegated CMR adds scoped Smart-Session execution — see below.)
- **Delegated CMR uses a Nexus Smart Account, not EIP-7702** – the opt-in delegated path routes CMR execution through a user-owned Nexus Smart Account authorized by a scoped, single-use, expiry- and target-bound Smart Session grant (0x fillLimitOrder only). EIP-7702 browser delegation is deferred: MetaMask / injected wallets could not dApp-drive authorization to the Nexus implementation. The backend holds only a scoped session/redeemer key — never the user key — and can execute at READY without a wallet popup if policy checks pass; the user can revoke and withdraw via an escape hatch.
- **CMR uses fixed FOK in the UI** – CMR v1 means full requested size or no execution start.
- **In-memory matching engine (LOB)** – matching is in-memory for speed and deterministic execution.
- **WebSocket-first real-time layer** – orderbook, trades, and user orders are streamed, not polled.
- **Event-driven reconciliation (watchers)** – backend reconciles on-chain fills/cancels via JSON-RPC.
- **Multi-network profiles** – Base mainnet is read-only; Sepolia exercises full execution.
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
- READ_ONLY=true and PROFILE=mainnet: mutating endpoints, UI write actions, and watchers disabled
- Delegated CMR writes are hard-disabled here (read-only profile), on both backend and UI
- AI Assist UI is display-only here: visible but non-interactive, with no API calls and no provider key required

### Ethereum Sepolia (Interactive)

- RPC vars: Ethereum Sepolia
- markets.json: Sepolia token addresses
- 0x addresses: Sepolia Exchange Proxy / targets
- Trading enabled (approve / execute) and Smart Intents (CL / CMR) when SEA flags are configured
- Delegated CMR (Nexus Smart Account) is available behind delegated flags (default OFF), injected wallet only; see [Delegated CMR](#delegated-cmr-nexus-smart-account)
- AI Assist is optional behind feature flags; live previews require the user's own Anthropic API key

### Markets configuration

- Markets are defined in JSON files (mainnet vs sepolia).
- The active set is selected by the environment profile (CHAIN_ID / NEXT_PUBLIC_PROFILE).

### Fee Policy

- Sepolia: taker fee is env-configured (recipient set via environment).
- Base Mainnet (read-only): no transaction execution.

> Configure profiles through environment variables such as READ_ONLY, PROFILE / NEXT_PUBLIC_PROFILE, CHAIN_ID, RPC URLs, and SEA flags. Do not commit secrets.

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

Open `apps/api/.env` and replace YOUR_KEY in the RPC URL with your Alchemy
(or other provider) API key.

> Real .env files are gitignored and must not be committed. They are separate
> from the environment variables configured in Vercel / Render dashboards.

### 4. Run API and Web

```bash
pnpm dev:stack:base
```

This script applies the DB schema, wipes and re-seeds local market data, then
starts API + Web. The profile is read-only: write actions and watchers are
disabled. AI Assist appears as display-only here (no API key or calls).

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

- RPC_URL / RPC_URL_READONLY — replace YOUR_KEY with your Alchemy
  (or other) Sepolia RPC key.
- SEA_LOCK_NONCE_SECRET and SEA_EXECUTION_TOKEN_SECRET — generate two
  distinct random values (e.g. openssl rand -base64 32). Both are required for
  CMR wallet-lock; without them CMR execution fails at runtime.
- ANTHROPIC_API_KEY (optional) — only needed to run the AI Assist "Preview
  intent" locally. Add your own Anthropic key (server-side; the file is
  gitignored). Without it the AI Assist card shows an "unavailable" state and the
  manual form still works. API usage is billed to the key owner. See
  [AI Assist](#ai-assist-smart-execution-assistant).

The example file already sets SEA_MONITOR_ENABLED=1,
SEA_CMR_PREPARE_ENABLED=1, and DEV_ONCHAIN_WATCHER=1 for the full
interactive experience. Set DEV_ONCHAIN_WATCHER=0 if your RPC quota is
limited and you want to skip on-chain reconciliation.

Open `apps/web/.env.sepolia.local` and set:

- NEXT_PUBLIC_RPC_URL — same Sepolia RPC key as above.
- NEXT_PUBLIC_WEB3AUTH_CLIENT_ID — your Web3Auth client ID from
  [console.web3auth.io](https://console.web3auth.io). Required for wallet
  connection; without it no wallet can connect.

> Real .env files are gitignored and must not be committed. They are separate
> from the environment variables configured in Vercel / Render dashboards.

### 3. Run API and Web

```bash
pnpm dev:stack:sepolia
```

This script applies the DB schema, wipes and re-seeds local market data,
then starts API + Web. Smart Intents (CL / CMR) are active once the env values
above are filled in.

Open: http://localhost:3000

> Per-process launchers are also available: `pnpm dev:api:sepolia`, `pnpm dev:web:sepolia`, `pnpm dev:api:mainnet`, `pnpm dev:web:mainnet`.

> Delegated CMR is opt-in and OFF by default — this QuickStart needs no delegated env. To QA it on Sepolia, enable the delegated flags (see [Delegated CMR](#delegated-cmr-nexus-smart-account)).

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

## AI Assist (Smart Execution Assistant)

A natural-language helper layered on top of the deterministic engine, inside the Conditional tab (CMR / CL). It is behind feature flags and disabled by default. The LLM is a restricted _extractor_; the deterministic engine stays the source of truth.

**What Phase 1 does**

- Natural-language input in the Conditional tab for both Conditional Market Ready (CMR) and Conditional Limit (CL).
- Extracts restricted, human-level fields only: side, size, trigger price, and CL limit price when applicable.
- Asks a clarification question when a required field is missing or vague (e.g. "buy when it's cheap" → asks for a trigger price).
- Returns an unsupported response for out-of-scope strategies (RSI, moving averages, news, forecasts, portfolio advice).
- Generates the summary and explainability copy (what it means / what it does not guarantee / that you still confirm) from deterministic code.
- Shows factual notes from deterministic rules (e.g. trigger already met; a CL limit that would cross the book; a CMR size below the minimum notional at the trigger price).
- Hints when the text sounds like the other submode (e.g. a passive limit typed in the CMR tab) — it never auto-switches.
- Fills the existing manual form only after you click "Apply to form"; nothing is created automatically.

**What Phase 1 does not do**

- No auto-execution, no signing, no trading authority.
- No general chatbot, no market or price advice.
- No database conversation store.
- No bypassing deterministic validation — the LLM output is never authoritative.

**How it works**

```
user text
  → POST /sea/ai/parse
  → restricted JSON extraction (LLM)
  → deterministic backend validation (source of truth)
  → code-generated summary / clarification / unsupported response
  → Apply to existing form
  → existing signed create flow
```

The LLM only extracts side, size, trigger price, and CL limit price. Backend code derives the reference price, trigger type, execution authority, and TIF / enforcement, runs tick / min-size / min-notional checks, and produces all user-facing copy. You review, edit, and sign every transaction exactly like a manually-built intent.

**Environment variables**

| Variable                   | Side | Purpose                                                 |
| -------------------------- | ---- | ------------------------------------------------------- |
| SEA_AI_ENABLED             | API  | 1 enables POST /sea/ai/parse; 0/absent → aiUnavailable. |
| ANTHROPIC_API_KEY          | API  | Server-side only. Empty ⇒ AI unavailable. Never commit. |
| SEA_AI_MODEL               | API  | Optional model override; defaults to claude-haiku-4-5.  |
| NEXT_PUBLIC_SEA_AI_ENABLED | Web  | true shows the AI Assist card.                          |

**Cost** — a real Anthropic API key means paid API usage billed to the key owner, separate from any claude.ai Pro/Max subscription (a Pro plan does not cover API calls). Each "Preview intent" can make one API call when AI is fully enabled and a key is set.

**By profile**

- **Base mainnet / read-only** — the card is visible but display-only: the textarea, Preview, and Apply are disabled, the UI never calls the parse endpoint, and the backend needs no key, so there is no API cost.
- **Local Sepolia** — optional and live: set SEA_AI_ENABLED=1 and add your own ANTHROPIC_API_KEY to the gitignored apps/api/.env.sepolia; API usage is billed to you.
- **Deployed Sepolia** — the parse endpoint is unauthenticated and unthrottled, so keep AI disabled by default (SEA_AI_ENABLED=0). Enable only for controlled QA, then turn it back off (SEA_AI_ENABLED=0 / clear the key).

**Phase 2 (optional, later)** — may add deterministic explanations for existing intents (why one is waiting / ready / rejected / not executable), based only on engine facts. It must not add auto-execution, advice, session keys, delegated execution, or chatbot behavior.

---

## Delegated CMR (Nexus Smart Account)

Opt-in, **CMR-only** delegated execution: a user-owned Nexus Smart Account executes a Conditional Market Ready intent at READY without a wallet popup, authorized by a scoped Biconomy Smart Session grant. Manual CMR remains the default and universal fallback. It is behind feature flags and disabled by default.

**Model**

- The user EOA owns a Nexus Smart Account; funds for delegated execution live in that account, which is the 0x taker.
- The user signs a scoped Smart Session grant per delegated CMR — single-use, expiry-bound, and target-bound to 0x fillLimitOrder. The backend holds only a scoped session / redeemer key, never the user key.
- At READY, the in-API DelegatedExecutorWorker submits the fill userOp with no wallet popup if STE-side policy checks pass; the confirmed fill is reconciled into orderbook / Recent Trades / My Orders exactly like a manual fill.
- The user can revoke the grant and withdraw funds (base / quote / ETH) via the escape hatch at any time.
- Nexus SA, not EIP-7702 — EIP-7702 browser delegation is deferred because MetaMask / injected wallets could not dApp-drive authorization to the Nexus implementation.

**Scope & flags (default OFF)**

- Sepolia QA supported; Base Mainnet stays read-only / hard-disabled for delegated writes (backend and UI).
- No paymaster / sponsorship in v1 — the Smart Account pays its own gas.
- Web3Auth delegated owner-userOp signing remains unproven / disabled; use an injected wallet (e.g. MetaMask).
- Gated by delegated flags, default OFF unless explicitly enabled: API SEA_DELEGATED_ENABLED, SEA_DELEGATED_EXEC_ENABLED, SEA_DELEGATED_PROVIDER (biconomy for real QA), DELEGATION_SESSION_SIGNER_PK (scoped redeemer key, not a user key), optional DELEGATION_NEXUS_FACTORY / DELEGATION_FEE_BUFFER_BPS; Web NEXT_PUBLIC_SEA_DELEGATED_ENABLED. See the gitignored .env.sepolia examples for the full list.

---

## License

STE Exchange is licensed under AGPL-3.0-or-later.
Commercial/private licensing is available on request.
