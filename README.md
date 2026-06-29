# 특허고고

Next/Vercel implementation of the `uBCC0uD615uC548.html` design handoff.

## Local

```bash
npm run check
npm run dev
```

Open `http://127.0.0.1:3000`.

For a production build with fixture data, set the public production values and explicitly opt in to demo data:

```powershell
$env:NEXT_PUBLIC_SITE_URL='https://patentgogo.com'
$env:NEXT_PUBLIC_CONTACT_EMAIL='contact@patentgogo.com'
$env:ALLOW_DEMO_DATA='true'
$env:PATENT_DATA_MODE='demo'
npm run build
```

For a live production build, set `PATENT_DATA_MODE=live`, `TURSO_DATABASE_URL`, and `TURSO_AUTH_TOKEN` instead of `ALLOW_DEMO_DATA`.

## Implemented Routes

- `/` - design handoff homepage with interactive patent tools.
- `/blog/` - card-style index that reuses guide, technology, ranking, and company landing pages as article entries.
- `/guide/[slug]` - keyword-entry guides for KIPRIS, filing cost, filing process, IPC, and patent maps.
- `/tech/[fieldId]` - technology landing pages for patent trend keywords.
- `/ranking/[fieldId]` - ranking pages for "특허 순위" keyword intent.
- `/company/[companyId]` - company patent data pages.
- `/sitemap.xml`, `/robots.txt`, `/feed.xml`, `/llms.txt`, and `/ads.txt` - search, AI, feed, and AdSense discovery surfaces.

Compatibility rewrites in `next.config.mjs` keep `/uBCC0uD615uC548.html`, `/variants`, and `/byeonhyeongan` working.

## Deploy

- Push this folder to GitHub.
- Import the repository in Vercel.
- Set `NEXT_PUBLIC_SITE_URL` to the production URL.
- Set `NEXT_PUBLIC_CONTACT_EMAIL` to a mailbox or forwarding address that actually receives site inquiries.
- Set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` when registering the site in Google Search Console.
- Set `NEXT_PUBLIC_NAVER_SITE_VERIFICATION` when registering the site in Naver Search Advisor.
- Set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` when using the live Turso data source.
- Set `PATENT_DATA_MODE=live` in production. Demo data is only allowed when `PATENT_DATA_MODE=demo` or `ALLOW_DEMO_DATA=true` is explicitly set.
- Set `PATENT_DATA_SOURCE` and `PATENT_DATA_AS_OF` only when you need to override provenance labels from Turso rows.
- Vercel serves all pages through the Next App Router.

## Turso

The current page can use demo data from `lib/patent-data.ts`, but production should fail closed unless demo mode is explicitly enabled.
When `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set, SSR and `/api/patent-metrics` read from the normalized Turso schema in `db/schema.sql`.

Use `db/schema.sql` as the starting Turso schema and `db/seed-demo.sql` for a small smoke dataset.
Use `docs/live-data-runbook.md` for the safer JSON snapshot workflow:

```powershell
npm run data:import -- --file db/patent-snapshot.example.json
npm run data:check -- --database-url-file D:\env\turso_database_url.txt --auth-token-file D:\env\turso_auth_token.txt
```
