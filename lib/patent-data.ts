import "server-only";
import { createClient } from "@libsql/client";

export type TechField = {
  id: string;
  ipc: string;
  name: string;
  short: string;
  desc: string;
  total: number;
};

export type Company = {
  id: string;
  name: string;
  tag: string;
  fields: Record<string, number>;
  reg: Record<string, number>;
  total: number;
  regAvg: number;
};

export type PatentData = {
  techFields: TechField[];
  companies: Company[];
  years: number[];
  timeline: Record<string, number[]>;
  meta: {
    source: string;
    sourceUrl?: string;
    asOf: string;
    note: string;
  };
};

type CompanyFixture = Omit<Company, "total" | "regAvg">;

const techBase = [
  ["cathode", "H01M 4/00", "양극재", "양극재", "리튬 전이금속 산화물, 고니켈 양극, 코팅 및 도핑 소재"],
  ["anode", "H01M 4/13", "음극재", "음극재", "흑연, 실리콘계 음극, 리튬금속 음극과 제조 공정"],
  ["electrolyte", "H01M 10/05", "전해질", "전해질", "액체 전해액, 첨가제, 겔·고체 전해질 조성"],
  ["separator", "H01M 50/40", "분리막", "분리막", "다공성 분리막, 세라믹 코팅, 내열성 안전 소재"],
  ["cell", "H01M 50/00", "셀·패키지", "셀", "셀 구조, 모듈, 팩, 열관리와 안전 설계"],
  ["bms", "H02J 7/00", "BMS·관리", "BMS", "배터리 관리, 충방전 제어, 진단 알고리즘"],
  ["solid", "H01M 10/056", "전고체", "전고체", "황화물·산화물계 고체전해질과 전고체 전지 구조"]
] as const;

const companyBase: CompanyFixture[] = [
  {
    id: "c1",
    name: "LG에너지솔루션",
    tag: "셀 메이커",
    fields: { cathode: 412, anode: 388, electrolyte: 301, separator: 276, cell: 520, bms: 244, solid: 198 },
    reg: { cathode: 71, anode: 68, electrolyte: 74, separator: 70, cell: 66, bms: 72, solid: 58 }
  },
  {
    id: "c2",
    name: "삼성SDI",
    tag: "셀 메이커",
    fields: { cathode: 386, anode: 351, electrolyte: 333, separator: 198, cell: 477, bms: 281, solid: 264 },
    reg: { cathode: 73, anode: 70, electrolyte: 76, separator: 67, cell: 69, bms: 75, solid: 62 }
  },
  {
    id: "c3",
    name: "SK온",
    tag: "셀 메이커",
    fields: { cathode: 244, anode: 271, electrolyte: 188, separator: 312, cell: 356, bms: 167, solid: 121 },
    reg: { cathode: 64, anode: 66, electrolyte: 69, separator: 72, cell: 63, bms: 68, solid: 49 }
  },
  {
    id: "c4",
    name: "포스코퓨처엠",
    tag: "소재사",
    fields: { cathode: 298, anode: 214, electrolyte: 88, separator: 41, cell: 62, bms: 19, solid: 74 },
    reg: { cathode: 69, anode: 65, electrolyte: 58, separator: 52, cell: 55, bms: 47, solid: 51 }
  },
  {
    id: "c5",
    name: "에코프로비엠",
    tag: "소재사",
    fields: { cathode: 341, anode: 96, electrolyte: 64, separator: 28, cell: 38, bms: 12, solid: 58 },
    reg: { cathode: 72, anode: 61, electrolyte: 60, separator: 50, cell: 54, bms: 44, solid: 53 }
  },
  {
    id: "c6",
    name: "현대자동차",
    tag: "완성차",
    fields: { cathode: 132, anode: 121, electrolyte: 109, separator: 87, cell: 244, bms: 388, solid: 176 },
    reg: { cathode: 67, anode: 66, electrolyte: 68, separator: 64, cell: 70, bms: 74, solid: 60 }
  }
];

const years = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

const timeline: Record<string, number[]> = {
  cathode: [1180, 1340, 1510, 1690, 1820, 2010, 2180, 2290, 2360, 2440],
  anode: [980, 1090, 1210, 1330, 1410, 1520, 1640, 1700, 1730, 1760],
  electrolyte: [640, 710, 790, 880, 980, 1100, 1230, 1320, 1380, 1430],
  separator: [520, 560, 610, 690, 760, 830, 910, 960, 990, 1010],
  cell: [1320, 1480, 1660, 1810, 1990, 2180, 2360, 2510, 2620, 2710],
  bms: [410, 470, 540, 640, 760, 900, 1040, 1180, 1290, 1370],
  solid: [120, 150, 190, 250, 340, 470, 650, 860, 1080, 1290]
};

