import { koNum, type PatentData } from "@/lib/patent-data";

export function LineChart({ years, values, secondValues }: { years: number[]; values: number[]; secondValues?: number[] }) {
  const w = 420;
  const h = 210;
  const pad = 28;
  const max = Math.max(...values, ...(secondValues ?? []), 1) * 1.1;
  const x = (i: number) => pad + (i / Math.max(years.length - 1, 1)) * (w - pad * 2);
  const y = (value: number) => h - pad - (value / max) * (h - pad * 2);
  const path = (series: number[]) => series.map((value, index) => `${index ? "L" : "M"}${x(index).toFixed(1)},${y(value).toFixed(1)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="연도별 특허 출원 추이">
      <line x1={pad} x2={w - pad} y1={h - pad} y2={h - pad} stroke="var(--line-strong)" />
      <text x={pad} y={18} fontSize="11" fill="var(--ink-faint)">출원 건수</text>
      <path d={path(values)} fill="none" stroke="var(--seal)" strokeWidth="3" />
      {secondValues ? <path d={path(secondValues)} fill="none" stroke="var(--data-ink)" strokeWidth="2.5" opacity=".82" /> : null}
      {values.map((value, index) => (
        <circle key={years[index]} cx={x(index)} cy={y(value)} r={3.8} fill="var(--paper)" stroke="var(--seal)" strokeWidth="2">
          <title>{`${years[index]}년 ${koNum(value)}건`}</title>
        </circle>
      ))}
      {years.map((year, index) => (
        index % 3 === 0 || index === years.length - 1 ? (
          <text key={year} x={x(index)} y={h - 8} fontSize="10" textAnchor="middle" fill="var(--ink-faint)">{year}</text>
        ) : null
      ))}
    </svg>
  );
}

export function FieldBarChart({ data }: { data: PatentData }) {
  const max = Math.max(...data.techFields.map(field => field.total), 1);
  return (
    <div className="mini-bars" aria-label="분야별 출원량">
      {data.techFields.map(field => (
        <div className="bar-row" key={field.id}>
          <span>{field.short}</span>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${Math.max(8, (field.total / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
