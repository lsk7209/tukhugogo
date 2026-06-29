"use client";

import { useMemo, useState } from "react";
import type { PatentData } from "@/lib/patent-data";

const colors = ["var(--seal)", "var(--data-ink)", "var(--data-grey1)"];

function comma(n: number) {
  return n.toLocaleString("ko-KR");
}

function ComparisonSvg({ data, selectedIds }: { data: PatentData; selectedIds: string[] }) {
  const selected = data.companies.filter(company => selectedIds.includes(company.id));
  const w = 560;
  const h = 310;
  const l = 86;
  const r = 22;
  const t = 22;
  const b = 42;
  const iw = w - l - r;
  const ih = h - t - b;
  const max = Math.max(...selected.flatMap(company => data.techFields.map(field => company.fields[field.id] ?? 0)), 1) * 1.12;
  const groupW = iw / data.techFields.length;
  const barW = Math.min(15, groupW / (selected.length + 1));
  const y = (value: number) => t + ih - (value / max) * ih;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="선택 기업의 분야별 특허 출원 비교">
      <line x1={l} x2={w - r} y1={t + ih} y2={t + ih} stroke="var(--line-strong)" />
      <text x="0" y="18" fontSize="11" fill="var(--ink-faint)">출원 건수</text>
      {data.techFields.map((field, fieldIndex) => {
        const gx = l + fieldIndex * groupW + groupW / 2;
        return (
          <g key={field.id}>
            {selected.map((company, companyIndex) => {
              const x = gx - (selected.length * barW) / 2 + companyIndex * barW;
              const value = company.fields[field.id] ?? 0;
              return (
                <rect key={company.id} x={x} y={y(value)} width={barW - 2} height={t + ih - y(value)} fill={colors[companyIndex]}>
                  <title>{`${company.name} ${field.short}: ${comma(value)}건`}</title>
                </rect>
              );
            })}
            <text x={gx} y={h - 15} fontSize="10" textAnchor="middle" fill="var(--ink-faint)">{field.short}</text>
          </g>
        );
      })}
      {selected.map((company, index) => (
        <g key={company.id} transform={`translate(${l + index * 138},${h - 2})`}>
          <rect width="8" height="8" fill={colors[index]} />
          <text x="14" y="8" fontSize="10" fill="var(--ink-soft)">{company.name}</text>
        </g>
      ))}
    </svg>
  );
}

function TimelineSvg({ data, year }: { data: PatentData; year: number }) {
  const yearIndex = Math.max(data.years.indexOf(year), 0);
  const values = data.techFields.map(field => data.timeline[field.id]?.[yearIndex] ?? 0);
  const w = 320;
  const h = 170;
  const l = 26;
  const r = 18;
  const t = 14;
  const b = 30;
  const iw = w - l - r;
  const ih = h - t - b;
  const max = Math.max(...values, 1) * 1.1;
  const bw = (iw / values.length) * 0.62;
  const x = (i: number) => l + (i / values.length) * iw + iw / values.length / 2;
  const y = (value: number) => t + ih - (value / max) * ih;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`${year}년 분야별 출원`}>
      <line x1={l} x2={w - r} y1={t + ih} y2={t + ih} stroke="var(--line-strong)" />
      {values.map((value, i) => (
        <g key={data.techFields[i].id}>
          <rect x={x(i) - bw / 2} y={y(value)} width={bw - 2} height={t + ih - y(value)} fill="var(--data-grey2)" />
          <text x={x(i)} y={h - 9} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--ink-faint)">
            {data.techFields[i].short}
          </text>
          <title>{`${data.techFields[i].name}: ${comma(value)}건`}</title>
        </g>
      ))}
      <text x="0" y="12" fontSize="10" fill="var(--ink-faint)">{year}년</text>
    </svg>
  );
}

