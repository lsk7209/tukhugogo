import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function readSecret(value, file) {
  if (value) return value.trim();
  if (file) return readFileSync(file, "utf8").trim();
  return "";
}

function asNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

const url = readSecret(process.env.TURSO_DATABASE_URL, argValue("--database-url-file"));
const authToken = readSecret(process.env.TURSO_AUTH_TOKEN, argValue("--auth-token-file"));

if (!url || !authToken) {
  console.error("Missing Turso credentials. Set TURSO_DATABASE_URL/TURSO_AUTH_TOKEN or pass --database-url-file and --auth-token-file.");
  process.exit(2);
}

const requiredTables = ["tech_fields", "applicants", "field_applicant_metrics", "field_year_metrics"];
const db = createClient({ url, authToken });

async function scalar(sql, args = []) {
  const result = await db.execute({ sql, args });
  return result.rows[0] ? Object.values(result.rows[0])[0] : undefined;
}

async function tableExists(name) {
  const count = await scalar("select count(*) as count from sqlite_master where type = 'table' and name = ?", [name]);
  return asNumber(count) > 0;
}

async function main() {
  const tableStatus = [];
  for (const table of requiredTables) {
    const exists = await tableExists(table);
    const rows = exists ? asNumber(await scalar(`select count(*) as count from ${table}`)) : 0;
    tableStatus.push({ table, exists, rows });
  }

  const missing = tableStatus.filter(item => !item.exists);
  if (missing.length) {
    console.log(JSON.stringify({ ok: false, reason: "missing_tables", tables: tableStatus }, null, 2));
    process.exit(1);
  }

  const snapshot = String(
    await scalar(`
      select as_of from (
        select as_of from field_year_metrics
        union
        select as_of from field_applicant_metrics
      )
      order by as_of desc
      limit 1
    `) ?? ""
  );

  if (!snapshot) {
    console.log(JSON.stringify({ ok: false, reason: "missing_snapshot", tables: tableStatus }, null, 2));
    process.exit(1);
  }

  const fields = asNumber(await scalar("select count(*) as count from tech_fields"));
  const applicants = asNumber(await scalar("select count(*) as count from applicants"));
  const years = asNumber(await scalar("select count(distinct year) as count from field_year_metrics where as_of = ?", [snapshot]));
  const fieldYearRows = asNumber(await scalar("select count(*) as count from field_year_metrics where as_of = ?", [snapshot]));
  const applicantMetricRows = asNumber(await scalar("select count(*) as count from field_applicant_metrics where as_of = ?", [snapshot]));
  const missingFieldYearRows = Math.max(fields * years - fieldYearRows, 0);
  const badRegistrationRows = asNumber(
    await scalar("select count(*) as count from field_applicant_metrics where as_of = ? and (registration_rate < 0 or registration_rate > 100)", [snapshot])
  );
  const negativeRows = asNumber(
    await scalar(`
      select
        (select count(*) from field_year_metrics where as_of = ? and filing_count < 0) +
        (select count(*) from field_applicant_metrics where as_of = ? and filing_count < 0) as count
    `, [snapshot, snapshot])
  );

  const ok =
    fields > 0 &&
    applicants > 0 &&
    years > 0 &&
    fieldYearRows === fields * years &&
    applicantMetricRows > 0 &&
    badRegistrationRows === 0 &&
    negativeRows === 0;

  console.log(JSON.stringify({
    ok,
    snapshot,
    tables: tableStatus,
    checks: {
      fields,
      applicants,
      years,
      fieldYearRows,
      expectedFieldYearRows: fields * years,
      missingFieldYearRows,
      applicantMetricRows,
      badRegistrationRows,
      negativeRows
    }
  }, null, 2));

  process.exit(ok ? 0 : 1);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
