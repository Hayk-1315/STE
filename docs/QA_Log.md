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

- Full CMR `EXECUTING → EXECUTED / tx_reverted` reconciliation requires a working RPC and `DEV_ONCHAIN_WATCHER=1` (or `DEV_FILL_WATCHER=1`); the FillWatcher polls block ranges and Alchemy free-tier quota has repeatedly blocked end-to-end runs. Phase RPC-1 (2026-06-20) makes a 429 pause the watcher (cooldown/backoff, cursor not advanced) instead of hammering every tick, but does not raise the quota — a non-throttled RPC is still needed for the full lifecycle.
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

## 2026-06-15 — SEA AI Assist (Phase 1A/1B, behind flags)

### Automated validation (latest run)

- `pnpm --filter api test -- sea` → 15 suites, **226 tests pass**, incl. **43 new AI tests** (schema, deterministic validator, parser/provider boundary) using a **mock provider only — no live AI calls**.
- `pnpm --filter api typecheck` / `lint` → clean.
- `pnpm --filter web typecheck` → clean; `pnpm --filter web lint` → 0 errors (6 pre-existing warnings in `api.ts`/`salt.ts`); `pnpm --filter web build` → success.
- `pnpm format:check` → all files match.
- Build-time scan: no `anthropic`/API-key string in `apps/web/src` or the built `.next` bundle.

### Audited + fixed

- Stale-metadata guard: `rawText`/`parserMeta` are attached on create **only when the form still matches the applied AI draft** (subMode + market + side + size + trigger + CL limit). Manual edits and CL↔CMR / market switches detach it; manual creates send nothing. Verified by code inspection + web typecheck/build (no web unit-test harness, per project convention).

### Pending manual QA (Sepolia, flags on + real `ANTHROPIC_API_KEY`)

- [ ] CMR/CL: NL → validDraft → Apply → existing Create succeeds; created intent persists `rawText` + `parserMeta` and behaves identically to a manually-formed intent.
- [ ] "cheap" / "when it drops" → one clarification question (NOT unsupported); RSI / moving averages / news / forecast / portfolio advice → unsupportedIntent.
- [ ] CL-style text typed in the CMR tab → clarification + switch hint, no auto-switch.
- [ ] `SEA_AI_ENABLED=0` or missing `ANTHROPIC_API_KEY` → `aiUnavailable`; manual CMR/CL form fully works.
- [ ] Read-only / mainnet: AI Assist hidden by default; Create disabled as today.
- [ ] Tick-misaligned / below-min-size / CMR-BUY-too-small → clarification(correction) with the computed fix.

## 2026-07-07 — Delegated CMR: Phase 0 spike + Phase 1 scaffold

### Phase 0 on-chain spike (Ethereum Sepolia, throwaway sandbox OUTSIDE the repo)

- [x] Nexus-SA mock abuse matrix 10/10: install/one-exec pass; 2nd-exec (usage=1), expired, revoked, wrong-target, wrong-selector, over-cap all rejected.
- [x] EIP-7702 path: EOA delegated to Nexus; funds stayed in the EOA; session key executed; usage=1/expiry enforced.
- [x] Real 0x `fillLimitOrder` filled through a session on the delegated EOA (WETH +0.2 / USDC −2.02 from the EOA); second execution rejected (usage=1). Tx `0x59ce23b3…`.
- Note: the throwaway Sepolia key/API key used in the spike must be rotated/discarded; they never entered the repo.

### Phase 1 scaffold — automated validation (latest run)

- `pnpm --filter api test -- sea` → **23 suites, 277 tests pass** (51 new delegated tests: config, guards, policy builder, validator, mock provider, executor worker, service). Existing SEA suites (manual CMR, CL, readiness, monitor, AI) unchanged and green.
- `pnpm --filter api typecheck` → clean. `pnpm --filter api lint` → clean (0 errors/warnings).
- `pnpm format:check` → all files match Prettier.
- `prisma generate` succeeded with the new models. Migration `20260707120000_delegated_cmr_scaffold` is hand-authored; **apply with `prisma migrate deploy` against a DB** (not applied here — no DB in the scaffold run).
- Web: no web files touched in Phase 1 (no frontend UX yet), so web typecheck/lint not required.

### Not yet done (Phase 2+, out of scope for Phase 1)

- [ ] Apply the migration on a real DB and confirm the two tables/enums create cleanly.
- [ ] Live Biconomy provider (behind the existing interface) + delegated executor worker on Sepolia.
- [ ] Frontend delegated-CMR UX (toggle/preview/revoke), read-only on mainnet.
- [ ] End-to-end delegated CMR on Sepolia wired to the real monitor/READY path.