export function PatentTools({
  data,
  initialCompanyIds,
  initialYear,
  contextLabel
}: {
  data: PatentData;
  initialCompanyIds?: string[];
  initialYear?: number;
  contextLabel?: string;
}) {
  const defaultIds = initialCompanyIds?.length ? initialCompanyIds.slice(0, 3) : data.companies.slice(0, 3).map(company => company.id);
  const [selectedIds, setSelectedIds] = useState(defaultIds);
  const [year, setYear] = useState(initialYear ?? data.years.at(-1) ?? 2025);
  const [trackingIds, setTrackingIds] = useState<string[]>(defaultIds.slice(0, 2));

  const selectedCompanies = useMemo(
    () => data.companies.filter(company => selectedIds.includes(company.id)),
    [data.companies, selectedIds]
  );
  const trackingCompanies = data.companies.filter(company => trackingIds.includes(company.id));

  function toggleCompany(id: string) {
    setSelectedIds(current => {
      if (current.includes(id)) return current.filter(item => item !== id);
      return [...current, id].slice(-3);
    });
  }

  function toggleTracking(id: string) {
    setTrackingIds(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  }

  return (
    <div className="tool-grid">
      <section className="tool-panel main-tool" aria-labelledby="compare-title">
        <div className="tool-head">
          <div>
            <p className="eyebrow">{contextLabel ?? "기업 비교기"}</p>
            <h3 id="compare-title">기업별 특허 포트폴리오 비교</h3>
          </div>
          <button className="cite-btn" type="button">출처 표시 복사</button>
        </div>
        <div className="company-picker" aria-label="비교할 기업 선택">
          {data.companies.map(company => (
            <button
              className="company-chip"
              type="button"
              key={company.id}
              aria-pressed={selectedIds.includes(company.id)}
              onClick={() => toggleCompany(company.id)}
            >
              {company.name}
            </button>
          ))}
        </div>
        <div className="comparison-layout">
          <div className="comparison-chart">
            <ComparisonSvg data={data} selectedIds={selectedIds} />
          </div>
          <table className="data-table">
            <thead>
              <tr><th>기업</th><th>총 출원</th><th>등록률</th></tr>
            </thead>
            <tbody>
              {selectedCompanies.map(company => (
                <tr key={company.id}>
                  <td>{company.name}</td>
                  <td>{comma(company.total)}</td>
                  <td>{company.regAvg}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="table-note">비교는 최대 3개 기업까지 표시합니다. 실제 서비스에서는 출원인 정규화와 패밀리 기준 중복 제거가 필요합니다.</p>
      </section>

      <section className="tool-panel" aria-labelledby="timeline-title">
        <div className="tool-head">
          <div>
            <p className="eyebrow">연도 필터</p>
            <h3 id="timeline-title">분야별 타임라인</h3>
          </div>
        </div>
        <div className="timeline-chart"><TimelineSvg data={data} year={year} /></div>
        <div className="slider-row">
          <span>{data.years[0]}</span>
          <input
            className="year-slider"
            type="range"
            min={data.years[0]}
            max={data.years.at(-1)}
            value={year}
            step="1"
            onChange={event => setYear(Number(event.target.value))}
            aria-label="연도 선택"
          />
          <strong>{year}</strong>
        </div>
      </section>

      <section className="tool-panel" aria-labelledby="tracking-title">
        <div className="tool-head">
          <div>
            <p className="eyebrow">관심 추적</p>
            <h3 id="tracking-title">내 추적 목록</h3>
          </div>
        </div>
        <div className="track-list" aria-label="관심 기업 선택">
          {data.companies.map(company => (
            <button
              className="track-btn"
              type="button"
              key={company.id}
              aria-pressed={trackingIds.includes(company.id)}
              onClick={() => toggleTracking(company.id)}
            >
              {company.name}
            </button>
          ))}
        </div>
        <div className="saved-box">
          <strong>{trackingCompanies.length}개 기업 추적 중</strong>
          <p>{trackingCompanies.map(company => company.name).join(", ") || "선택한 기업이 없습니다."}</p>
        </div>
      </section>
    </div>
  );
}
