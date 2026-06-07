# CLAUDE.md

## Role

You are working on the existing STE repository.

This is not a greenfield build.
This is an evolution of a real hybrid exchange codebase that already works across frontend, backend, database, and blockchain settlement flows.

Your job is to improve the current repository carefully, without unnecessary rewrites, and without drifting away from the actual product direction.

## Primary Working Principle

Prefer incremental evolution over redesign.

Protect the value that already exists in the repo:

- current architecture,
- current working flows,
- current deployments,
- current end-to-end behavior,
- current product narrative.

Do not create a parallel system when the current system can be extended cleanly.

## Project Direction

STE is a hybrid exchange architecture with:

- off-chain matching,
- on-chain settlement via 0x Exchange Proxy,
- client-side EIP-712 signing,
- NestJS + Postgres backend,
- Next.js frontend,
- WebSocket real-time updates,
- on-chain reconciliation watchers,
- multiple deployment profiles.

Current strategic direction:

- evolve the current STE, do not rebuild it from scratch,
- improve product quality and execution UX,
- preserve deterministic logic for critical execution paths,
- avoid AI gimmicks,
- later add a Smart Execution Assistant as a layer on top of the current exchange core, not as a replacement for the engine.

Important:
A likely near-term product direction is to unify the current maker and taker flows before building the Smart Execution Assistant on top.
This is allowed and strategically valid.
However, it must be analyzed carefully before implementation.

## Current Reality You Must Respect

Work from the real repository state, not from assumptions or idealized architecture.

Assume the current repo already contains meaningful working pieces across:

- maker flow,
- taker flow,
- orderbook,
- signed order intake,
- quotes,
- tx building,
- WebSocket updates,
- balances and allowances,
- watchers and reconciliation,
- multi-profile deployment setup,
- live/read-only and interactive environments.

Do not ignore existing code paths just because a cleaner abstraction could be imagined.

## Project memory

Before significant planning or implementation work, read:

- [docs/Phase_Status.md](docs/Phase_Status.md)
- [docs/Decision_Log.md](docs/Decision_Log.md)
- [docs/QA_Log.md](docs/QA_Log.md)

Use these as project memory, but inspect the actual code relevant to the task before making changes. The repo is the source of truth.

When a task changes phase status, makes a durable decision, or produces QA results, update the relevant doc above in the same change.

## Non-Negotiable Rules

### 1) Propose first, change later

Never start implementing immediately.

Before editing any file:

1. inspect the relevant files,
2. explain the current flow in simple terms,
3. propose the change,
4. list impacted files,
5. state risks,
6. state architectural impact,
7. wait for approval.

Do not modify files until approval is given.

### 2) Minimize architectural disruption

Prefer the least invasive solution that solves the problem well.

Default preference order:

1. extend existing code,
2. refactor locally if needed,
3. do a broader refactor only if clearly justified.

Do not replace major existing flows unless there is clear approval and a strong technical reason.

### 3) Escalate before broad changes

Stop and ask before proceeding if the task implies:

- broad frontend flow rewrites,
- maker/taker flow unification with medium or large impact,
- cross-cutting refactors across many modules,
- database schema changes,
- changes to watcher or reconciliation logic,
- changes to settlement assumptions,
- changes to signing flows,
- changes to deployment or environment behavior,
- anything likely to break current working end-to-end flows.

### 4) Maker / taker unification rule

Do not treat maker/taker unification as forbidden.

Treat it as a valid product direction that may be requested soon.

But before implementing it, you must:

- inspect the current maker and taker flows,
- identify shared components, duplicated logic, and coupling,
- estimate real implementation cost,
- classify the change as small, medium, or large,
- identify what can be unified now vs later,
- propose the safest migration path,
- explain whether this should be done as one pass or progressive transition,
- wait for approval.

Do not jump straight into a full rewrite of the trade UI.

### 5) Smart Execution Assistant rule

The Smart Execution Assistant must be treated as a product layer on top of the existing exchange.

Critical execution logic must remain deterministic, explicit, and auditable.

If working on assistant-related tasks:

- use deterministic/rules-based logic for execution-critical behavior,
- use LLM-oriented behavior only for parsing, explanation, summarization, or UX assistance,
- do not move execution control into vague AI logic,
- do not replace the exchange engine with an assistant abstraction.

### 6) Preserve Web3 safety boundaries

Never move private-key control or signing to the backend.

Keep:

- EIP-712 signing on the client,
- server-side verification on the backend,
- settlement assumptions explicit,
- chain/profile behavior explicit,
- allowance and spender handling explicit.

Flag any change touching:

- settlement,
- allowances,
- chain config,
- tx builders,
- on-chain reconciliation,
  as high-risk unless proven otherwise.

### 7) Avoid unnecessary repo churn

Do not perform cosmetic cleanup unless requested.

Avoid unnecessary:

- file renames,
- folder moves,
- abstraction layers,
- dependency swaps,
- style-only rewrites,
- “cleanup” refactors with weak business value.

Every meaningful change should have a clear reason.

### 8) Work from evidence

Read the actual code before proposing architecture.

Base every proposal on:

- real files,
- real flows,
- real dependencies,
- real constraints.

If something is unclear, say exactly what is unclear.
Do not invent certainty.

### 9) Be explicit about impact

For every proposal, clearly state:

- what changes,
- why it changes,
- which files are touched,
- which flows are affected,
- risk level,
- architectural impact,
- rollback difficulty,
- test surface.

### 10) Respect current environments and deployment reality

Do not assume a single-chain or single-profile setup if the repo already supports multiple profiles or environments.

Be careful with:

- read-only vs interactive behavior,
- mainnet vs testnet behavior,
- env file differences,
- deployment assumptions,
- feature gating by profile.

If a change may affect environment behavior, call it out clearly before implementation.

### 11) Code quality expectations

Follow the existing stack and conventions unless there is a strong reason not to.

Expectations:

- TypeScript strictness,
- clear module boundaries,
- readable code,
- production-minded structure,
- minimal surprises,
- concise professional code comments in English.

Do not overengineer.

## Required Response Format Before Any Change

Before editing files, respond using this structure:

### Current flow

- Brief explanation of how the relevant flow works today.

### Proposal

- What should change.
- Why this is the right change.

### Impacted files

- Files to inspect.
- Files likely to change.

### Risk

- low / medium / high

### Architectural impact

- minimal / moderate / large

### Open questions

- Only list real blockers or important uncertainties.

Then stop and wait for approval.

## Required Response Format After Changes

After making changes, respond using this structure:

### What changed

- Summary of the implementation.

### Why it changed

- Reason for the change.

### Files modified

- Explicit list.

### Risks or limitations

- Anything incomplete, risky, deferred, or intentionally not addressed.

### How to test

- Concrete validation steps.

### Suggested next step

- The most sensible follow-up.

## Default Behavior

When in doubt:

- choose the least invasive path,
- preserve working flows,
- protect the current architecture,
- ask before broadening scope.

If a requested change conflicts with the existing product direction or requires substantial architecture movement, say so clearly before implementing anything.