## 2026-07-07 — Delegated CMR: Phase 2 backend (real provider + executor)

### Automated validation (latest run)

- `pnpm --filter api test -- sea` green (delegated: 55 pass + 1 gated-skip). New/updated tests: config, guards, policy builder (fill bound + spend cap), validator, mock provider (prepare/finalize; execute never confirms), session signer (loads only when enabled; no raw-key accessor), service (prepare/finalize/revoke gating + ACTIVE persist), executor (gating + `processOne`: confirmed→EXECUTED, unverified→FAILED, pre-submit→release-to-READY, validation-fail→no-claim, lost-race→no-execute).
- `pnpm --filter api typecheck` / `lint` clean. `pnpm format:check` clean.
- Deps added to `apps/api`: `@biconomy/abstractjs@1.2.4`, `viem@2.54.3` — **dynamic-imported only** inside the Biconomy adapter (never loaded in CI). `jest` (CJS) can't ESM-import `viem`, so signer address/signing is covered by the gated harness, not CI.
- Live Biconomy path: **not run in CI**; gated by `RUN_DELEGATED_LIVE=1` (skipped by default). Full on-chain E2E remains the throwaway spike (`ste-phase0-scratch/s4c-real0x.mjs`, outside the repo).

### Not yet done (Phase 3, out of scope here)

- [ ] Frontend delegated UX: capability check, 7702 authorization + session-enable signing, toggle/preview/revoke, read-only on mainnet.
- [x] ~~Live executor end-to-end on Sepolia~~ — **done 2026-07-12** (see below).
- [ ] Web3Auth v10 EIP-7702 signing support (coverage; else Nexus-SA/manual fallback).

## 2026-07-12 — Delegated CMR Phase 2: live execute E2E on Sepolia — **PASS (GO)**

A real, maker-signed Sepolia 0x v4 LimitOrder (WETH→USDC) was filled through the **actual Phase 2 provider path** (`BiconomyDelegationProvider.prepareGrant` → user-signed enable digest → `finalizeGrant` → STE `ZeroExTxBuildersService.buildFillLimitOrder` calldata → `execute`), on the **EIP-7702 delegated EOA** `0x6485…162B` as the 0x taker, backend session key `0x2Cb4…9297` as redeemer. Non-custodial: the backend never held the user key (the taker signed the enable digest externally, EIP-191).

- **Fill tx `0x03968c1e614001badc6918407268297c9b15a478fc386d19f28e3749a8b22291`** — status success, block 11255926, gas 1,122,345. `execute` returned `{ok:true, confirmed:true}` (receipt self-confirmed via the 0x `LimitOrderFilled` log).
- **LimitOrderFilled verified**: orderHash `0xed9eff…d91c` (= candidate), taker `0x6485…162B`, takerToken USDC filled `2,000,000`, makerToken WETH filled `0.2e18`, fee `20,000`. EOA balance deltas **WETH +0.2 / USDC −2.02** (funds in/out of the EOA itself).
- **Replay blocked**: a second `execute` with the same enable data was rejected pre-inclusion (usageLimit=1) — `{ok:false, reason:'submit_rejected'}`.

**Three adapter bugs found and fixed** (all in the untracked `sea/delegated/biconomy-delegation.provider.ts`; debugged by side-by-side comparison with the Phase 0 working `grantPermissionPersonalSign` path + inner-revert decode of AA23). See [Decision_Log](./Decision_Log.md) 2026-07-12.

1. **sessionValidator** used abstractjs's re-exported top-level `OWNABLE_VALIDATOR_ADDRESS` (stale `0x2483…`) instead of the deployed OwnableValidator `0x…0013fdB5` (module-sdk `GLOBAL_CONSTANTS.OWNABLE_VALIDATOR_ADDRESS`, what the working grant helper uses). → session-use sig unvalidatable → AA23.
2. **`ignoreSecurityAttestations`** left at the `getEnableSessionDetails` default (`false`); the working path sets it `true`. With `false` the SmartSession enforces ERC-7484 Registry attestations on the (unattested-on-Sepolia) validator/policies → enable reverts AA23.
3. **SpendingLimitPolicy** attached to the action → `PolicyViolation(permissionId, 0x…33212e…)`: that policy parses ERC-20 approve/transfer calldata and cannot decode a `fillLimitOrder` call. Removed it; the UniversalActionPolicy **param-rule** (`takerTokenFillAmount ≤ maxTakerFillAmountQ`, calldata word 16) is the on-chain notional bound (exactly the Phase 0 "C_paramRule" config), and STE fresh-quote validation stays the authoritative economic guard.

### Automated validation (post-fix)

