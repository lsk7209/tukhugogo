# Live Patent Data Runbook

This project reads live metrics from the normalized Turso/libSQL schema in `db/schema.sql`.
Use this runbook when replacing demo data with a verified KIPRIS/data.go.kr aggregate snapshot.

## Required Snapshot Shape

Create a JSON file with this top-level shape:

```json
{
  "sourceLabel": "특허청 KIPRIS · data.go.kr",
  "asOf": "2025-12-31",
  "techFields": [],
  "applicants": [],
  "fieldApplicantMetrics": [],
  "fieldYearMetrics": []
}
```

Use `db/patent-snapshot.example.json` as the smallest valid example.

## Validate Before Writing

```powershell
npm run data:import -- --file db/patent-snapshot.example.json
```

This is a dry run. It validates:

- required IDs and labels;
- duplicate field/applicant/metric rows;
- unknown foreign keys;
- negative filing counts;
- registration rates outside `0..100`;
- missing `fieldYearMetrics` rows for any field/year combination.

## Import To Turso

Use `--apply` only after the source and redistribution terms are verified.

```powershell
npm run data:import -- --file path\to\verified-snapshot.json --apply `
  --database-url-file D:\env\turso_database_url.txt `
  --auth-token-file D:\env\turso_auth_token.txt
```

The importer applies `db/schema.sql`, upserts field/applicant labels, replaces metric rows for the snapshot `asOf`, and leaves other snapshot dates intact.

## Check Turso Readiness

```powershell
npm run data:check -- `
  --database-url-file D:\env\turso_database_url.txt `
  --auth-token-file D:\env\turso_auth_token.txt
```

The check prints counts and fails if required tables are missing, a snapshot is absent, field-year rows are incomplete, counts are negative, or registration rates are outside `0..100`.

## Enable Live Mode

After `data:check` passes:

1. Set Vercel Production env:
   - `PATENT_DATA_MODE=live`
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - keep `NEXT_PUBLIC_SITE_URL=https://patentgogo.com`
   - keep `NEXT_PUBLIC_CONTACT_EMAIL=contact@patentgogo.com`
2. Remove production demo opt-in if present:
   - `ALLOW_DEMO_DATA`
3. Deploy production.
4. Verify:
   - `/api/patent-metrics/` returns live `meta.source` and `meta.asOf`;
   - `/sitemap.xml`, `/feed.xml`, `/llms.txt`, and `/blog/` include data pages only after live mode is active;
   - `/tech/*`, `/ranking/*`, and `/company/*` no longer render demo-mode `noindex`.

## Source Policy

Do not import scraped or redistributed patent data until the data source license allows this use.
The project should record the source label and snapshot date with every metric row.
