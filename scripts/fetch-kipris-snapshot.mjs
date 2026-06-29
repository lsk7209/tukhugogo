import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const outRoot = path.join(root, "output", "patentgogo", "public-data");
const rawDir = path.join(outRoot, "raw");
const snapshotDir = path.join(outRoot, "snapshots");
const briefDir = path.join(outRoot, "content-briefs");
const endpoint = "http://plus.kipris.or.kr/kipo-api/kipi/patUtiModInfoSearchSevice/getWordSearch";

const techFields = [
  {
    id: "cathode",
    ipc: "H01M 4/00",
    name: "양극재",
    shortName: "양극재",
    word: "이차전지 양극재",
    description: "리튬 이차전지 양극 활물질, 조성, 코팅, 제조 공정 관련 공개 특허"
  },
  {
    id: "anode",
    ipc: "H01M 4/13",
    name: "음극재",
    shortName: "음극재",
    word: "이차전지 음극재",
    description: "흑연, 실리콘, 리튬금속 음극 소재와 수명 개선 관련 공개 특허"
  },
  {
    id: "electrolyte",
    ipc: "H01M 10/05",
    name: "전해질",
    shortName: "전해질",
    word: "이차전지 전해질",
    description: "전해액, 첨가제, 고체전해질, 계면 안정화 관련 공개 특허"
  },
  {
    id: "separator",
    ipc: "H01M 50/40",
    name: "분리막",
    shortName: "분리막",
    word: "이차전지 분리막",
    description: "세라믹 코팅, 내열층, 다공성 분리막 안전성 관련 공개 특허"
  },
  {
    id: "cell",
    ipc: "H01M 50/00",
    name: "셀·패키지",
    shortName: "셀",
    word: "이차전지 셀 패키지",
    description: "셀 구조, 모듈, 팩 설계, 안전 구조 관련 공개 특허"
  },
  {
    id: "bms",
    ipc: "H02J 7/00",
    name: "BMS·관리",
    shortName: "BMS",
    word: "배터리 관리 시스템 충전 제어",
    description: "배터리 관리, 충전 제어, 진단 알고리즘, 열관리 관련 공개 특허"
  },
  {
    id: "solid",
    ipc: "H01M 10/056",
    name: "전고체",
    shortName: "전고체",
    word: "전고체 배터리 고체전해질",
    description: "황화물·산화물 고체전해질, 계면저항, 전고체 전지 구조 관련 공개 특허"
  }
];

