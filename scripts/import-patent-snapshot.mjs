import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";

const requiredFieldKeys = ["id", "ipc", "name", "shortName"];
const requiredApplicantKeys = ["id", "name"];
const requiredApplicantMetricKeys = ["techFieldId", "applicantId", "filingCount"];
const requiredYearMetricKeys = ["techFieldId", "year", "filingCount"];

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function hasFlag(name) {
  return process.argv.includes(name);
}

function readSecret(value, file) {
  if (value) return value.trim();
  if (file) return readFileSync(file, "utf8").trim();
  return "";
}

function readSnapshot(path) {
  if (!path) throw new Error("Missing --file <snapshot.json>");
  return JSON.parse(readFileSync(path, "utf8"));
}

function assertObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
}

function assertArray(value, label) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${label} must be a non-empty array.`);
  }
}

function assertKeys(row, keys, label) {
  for (const key of keys) {
    if (row[key] === undefined || row[key] === null || String(row[key]).trim() === "") {
      throw new Error(`${label} is missing required key: ${key}`);
    }
  }
}

function normalizeSnapshot(snapshot) {
  assertObject(snapshot, "snapshot");
  const sourceLabel = String(snapshot.sourceLabel ?? "").trim();
  const sourceUrl = String(snapshot.sourceUrl ?? "").trim();
  const asOf = String(snapshot.asOf ?? "").trim();
  if (!sourceLabel) throw new Error("snapshot.sourceLabel is required.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf)) throw new Error("snapshot.asOf must be YYYY-MM-DD.");

  assertArray(snapshot.techFields, "snapshot.techFields");
  assertArray(snapshot.applicants, "snapshot.applicants");
  assertArray(snapshot.fieldApplicantMetrics, "snapshot.fieldApplicantMetrics");
  assertArray(snapshot.fieldYearMetrics, "snapshot.fieldYearMetrics");

  const fieldIds = new Set();
  const applicantIds = new Set();
  const applicantMetricKeys = new Set();
  const yearMetricKeys = new Set();

  const techFields = snapshot.techFields.map((field, index) => {
    assertObject(field, `techFields[${index}]`);
    assertKeys(field, requiredFieldKeys, `techFields[${index}]`);
    const id = String(field.id).trim();
    if (fieldIds.has(id)) throw new Error(`Duplicate tech field id: ${id}`);
    fieldIds.add(id);
    return {
      id,
      ipc: String(field.ipc).trim(),
      name: String(field.name).trim(),
      shortName: String(field.shortName).trim(),
      description: String(field.description ?? "").trim()
    };
  });

  const applicants = snapshot.applicants.map((applicant, index) => {
    assertObject(applicant, `applicants[${index}]`);
    assertKeys(applicant, requiredApplicantKeys, `applicants[${index}]`);
    const id = String(applicant.id).trim();
    if (applicantIds.has(id)) throw new Error(`Duplicate applicant id: ${id}`);
    applicantIds.add(id);
    return {
      id,
      name: String(applicant.name).trim(),
      tag: String(applicant.tag ?? "").trim(),
      normalizedName: String(applicant.normalizedName ?? applicant.name).trim()
    };
  });

  const fieldApplicantMetrics = snapshot.fieldApplicantMetrics.map((metric, index) => {
    assertObject(metric, `fieldApplicantMetrics[${index}]`);
    assertKeys(metric, requiredApplicantMetricKeys, `fieldApplicantMetrics[${index}]`);
    const techFieldId = String(metric.techFieldId).trim();
    const applicantId = String(metric.applicantId).trim();
    if (!fieldIds.has(techFieldId)) throw new Error(`Unknown techFieldId in applicant metric: ${techFieldId}`);
    if (!applicantIds.has(applicantId)) throw new Error(`Unknown applicantId in applicant metric: ${applicantId}`);
    const filingCount = Number(metric.filingCount);
    const registrationRate = metric.registrationRate === undefined || metric.registrationRate === null || metric.registrationRate === ""
      ? null
      : Number(metric.registrationRate);
    if (!Number.isInteger(filingCount) || filingCount < 0) throw new Error(`Invalid filingCount in applicant metric ${index}`);
    if (registrationRate !== null && (!Number.isFinite(registrationRate) || registrationRate < 0 || registrationRate > 100)) {
      throw new Error(`registrationRate must be 0-100 in applicant metric ${index}`);
    }
    const key = `${techFieldId}|${applicantId}`;
    if (applicantMetricKeys.has(key)) throw new Error(`Duplicate applicant metric row: ${key}`);
    applicantMetricKeys.add(key);
    return { techFieldId, applicantId, filingCount, registrationRate };
  });

  const years = new Set();
  const fieldYearMetrics = snapshot.fieldYearMetrics.map((metric, index) => {
    assertObject(metric, `fieldYearMetrics[${index}]`);
    assertKeys(metric, requiredYearMetricKeys, `fieldYearMetrics[${index}]`);
    const techFieldId = String(metric.techFieldId).trim();
    if (!fieldIds.has(techFieldId)) throw new Error(`Unknown techFieldId in year metric: ${techFieldId}`);
    const year = Number(metric.year);
    const filingCount = Number(metric.filingCount);
    if (!Number.isInteger(year) || year < 1900 || year > 2100) throw new Error(`Invalid year in year metric ${index}`);
    if (!Number.isInteger(filingCount) || filingCount < 0) throw new Error(`Invalid filingCount in year metric ${index}`);
    const key = `${techFieldId}|${year}`;
    if (yearMetricKeys.has(key)) throw new Error(`Duplicate year metric row: ${key}`);
    yearMetricKeys.add(key);
    years.add(year);
    return { techFieldId, year, filingCount };
  });

  for (const fieldId of fieldIds) {
    for (const year of years) {
      if (!yearMetricKeys.has(`${fieldId}|${year}`)) {
        throw new Error(`Missing fieldYearMetrics row for ${fieldId} ${year}`);
      }
    }
  }

  return { sourceLabel, sourceUrl, asOf, techFields, applicants, fieldApplicantMetrics, fieldYearMetrics };
}

async function applySchema(db) {
  const schema = readFileSync("db/schema.sql", "utf8");
  for (const statement of schema.split(/;\s*(?:\r?\n|$)/).map(item => item.trim()).filter(Boolean)) {
    await db.execute(`${statement};`);
  }
  await ensureColumn(db, "field_applicant_metrics", "source_url", "text");
  await ensureColumn(db, "field_year_metrics", "source_url", "text");
}

async function ensureColumn(db, table, column, definition) {
  const info = await db.execute(`pragma table_info(${table})`);
  if (info.rows.some(row => String(row.name) === column)) return;
  await db.execute(`alter table ${table} add column ${column} ${definition}`);
}

async function importSnapshot(db, snapshot) {
  await applySchema(db);
  const statements = [];

  for (const field of snapshot.techFields) {
    statements.push({
      sql: `insert into tech_fields (id, ipc, name, short_name, description)
            values (?, ?, ?, ?, ?)
            on conflict(id) do update set ipc = excluded.ipc, name = excluded.name, short_name = excluded.short_name, description = excluded.description`,
      args: [field.id, field.ipc, field.name, field.shortName, field.description]
    });
  }

  for (const applicant of snapshot.applicants) {
    statements.push({
      sql: `insert into applicants (id, name, tag, normalized_name)
            values (?, ?, ?, ?)
            on conflict(id) do update set name = excluded.name, tag = excluded.tag, normalized_name = excluded.normalized_name`,
      args: [applicant.id, applicant.name, applicant.tag, applicant.normalizedName]
    });
  }

  statements.push({ sql: "delete from field_applicant_metrics where as_of = ?", args: [snapshot.asOf] });
  statements.push({ sql: "delete from field_year_metrics where as_of = ?", args: [snapshot.asOf] });

  for (const metric of snapshot.fieldApplicantMetrics) {
    statements.push({
      sql: `insert into field_applicant_metrics
              (tech_field_id, applicant_id, filing_count, registration_rate, source_label, source_url, as_of)
            values (?, ?, ?, ?, ?, ?, ?)`,
      args: [metric.techFieldId, metric.applicantId, metric.filingCount, metric.registrationRate, snapshot.sourceLabel, snapshot.sourceUrl, snapshot.asOf]
    });
  }

  for (const metric of snapshot.fieldYearMetrics) {
    statements.push({
      sql: `insert into field_year_metrics
              (tech_field_id, year, filing_count, source_label, source_url, as_of)
            values (?, ?, ?, ?, ?, ?)`,
      args: [metric.techFieldId, metric.year, metric.filingCount, snapshot.sourceLabel, snapshot.sourceUrl, snapshot.asOf]
    });
  }

  await db.batch(statements, "write");
}

async function main() {
  const snapshot = normalizeSnapshot(readSnapshot(argValue("--file")));
  const summary = {
    ok: true,
    mode: hasFlag("--apply") ? "apply" : "dry-run",
    asOf: snapshot.asOf,
    sourceLabel: snapshot.sourceLabel,
    counts: {
      techFields: snapshot.techFields.length,
      applicants: snapshot.applicants.length,
      fieldApplicantMetrics: snapshot.fieldApplicantMetrics.length,
      fieldYearMetrics: snapshot.fieldYearMetrics.length
    }
  };

  if (!hasFlag("--apply")) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  const url = readSecret(process.env.TURSO_DATABASE_URL, argValue("--database-url-file"));
  const authToken = readSecret(process.env.TURSO_AUTH_TOKEN, argValue("--auth-token-file"));
  if (!url || !authToken) {
    throw new Error("Missing Turso credentials. Set TURSO_DATABASE_URL/TURSO_AUTH_TOKEN or pass --database-url-file and --auth-token-file.");
  }

  const db = createClient({ url, authToken });
  await importSnapshot(db, snapshot);
  console.log(JSON.stringify({ ...summary, imported: true }, null, 2));
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