- `pnpm --filter api test -- sea` → **292 pass, 1 gated-skip** (24 suites). `typecheck` / `lint` clean; root `format:check` clean.
- No frontend / sensitive files touched (only the untracked delegated adapter). No commit/push. No Base-mainnet, paymaster, or production keys. Manual CMR / CL / readiness / matching / 0x builders / FillWatcher / wallet-lock unchanged.

### Policy closeout (same day) — fee exposure

- **Final on-chain Smart Session policy:** target = 0x EP `0xdef1c0de…`; selector = `fillLimitOrder` `0xf6274f66`; `usageLimit = 1`; `validUntil` = intent expiry; param-rules = **one** (`takerTokenFillAmount ≤ maxTakerFillAmountQ`, calldata word 16); **no ERC-20 spending policy remains**.
- **Fee bounding decision:** an on-chain fee param-rule was evaluated and **not added** — word 4 (`order.takerTokenFeeAmount`) is the whole-order fee, not the actual proportional fee, so it would reject legitimate partial fills of larger orders; param-rules can't express a ratio and there's no calldata word for the paid fee. See [Decision_Log](./Decision_Log.md) 2026-07-12. Fee is bounded **STE-side** (fresh-quote validator caps `takerAmount + fee`) and now **receipt-verified**.
- **Receipt fee check added + verified** against the real confirmed receipt (tx `0x03968c1e…`, actual fee 20,000): `verifyFill` now also requires `LimitOrderFilled.takerTokenFeeFilledAmount ≤ expected.takerFeeAmount` — pass at expected 20000/30000, **fail at 19999** (blocks over-fee), backward-compatible when unset. Now checks orderHash + taker + takerToken + fillAmount **+ fee**.
- **No broader permission** from removing SpendingLimitsPolicy (session is strictly narrower). Files (all untracked `sea/delegated/**`, additive): `biconomy-delegation.provider.ts` (verifyFill fee check + comment), `delegation-provider.interface.ts` (`ExecuteExpectation.takerFeeAmount?`), `delegated-fill.builder.ts` (populate expected fee), `delegated.types.ts` + `cmr-delegation-policy.builder.ts` (stale-comment fixes). `test -- sea` 292 pass; typecheck/lint/format clean.

## 2026-07-12 — Delegated CMR Phase 3.0 / 3b.0: wallet-capability validation

Frontend account-model gate, resolved by manual browser tests (Sepolia, throwaway accounts).

- **EIP-7702 via MetaMask/injected — UNSUPPORTED (clean test).** Throwaway EOA `0xe02c…cec2a`: `eth_getCode` BEFORE `0x`; `wallet_getCapabilities` atomic-ready; `signAuthorization({contractAddress: Nexus impl})` failed `AccountTypeNotSupportedError — account type "json-rpc" is not supported`; `eth_getCode` AFTER `0x`; delegated to Nexus = false; no tx; gas 0. No standard `eth_signAuthorization` RPC. ⇒ 7702-first browser UX not viable for v1.
- **Nexus SA local-key SA-taker fill spike — PASS.** Deployed Nexus SA `0xfc8F27…` (factory `0x…1D1D`, deploy `0x93672d1d…`); SmartSessions installed (`0xd4bc9dc9…`); **bounded** EP approval 2.5 USDC (`0x6c09a2a2…`); real fill via the **real Phase 2 `execute(accountModel='NEXUS_SA')`** — tx `0xc03afa15…`, `confirmed:true`, `LimitOrderFilled` **taker=SA**, filled 1,000,000, fee 10,000, maker 0.05 WETH; **replay rejected (usage=1)**; escape-hatch withdraw `0x4e7ac7…`. (Owner = local throwaway key = local-key evidence.)
- **Real MetaMask owner-userOp — SUPPORTED.** Vite scratch app (outside repo, pinned abstractjs@1.2.4 + viem@2.54.3). Owner EOA `0xe02c…cec2a` owns Nexus SA `0x8f348822…087b` (factory `0x…1D1D`): deploy `0xb73e49a2…`, fund `0xab249e03…`; **MetaMask signed** the APPROVE userOp `0x1dde68b2…` (bounded allowance 1,000,000) and the WITHDRAW userOp `0x15ca8010…` — both landed. Proves a real browser wallet can own a Nexus SA and sign its userOps. **Web3Auth v10 owner signing NOT yet tested — must be capability-gated in the FE; no Web3Auth delegated support claimed.**
- **Decision:** Nexus SA is the Phase 3b delegated path; EIP-7702 deferred. See [Decision_Log](./Decision_Log.md) 2026-07-12. Backend NEXUS_SA implementation started (Milestone 1); frontend not started.