function argValue(name, fallback = undefined) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function hasFlag(name) {
  return process.argv.includes(name);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function readSecret(value, fileCandidates) {
  if (value?.trim()) return value.trim();
  for (const file of fileCandidates.filter(Boolean)) {
    if (existsSync(file)) return readFileSync(file, "utf8").trim();
  }
  return "";
}

function serviceKeyParam(key) {
  return key.includes("%") ? key : encodeURIComponent(key);
}

function decodeXml(value) {
  return value
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .trim();
}

function tag(block, name) {
  const match = block.match(new RegExp(`<${name}>([\\s\\S]*?)<\\/${name}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

function parseResponse(xml) {
  const itemBlocks = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map(match => match[1]);
  return {
    resultCode: tag(xml, "resultCode"),
    resultMsg: tag(xml, "resultMsg"),
    totalCount: Number(tag(xml, "totalCount") || 0),
    items: itemBlocks.map(block => ({
      indexNo: tag(block, "indexNo"),
      registerStatus: tag(block, "registerStatus"),
      inventionTitle: tag(block, "inventionTitle"),
      ipcNumber: tag(block, "ipcNumber"),
      registerNumber: tag(block, "registerNumber"),
      registerDate: tag(block, "registerDate"),
      applicationNumber: tag(block, "applicationNumber"),
      applicationDate: tag(block, "applicationDate"),
      openNumber: tag(block, "openNumber"),
      openDate: tag(block, "openDate"),
      publicationNumber: tag(block, "publicationNumber"),
      publicationDate: tag(block, "publicationDate"),
      abstract: tag(block, "astrtCont"),
      applicantName: tag(block, "applicantName")
    }))
  };
}

function normalizeApplicantName(name) {
  const first = String(name || "미상")
    .split(/[|;,]/)[0]
    .replace(/\s+/g, " ")
    .trim();
  const normalized = first
    .replace(/\(주\)|주식회사|㈜/g, "")
    .replace(/\s+/g, "")
    .toUpperCase();
  return {
    display: first || "미상",
    normalized: normalized || "미상"
  };
}

function applicantId(normalizedName) {
  return `a_${createHash("sha1").update(normalizedName).digest("hex").slice(0, 10)}`;
}

function applicationYear(item) {
  const raw = item.applicationDate || item.openDate || item.publicationDate || "";
  const match = raw.match(/\b(19|20)\d{2}\b/);
  return match ? Number(match[0]) : undefined;
}

function isRegistered(item) {
  return Boolean(item.registerNumber) || /등록|유지|소멸|만료/.test(item.registerStatus || "");
}

function buildUrl(field, pageNo, rows, yearRange, serviceKey) {
  const params = [
    ["word", field.word],
    ["year", String(yearRange)],
    ["patent", "true"],
    ["utility", "false"],
    ["numOfRows", String(rows)],
    ["pageNo", String(pageNo)]
  ]
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  return `${endpoint}?${params}&ServiceKey=${serviceKeyParam(serviceKey)}`;
}

async function fetchField(field, serviceKey, options) {
  const allItems = [];
  const pages = [];
  for (let pageNo = 1; pageNo <= options.maxPages; pageNo += 1) {
    const url = buildUrl(field, pageNo, options.rows, options.yearRange, serviceKey);
    const response = await fetch(url, { headers: { "user-agent": "patentgogo-data-pipeline/1.0" } });
    const xml = await response.text();
    const parsed = parseResponse(xml);
    pages.push({ pageNo, status: response.status, resultCode: parsed.resultCode, resultMsg: parsed.resultMsg, totalCount: parsed.totalCount, xml });
    if (!response.ok || (parsed.resultCode && parsed.resultCode !== "00")) {
      throw new Error(`KIPRIS request failed for ${field.id} page ${pageNo}: HTTP ${response.status}, ${parsed.resultCode} ${parsed.resultMsg}`);
    }
    allItems.push(...parsed.items);
    if (!parsed.items.length || allItems.length >= parsed.totalCount) break;
  }
  return { field, items: allItems, pages };
}

function buildSnapshot(results, asOf) {
  const applicantMap = new Map();
  const fieldApplicant = new Map();
  const fieldYears = new Map();
  const allYears = new Set();
  const examplesByField = {};

  for (const { field, items } of results) {
    examplesByField[field.id] = items.slice(0, 8).map(item => ({
      title: item.inventionTitle,
      applicant: item.applicantName,
      applicationNumber: item.applicationNumber,
      openNumber: item.openNumber,
      ipcNumber: item.ipcNumber,
      applicationDate: item.applicationDate,
      abstract: item.abstract
    }));

    for (const item of items) {
      const year = applicationYear(item);
      if (!year) continue;
      allYears.add(year);
      const yearKey = `${field.id}|${year}`;
      fieldYears.set(yearKey, (fieldYears.get(yearKey) ?? 0) + 1);

      const applicant = normalizeApplicantName(item.applicantName);
      const id = applicantId(applicant.normalized);
      if (!applicantMap.has(id)) {
        applicantMap.set(id, { id, name: applicant.display, tag: "KIPRIS 출원인", normalizedName: applicant.normalized });
      }
      const metricKey = `${field.id}|${id}`;
      const current = fieldApplicant.get(metricKey) ?? { techFieldId: field.id, applicantId: id, filingCount: 0, registered: 0 };
      current.filingCount += 1;
      if (isRegistered(item)) current.registered += 1;
      fieldApplicant.set(metricKey, current);
    }
  }

  const years = [...allYears].filter(year => year >= 2016).sort((a, b) => a - b);
  const fieldYearMetrics = [];
  for (const field of techFields) {
    for (const year of years) {
      fieldYearMetrics.push({
        techFieldId: field.id,
        year,
        filingCount: fieldYears.get(`${field.id}|${year}`) ?? 0
      });
    }
  }

  const fieldApplicantMetrics = [...fieldApplicant.values()]
    .map(metric => ({
      techFieldId: metric.techFieldId,
      applicantId: metric.applicantId,
      filingCount: metric.filingCount,
      registrationRate: metric.filingCount ? Math.round((metric.registered / metric.filingCount) * 100) : 0
    }))
    .filter(metric => metric.filingCount > 0)
    .sort((a, b) => b.filingCount - a.filingCount)
    .slice(0, Number(argValue("--max-applicant-metrics", "120")));

  const applicantIds = new Set(fieldApplicantMetrics.map(metric => metric.applicantId));
  const applicants = [...applicantMap.values()]
    .filter(applicant => applicantIds.has(applicant.id))
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));

  return {
    sourceLabel: "KIPRIS Plus getWordSearch 공개데이터",
    sourceUrl: "https://plus.kipris.or.kr/",
    asOf,
    techFields: techFields.map(({ word, ...field }) => field),
    applicants,
    fieldApplicantMetrics,
    fieldYearMetrics,
    contentBriefs: Object.fromEntries(
      techFields.map(field => [
        field.id,
        {
          titleSeed: `${field.name} 특허 동향: ${field.word} 공개데이터로 보는 출원 흐름`,
          searchIntent: `${field.name} 분야의 최근 출원인, 공개문헌, IPC 흐름을 확인하려는 정보 탐색`,
          recommendedAngle: "출원 건수만 나열하지 않고 상위 출원인 집중도, 등록 상태, 최근 공개 지연 가능성을 함께 설명",
          examples: examplesByField[field.id] ?? []
        }
      ])
    )
  };
}

function writeJson(file, value) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function main() {
  const asOf = argValue("--as-of", today());
  const serviceKey = readSecret(process.env.KIPRIS_SERVICE_KEY || process.env.DATA_GO_KR_SERVICE_KEY, [
    argValue("--service-key-file"),
    "D:\\env\\kipris_service_key.txt",
    "D:\\env\\data_gov_api_key.txt"
  ]);
  if (!serviceKey) {
    throw new Error("Missing KIPRIS service key. Set KIPRIS_SERVICE_KEY or pass --service-key-file.");
  }

  const options = {
    rows: Number(argValue("--rows", "100")),
    maxPages: Number(argValue("--max-pages", "2")),
    yearRange: Number(argValue("--year-range", "10"))
  };

  mkdirSync(rawDir, { recursive: true });
  const results = [];
  for (const field of techFields) {
    const result = await fetchField(field, serviceKey, options);
    results.push(result);
    writeJson(path.join(rawDir, `${asOf}-${field.id}.json`), {
      field: result.field,
      fetchedAt: new Date().toISOString(),
      pages: result.pages.map(({ xml, ...page }) => page),
      items: result.items
    });
  }

  const snapshot = buildSnapshot(results, asOf);
  const snapshotFile = path.join(snapshotDir, `kipris-${asOf}.json`);
  const briefFile = path.join(briefDir, `kipris-${asOf}.json`);
  writeJson(snapshotFile, snapshot);
  writeJson(briefFile, snapshot.contentBriefs);

  const summary = {
    ok: true,
    mode: hasFlag("--apply") ? "apply" : "dry-run",
    snapshotFile,
    briefFile,
    asOf,
    fields: snapshot.techFields.length,
    applicants: snapshot.applicants.length,
    fieldApplicantMetrics: snapshot.fieldApplicantMetrics.length,
    fieldYearMetrics: snapshot.fieldYearMetrics.length
  };

  if (hasFlag("--apply")) {
    const tursoUrlFile = argValue("--database-url-file", "D:\\env\\turso_database_url.txt");
    const tursoTokenFile = argValue("--auth-token-file", "D:\\env\\turso_auth_token.txt");
    const importResult = spawnSync(process.execPath, [
      "scripts/import-patent-snapshot.mjs",
      "--file",
      snapshotFile,
      "--apply",
      "--database-url-file",
      tursoUrlFile,
      "--auth-token-file",
      tursoTokenFile
    ], { cwd: root, encoding: "utf8" });
    if (importResult.status !== 0) {
      throw new Error(`Snapshot import failed: ${importResult.stderr || importResult.stdout}`);
    }
    summary.imported = true;
    summary.importOutput = JSON.parse(importResult.stdout);
  }

  console.log(JSON.stringify(summary, null, 2));
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
