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