export function koNum(n: number) {
  if (n >= 100000000) return `${(n / 100000000).toFixed(n % 100000000 === 0 ? 0 : 1)}억`;
  if (n >= 10000) {
    const man = n / 10000;
    return `${man % 1 === 0 ? man : man.toFixed(1)}만`;
  }
  return n.toLocaleString("ko-KR");
}

export function comma(n: number) {
  return n.toLocaleString("ko-KR");
}

function withTotals(inputCompanies: CompanyFixture[], inputFields: TechField[]): Company[] {
  return inputCompanies.map(company => {
    const total = inputFields.reduce((sum, field) => sum + (company.fields[field.id] ?? 0), 0);
    const weighted = inputFields.reduce(
      (acc, field) => {
        const count = company.fields[field.id] ?? 0;
        return { num: acc.num + count * (company.reg[field.id] ?? 0), den: acc.den + count };
      },
      { num: 0, den: 0 }
    );
    return { ...company, total, regAvg: weighted.den ? Math.round(weighted.num / weighted.den) : 0 };
  });
}

export function getDemoPatentData(): PatentData {
  const fields = techBase.map(([id, ipc, name, short, desc]) => ({
    id,
    ipc,
    name,
    short,
    desc,
    total: timeline[id].at(-1) ?? 0
  }));

  return {
    techFields: fields,
    companies: withTotals(companyBase, fields),
    years,
    timeline,
    meta: {
      source: "시연용 합성 데이터",
      sourceUrl: undefined,
      asOf: "2026-06",
      note: "운영 데이터 연결 전까지는 KIPRIS 원천 데이터를 모사한 시연 데이터로 표시합니다."
    }
  };
}

function envFlag(name: string) {
  return ["1", "true", "yes", "on"].includes(String(process.env[name] ?? "").trim().toLowerCase());
}

export function isDemoDataConfigured() {
  const mode = process.env.PATENT_DATA_MODE?.trim();
  if (mode === "demo" || envFlag("ALLOW_DEMO_DATA")) return true;
  if (mode === "live") return false;
  return !(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);
}

function shouldUseDemoData(url?: string, authToken?: string) {
  const mode = process.env.PATENT_DATA_MODE?.trim();
  if (mode === "demo" || envFlag("ALLOW_DEMO_DATA")) return true;
  if (mode === "live") return false;
  if (url && authToken) return false;
  if (process.env.NODE_ENV !== "production") return true;

  throw new Error(
    "Turso credentials are missing. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN, or explicitly set ALLOW_DEMO_DATA=true for demo builds."
  );
}

function latestValue(values: string[]) {
  return values.sort().at(-1);
}

let cachedData:
  | {
      key: string;
      expiresAt: number;
      promise: Promise<PatentData>;
    }
  | undefined;

function cacheKey(url?: string, authToken?: string) {
  return [
    process.env.NODE_ENV,
    process.env.PATENT_DATA_MODE,
    envFlag("ALLOW_DEMO_DATA") ? "demo-allowed" : "demo-blocked",
    url ?? "",
    authToken ? "token-set" : "token-missing",
    process.env.PATENT_DATA_SOURCE ?? "",
    process.env.PATENT_DATA_AS_OF ?? ""
  ].join("|");
}

function cacheTtlMs() {
  const seconds = Number(process.env.PATENT_DATA_CACHE_SECONDS ?? 3600);
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 0;
}

