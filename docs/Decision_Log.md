# Decision Log

- 2025-11-06: Accepted temporary risk: GitHub rulesets are not enforced in a personal private repo.
  Reason: new GitHub UI; it does not block our workflow. Mitigation: PR discipline + CI checks once configured.
- 2025-11-06: Monorepo with pnpm; apps/web (Next.js) and apps/api (NestJS) per scope F0.
- 2025-11-08: Chosen Prisma as ORM for API; reason: strong typing + migration flow. Impact: dev speed, clear DB schema.
- 2025-11-08: Adopted GitHub Actions CI (lint → typecheck → test → build). Reason: enforce quality gates on PRs.
- 2025-11-08: Adopted Renovate (weekly). Reason: keep dependencies fresh under CI control. Impact: steady maintenance.
- 2025-11-08: Corrected .gitignore to track pnpm-lock.yaml (guardrail: pinned versions + lockfile).
- 2025-11-09: Decision: Backend 0x layer uses @0x/protocol-utils (EIP-712 types/hash) and ethers for verification; tx-builders target Exchange Proxy v4. Allowance spender is config-driven with a Permit2/AllowanceHolder fallback.
- 2025-11-09: Rationale: Align with 0x v4 spec and minimize client complexity: UI signs EIP-712 and sends EP tx built by the backend.
- 2025-11-09: Impact: Frontend signs with EIP712 (type 2). Backend verifies signature & schema and returns {to,data,value} for fills and cancels.
- 2025-11-15: LOB keying & snapshot persistence. Decision: Keep the in-memory LOB keyed by market symbol and persist snapshots using DB market ID. Rationale: Symbols are human-friendly and stable for dev tooling; DB IDs are the correct FK for persistence and queries. Impact: Snapshot service translates symbol → marketId on write; dev snapshot endpoint accepts symbol for convenience.
- 2025-11-15: PersistenceRepository abstraction. Decision: Introduce PersistenceRepository as the only Prisma-facing layer for matching (rules loading, events, trades, order updates). Rationale: Encapsulate DB concerns and keep OrderBookService focused on matching logic + validations. Impact: Clear separation of concerns; easier to evolve schema and to add retries/metrics later.
- 2025-11-15: Server-side trading rules. Decision: Enforce minSize, minNotional, and priceTick on place() using market config from DB. Rationale: Determinism and safety before exposing public APIs; mirrors what the frontend will validate. Impact: Invalid orders are rejected early; consistent behavior across clients.
- 2025-11-15: Snapshots @ 1 Hz (top-25). Decision: Capture book snapshots every second with depth=25. Rationale: Sufficient for dev and initial monitoring; adjustable later if WS/rehydration demand changes. Impact: book_snapshots grows predictably; cleanup/compaction to be scheduled in later phase.
- 2025-11-15: Dev endpoints wired to core engine. Decision: Replace the temporary EngineService with EngineController → OrderBookService. Rationale: One single engine in all environments; avoids drift between dev and prod logic. Impact: Dev routes now exercise the real matching path; easier smoke/E2E.
- 2025-11-15: Idempotent place() by orderHash. Decision: place() removes any existing in-memory order with the same orderHash before inserting. Rationale: Align semantics with orders PK and avoid duplicates during retries. Impact: Stable behavior under client/network retries.
