# Decision Log

- 2025-11-06: Accepted temporary risk: GitHub rulesets are not enforced in a personal private repo.
  Reason: new GitHub UI; it does not block our workflow. Mitigation: PR discipline + CI checks once configured.
- 2025-11-06: Monorepo with pnpm; apps/web (Next.js) and apps/api (NestJS) per scope F0.
- 2025-11-08: Chosen Prisma as ORM for API; reason: strong typing + migration flow. Impact: dev speed, clear DB schema.
- 2025-11-08: Adopted GitHub Actions CI (lint → typecheck → test → build). Reason: enforce quality gates on PRs.
- 2025-11-08: Adopted Renovate (weekly). Reason: keep dependencies fresh under CI control. Impact: steady maintenance.
- 2025-11-08: Corrected .gitignore to track pnpm-lock.yaml (guardrail: pinned versions + lockfile).