async function loadPatentData(): Promise<PatentData> {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (shouldUseDemoData(url, authToken)) return getDemoPatentData();
  if (!url || !authToken) {
    throw new Error("Turso live mode requires TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.");
  }

  const db = createClient({ url, authToken });
  const configuredAsOf = process.env.PATENT_DATA_AS_OF;
  const snapshotResult = configuredAsOf
    ? { rows: [{ as_of: configuredAsOf }] }
    : await db.execute(`
        select as_of from (
          select as_of from field_year_metrics
          union
          select as_of from field_applicant_metrics
        )
        order by as_of desc
        limit 1
      `);
  const snapshotAsOf = String(snapshotResult.rows[0]?.as_of ?? "");
  if (!snapshotAsOf) {
    throw new Error("No patent metric snapshot was found in Turso.");
  }

  const [fieldRows, applicantMetricRows, timelineRows] = await Promise.all([
    db.execute("select id, ipc, name, short_name, description from tech_fields order by id"),
    db.execute({
      sql: `
      select
        a.id as applicant_id,
        a.name,
        a.tag,
        m.tech_field_id,
        m.filing_count,
        m.registration_rate,
        m.source_label,
        m.source_url,
        m.as_of
      from applicants a
      join field_applicant_metrics m on m.applicant_id = a.id
      where m.as_of = ?
      order by a.id, m.tech_field_id
    `,
      args: [snapshotAsOf]
    }),
    db.execute({
      sql: `
      select tech_field_id, year, filing_count, source_label, source_url, as_of
      from field_year_metrics
      where as_of = ?
      order by tech_field_id, year
    `,
      args: [snapshotAsOf]
    })
  ]);

  const loadedYears = Array.from(new Set(timelineRows.rows.map(row => Number(row.year)))).sort((a, b) => a - b);
  if (!loadedYears.length) {
    throw new Error(`No field_year_metrics rows were found for snapshot ${snapshotAsOf}.`);
  }
  const loadedTimeline: Record<string, number[]> = {};
  const sourceLabels: string[] = [];
  const sourceUrls: string[] = [];
  const asOfDates: string[] = [];

  for (const row of timelineRows.rows) {
    sourceLabels.push(String(row.source_label));
    sourceUrls.push(String(row.source_url ?? ""));
    asOfDates.push(String(row.as_of));
  }
  for (const row of applicantMetricRows.rows) {
    sourceLabels.push(String(row.source_label));
    sourceUrls.push(String(row.source_url ?? ""));
    asOfDates.push(String(row.as_of));
  }

  for (const field of fieldRows.rows) {
    const id = String(field.id);
    loadedTimeline[id] = loadedYears.map(year => {
      const found = timelineRows.rows.find(row => String(row.tech_field_id) === id && Number(row.year) === year);
      if (!found) {
        throw new Error(`Missing field_year_metrics row for field ${id}, year ${year}, snapshot ${snapshotAsOf}.`);
      }
      return Number(found?.filing_count ?? 0);
    });
  }

  const fields = fieldRows.rows.map(row => {
    const id = String(row.id);
    return {
      id,
      ipc: String(row.ipc),
      name: String(row.name),
      short: String(row.short_name),
      desc: String(row.description ?? ""),
      total: loadedTimeline[id]?.at(-1) ?? 0
    };
  });

  const companyMap = new Map<string, CompanyFixture>();
  for (const row of applicantMetricRows.rows) {
    const id = String(row.applicant_id);
    const company = companyMap.get(id) ?? {
      id,
      name: String(row.name),
      tag: String(row.tag ?? ""),
      fields: {},
      reg: {}
    };
    const fieldId = String(row.tech_field_id);
    company.fields[fieldId] = Number(row.filing_count);
    company.reg[fieldId] = Math.round(Number(row.registration_rate ?? 0));
    companyMap.set(id, company);
  }

  const fixtures = Array.from(companyMap.values()).sort((a, b) => a.id.localeCompare(b.id));
  const source = process.env.PATENT_DATA_SOURCE || sourceLabels.find(Boolean) || "Turso patent_metrics";
  const sourceUrl = sourceUrls.find(Boolean);
  const asOf = snapshotAsOf || latestValue(asOfDates.filter(Boolean)) || "데이터 기준일 미설정";

  return {
    techFields: fields,
    companies: withTotals(fixtures, fields),
    years: loadedYears,
    timeline: loadedTimeline,
    meta: {
      source,
      sourceUrl,
      asOf,
      note: "Turso에서 읽은 특허 지표입니다."
    }
  };
}

export function getPatentData(): Promise<PatentData> {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  const ttl = cacheTtlMs();
  const key = cacheKey(url, authToken);
  const now = Date.now();

  if (ttl > 0 && cachedData?.key === key && cachedData.expiresAt > now) {
    return cachedData.promise;
  }

  const promise = loadPatentData().catch(error => {
    if (cachedData?.key === key) cachedData = undefined;
    throw error;
  });
  if (ttl > 0) {
    cachedData = { key, expiresAt: now + ttl, promise };
  }
  return promise;
}
