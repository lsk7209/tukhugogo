import Link from "next/link";
import type { PatentData } from "@/lib/patent-data";

type Metric = {
  label: string;
  value: string;
  note: string;
};

type MethodologyBlockProps = {
  data: PatentData;
  unit: string;
};

type ActionCtaProps = {
  href: string;
  label: string;
  description: string;
};

export function MetricGrid({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="metric-grid" aria-label="핵심 데이터 요약">
      {metrics.map(metric => (
        <div className="metric-card" key={metric.label}>
          <span>{metric.label}</span>
          <b>{metric.value}</b>
          <p>{metric.note}</p>
        </div>
      ))}
    </div>
  );
}

export function MethodologyBlock({ data, unit }: MethodologyBlockProps) {
  return (
    <aside className="article-visual data-method-box">
      <strong>공공데이터 집계 기준</strong>
      <ul>
        <li>원천 출처는 {data.meta.source}이며, 기준일은 {data.meta.asOf}입니다.</li>
        <li>집계 단위는 {unit}입니다. 동일 기업의 표기 차이와 계열명은 운영 데이터에서 정규화가 필요합니다.</li>
        <li>최근 연도는 공개 지연, 심사 진행, 데이터 반영 주기에 따라 실제 활동보다 낮게 보일 수 있습니다.</li>
        <li>등록률은 권리 품질의 단독 지표가 아니며 청구항 범위, 패밀리 국가, 원문 확인과 함께 해석해야 합니다.</li>
      </ul>
    </aside>
  );
}

export function ActionCta({ href, label, description }: ActionCtaProps) {
  return (
    <div className="inline-callout action-cta">
      <b>{label}</b>
      <p>{description}</p>
      <Link className="text-link" href={href}>바로 확인하기</Link>
    </div>
  );
}
