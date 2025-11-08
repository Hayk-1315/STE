# STE v0.1 — Assumptions (bootstrap)
- Node LTS 22.x; pnpm 9.x (pinned).
- Monorepo: apps/web (Next.js) and apps/api (NestJS).
- Branch protection: temporary, GitHub ruleset not enforced in a personal/private repo; team discipline via PRs (accepted risk).
- Next: Postgres (Docker), typed .env, CI gates, Renovate.
- ORM: Prisma for Postgres (typed client and clear migration workflow). Chosen for developer velocity and safety.


