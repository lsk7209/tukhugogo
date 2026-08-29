# Current handoff — Patentgogo ad-scope deployment recovery

- Timestamp: 2026-08-30 08:46 KST
- User goal: audit and optimize the dashboard fleet one site at a time, using GitHub first where applicable.
- Exact current state: GitHub `main` at `6b16c2c74291278b9184805f6209c6f2ba51e81b` contains the route-scoped AdSense implementation and its direct Vercel deployment passes the scope audit. The custom domain serves a different deployment marker and still emits the loader on non-reader routes.
- Completed work: preserved the dirty original checkout; cloned remote `main`; refreshed first-party GSC/GA4 evidence; verified sitemap, robots, metadata, schema, mobile rendering, demo-data indexability, and representative pages; reproduced the deployment mismatch with raw HTML and Playwright.
- Changed files: `package.json`, `scripts/audit-adsense-route-scope.mjs`, this handoff, and ignored local Goal Harness records.
- Fresh validation evidence: custom domain fails loader absence on all seven non-reader HTML routes; direct GitHub deployment passes the 16-route dependency-free audit and 11-route browser audit; post-change syntax check, typecheck, production demo build, final-URL checks, and deployment-marker consistency checks pass.
- Side effects and rollback: dependencies installed only in the isolated clone; no production, GSC, Vercel account, or original-checkout mutation yet. The future commit can be reverted normally if needed.
- Blockers or risks: the custom domain may be attached to a stale/manual Vercel deployment. If a Git-connected push does not move it, Vercel alias/project inspection requires separate account-side authority.
- Deliberately not run or sent: no Vercel CLI/API mutation, no environment-variable change, no Turso write/backfill, no content rewrite, no GSC submission, and no AdSense account action.
- Single next step: commit and push the three scoped files after the completed remote-drift verification, then verify the resulting GitHub-connected deployment and custom domain.
