# QA Log

Concise record of what has been manually exercised, what is known-flaky, and what is still pending. Source of truth for "is this safe to demo?" decisions.

## Manually checked

### Baseline regressions

- [x] Market buy/sell — IOC and FOK paths build tx and submit on Sepolia.
- [x] Market FOK shortfall toast (`FOK rejected: not enough liquidity ...`).
- [x] Limit make + cancel — pre-signed 0x order persists, appears in book, cancels cleanly.
- [x] Orderbook live updates via WebSocket.
- [x] Balances / allowances panel renders correct values per profile.

### SEA — Conditional Limit (CL)

- [x] Create CL with future trigger; appears as ACTIVE.
- [x] Cancel ACTIVE CL.
- [x] Trigger fires → TRIGGERED → PLACED; underlying Order shows in Orders panel.
- [x] `would_cross_at_fire` → FAILED with deterministic reason; no auto-retry.
- [x] PLACED hidden from live Smart Intents list; visible under `Show history`.

### SEA — Conditional Market Ready (CMR)

- [x] Create CMR; ACTIVE → READY when full size is fillable at trigger.
- [x] CMR TIF selector absent in UI; new rows persist `tif="FOK"`.
- [x] Pre-patch CMR rows with `tif="IOC"` still execute (backward-compat).
- [x] Read-only guard on Execute button when wallet not connected / read-only mode.

### Tooling / env

- [x] `clear-sea-intents-dev` refuses without `CONFIRM_CLEAR_SEA_INTENTS=1`.
- [x] `clear-sea-intents-dev` refuses with `READ_ONLY=true`.
- [x] `clear-sea-intents-dev` refuses with `PROFILE=mainnet`.
- [x] `clear-sea-intents-dev` refuses with a non-local `DATABASE_URL` host.
- [x] `clear-sea-intents-dev` destructive run deletes only `IntentEvent` + `Intent`; Order/Trade/etc. untouched.
- [x] Base mainnet web build hides write actions; "Read-only mode" affordances visible.
- [x] Sepolia + mainnet env launchers (`pnpm dev:api:*` / `pnpm dev:web:*`) load the right `.env*` files via `dotenv-cli`.

### UI polish pass (visual-only)

- [x] No visible "STE"/"SkyTrade" wording in the rendered UI.
- [x] Footer reads "Hybrid Exchange · self-custodial orderbook".
- [x] `bg-[#27374b]` background, card border/shadow, header divider + pill alignment/harmonization — accepted in iterative visual QA.
- [x] Text tones softened (MarketHeader/address pill, MarketSwitcher, wallet pill, balances) — accepted.
- [x] Compact "Demo fee…" line removed from TradePanel; bottom fee reminder still present.
- [x] Cancel orders collapsed by default; expands to the same pair-cancel + orderHash controls.
- [x] Smart Intents heading renders once (card title only); `Show history` + count intact.
- [x] Market/Limit/Conditional unchanged — visual/class-only edits; typecheck + lint + build green.
- [ ] Tiny non-zero amounts render as `<0.000001` — **Needs verification** with a real sub-precision balance.
- [ ] Base mainnet read-only still blocks writes on the deployed build — guards untouched (class-only); deployed smoke pending (see Pending QA).

## Known caveats

- Full CMR `EXECUTING → EXECUTED / tx_reverted` reconciliation requires a working RPC and `DEV_ONCHAIN_WATCHER=1`; the FillWatcher polls block ranges and Alchemy free-tier quota has repeatedly blocked end-to-end runs.
- Stale EXECUTING sweeper has been exercised in unit tests; live behavior with real RPC is **Needs verification**.
- Pre-patch DB rows from earlier phases (before Phase 4.x-b) may have null `executionToken` / `walletLockExpiresAt`; clean them with `clear-sea-intents-dev` before re-testing the lock flow.
- `fok_insufficient_liquidity` can fire between wallet-lock and `/match/quote` on thin Sepolia books; the user has already paid one EIP-191 popup. Lock expires inside `SEA_WALLET_LOCK_SEC` and monitor re-arms — documented trade-off, not a bug.

## Pending QA

- [ ] CMR full execution lifecycle on Sepolia with non-throttled RPC: ACTIVE → READY → wallet-lock → EXECUTING → EXECUTED.
- [ ] CMR `tx_reverted` path with a deliberately failing tx (e.g., insufficient allowance after lock).
- [ ] Stale EXECUTING sweeper end-to-end (let an EXECUTING row age past `SEA_EXECUTING_MAX_AGE_SEC` without a matching fill; confirm sweeper transitions to FAILED).
- [ ] Base mainnet read-only UI smoke: open `/market/<pair>` on the deployed build; confirm all panels render, no write affordances, no wallet popups.
- [ ] Visual polish: confirm `<0.000001` tiny-value rendering with a real sub-precision balance, and final look on the deployed build.
- [ ] Deploy smoke after Vercel/Render env refresh: hit `/healthz` (or equivalent), open `/market/...`, confirm WebSocket connects.
- [ ] Existing CMR `tif="IOC"` execute flow regression after the FOK UI removal (one round with a seeded IOC row).

## Validation tooling

- No dedicated markdown lint script exists in `package.json` — `pnpm format` / `pnpm format:check` runs Prettier across `**/*.md` via the root config. No new tooling added.

## 2026-06-09 — CMR readiness & execution hardening

### Fixed / verified

- [x] Local Sepolia CMR ACTIVE→READY fixed (root cause: `PROFILE=mainnet` leaking via `main.ts` dotenv; fix: `PROFILE=sepolia` in `.env.sepolia`). Verified live: monitor boots `cmr=on`, the trigger-3000 CMR flipped READY.
- [x] Wallet-lock authorization with >5s signing delay fixed (signed proposal is the source of truth; bounds + signature-against-supplied). Unit-covered; manual sign-delay path passed.
- [x] Wallet-lock idempotency: same lock → same token; different live lock → rejected. Unit-covered.
- [x] CMR v1 single-fill READY gate (prepare + freshQuote). Manual QA of the split-book case (stays ACTIVE) and single-order case (READY) passed; unit-covered.
- [x] CMR stale-window mitigation (FE 60s pre-send buffer + backend 45s marker grace + monitor re-arm block). Unit-covered (grace within/beyond, re-armed stale token, monitor block).

### Automated validation (latest run)

- `pnpm --filter api test -- sea` → 12 suites, 183 tests pass.
- `pnpm --filter api typecheck` / `lint` → clean.
- `pnpm --filter api test` → 22 suites, 292 tests pass.
- `pnpm --filter web typecheck` → clean; `pnpm --filter web lint` → 0 errors (6 pre-existing warnings in `api.ts`/`salt.ts`); `pnpm --filter web build` → success.
- `pnpm format:check` → all files match Prettier.

### Residual limitation (manual verification scope)

- If the user leaves the tx wallet modal open for many minutes beyond `walletLockUntilAt + 45s` then confirms, the fill can land on-chain while intent bookkeeping does not reconcile (marker rejects; FillWatcher links only EXECUTING). Funds are correct; intent may show ACTIVE/EXPIRED. Mitigations: watcher consumes the maker order (blunts double-fill); the FE message directs the user to verify wallet/chain activity. Full fix deferred (would need a pre-send EXECUTING state). Manual QA only (cannot be automated without a wallet/browser harness).
- No web test harness in `apps/web`; the FE pre-send guard and friendly error copy rely on typecheck/lint/build + manual QA.
