# Decision Log
- 2025-11-06: Accepted temporary risk: GitHub rulesets are not enforced in a personal private repo.
  Reason: new GitHub UI; it does not block our workflow. Mitigation: PR discipline + CI checks once configured.
- 2025-11-06: Monorepo with pnpm; apps/web (Next.js) and apps/api (NestJS) per scope F0.
- 2025-11-08: Chosen Prisma as ORM for API; reason: strong typing + migration flow. Impact: dev speed, clear DB schema.

