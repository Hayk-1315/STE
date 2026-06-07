# Decision Log

Stable, load-bearing decisions only. One-line rationale per entry. If a decision is reversed, strike it through and add a new entry rather than deleting history.

## Format

`YYYY-MM-DD — Decision. Rationale. Impact.`

Date is approximate (when easy from git or memory). When unknown, leave blank rather than invent.

## Decisions

- **2026-06 — Base mainnet is a read-only demo profile.** Rationale: we want a public-facing surface for the exchange UI without exposing write paths until on-chain hardening and audit. Impact: web mainnet build must surface "Read-only mode" affordances; API must keep watchers off; no Smart Intent submit allowed.
- **2026-06 — Sepolia is the full interactive QA / demo environment.** Rationale: clear separation of where real EIP-712 sign + on-chain settlement is exercised end-to-end. Impact: all destructive-path QA happens on Sepolia.
- **Permanent — Backend never signs EIP-712 and never custodies private keys.** Rationale: Web3 safety boundary; non-negotiable. Impact: all signing stays in the wallet; backend only verifies signatures and forwards built tx data.
- **Permanent — Normal Market and Limit behavior is regression-protected.** Rationale: these are the load-bearing flows that any user touches first. Impact: SEA work and UI polish must not alter Market/Limit semantics; changes here require explicit task.
- **Permanent — CL uses pre-signed passive 0x limit orders.** Rationale: matches the existing maker pipeline; no special-case settlement. Impact: CL fire path only writes the underlying Order; existing matching/settlement is reused.
- **Permanent — CMR requires user confirmation; no auto-execution.** Rationale: avoid surprising on-chain spend without an explicit click. Impact: CMR READY only arms the row; the user must `Execute now` to sign the wallet-lock.
- **Permanent — CMR READY requires the full requested size fillable at or better than the trigger.** Rationale: "execute the full requested size or do not start" is the intent the user purchased. Impact: `cmr-prepare.service.ts` enforces `remainingBase === 0n` independent of TIF.
- **Permanent — CMR executable quote is built after wallet-lock.** Rationale: book may have drifted; we rebuild against the latest LOB inside the locked window. Impact: `/match/quote` is the second-stage gate; `fok_insufficient_liquidity` is the recoverable failure mode.
- **2026-06 — New CMR intents use fixed `tif="FOK"` and the UI selector is hidden.** Rationale: IOC/FOK was dead UI; semantics are enforced by READY + FE guard; FOK adds one server-side defense-in-depth. Impact: existing CMR rows with `tif="IOC"` still work; new rows persist as FOK.
- **2026-06 — PLACED Smart Intents are UI-history, not live.** Rationale: once PLACED, the underlying normal Order takes over and lives in OrdersPanel. Impact: PLACED rows hide behind `Show history`; users cancel via Orders panel; no Smart Intent state-machine change.
- **2026-06 — Cancel/fill of the linked normal Order does NOT transition the Smart Intent out of PLACED.** Rationale: avoids a complex cross-domain sync; v1 keeps the two panels independent. Impact: PLACED Smart Intents remain PLACED until user cancels them or they expire; documented limitation, not a bug.
- **Permanent — Mainnet API must keep `DEV_ONCHAIN_WATCHER=0`.** Rationale: read-only profile must not run write-path reconciliation. Impact: FillWatcher / CancelWatcher disabled on mainnet; only Sepolia or local exercises them.
- **Permanent — `clear-sea-intents-dev` is local/dev only and deletes only `IntentEvent` + `Intent`.** Rationale: surgical reset for QA; never touches Order, Trade, OrderEvent, BookSnapshot, Market, Token, or CancelPairFloor. Impact: safe to re-run for SEA QA cycles; multi-guard refusal (CONFIRM env, READ_ONLY, PROFILE=mainnet, non-local DB host).
- **Permanent — Smart Execution Assistant (AI/NL) will be a layer on top of the deterministic engine.** Rationale: critical execution logic stays deterministic and auditable; LLM is only for parsing/explanation/UX. Impact: future AI work must not move execution control into LLM logic.
- **2026-06-06 — UI uses `displayAmount()` (display-only) for all rendered token amounts; internal bigint math is unchanged.** Rationale: `ethers.formatUnits()` can produce float artifacts (e.g. `100000.00000000001`) in displayed strings. `displayAmount()` in `format.ts` applies `Intl.NumberFormat` with bounded precision for rendering only; the raw bigint value is never altered. Impact: TradePanel allowance/spend messages and BalancesPanel balances render cleanly; no change to approval amounts, validation, wallet payloads, or API contracts.
- **2026-06-06 — Visible "STE"/"SkyTrade" product strings removed from UI.** Rationale: pre-deploy branding cleanup; internal identifiers, env vars, filenames, and API routes are unchanged. Impact: browser title, footer text, and ConditionalTab help copy use neutral wording ("Exchange", "Hybrid Exchange", "the engine").
- **2026-06-07 — Visual UI polish pass accepted; page background is `bg-[#27374b]`.** Rationale: a slightly lighter/richer blue-gray improves card elevation over the prior `slate-800`; card border/shadow, header divider, and harmonized address/wallet/selector pill surfaces were accepted in visual QA. Impact: visual/class-only; no change to layout behavior, Market/Limit/SEA logic, or read-only handling.
- **2026-06-07 — "Cancel orders" is advanced/secondary UI, collapsed by default.** Rationale: destructive pair-cancel + raw-orderHash controls should not be primary/always-open. Impact: rendered inside a native `<details>` (title/description visible when collapsed); the exact controls and read-only guards are unchanged on expand.
- **2026-06-07 — `displayAmount()` renders sub-precision positive values as `<0.000001`, not `0`.** Rationale: showing `0` for a tiny non-zero balance is misleading in a financial UI. Impact: display-only floor string; underlying bigint values and approval/validation paths unchanged.

## Reversed / superseded

_None yet._
