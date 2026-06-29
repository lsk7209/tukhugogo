import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ActionCta, MethodologyBlock, MetricGrid } from "@/components/DataQualityBlocks";
import { JsonLd } from "@/components/JsonLd";
import { RelatedLinkStrip } from "@/components/RelatedLinkStrip";
import { SeoFaq } from "@/components/SeoFaq";
import { SiteHeader } from "@/components/SiteHeader";
import { SourceCaption } from "@/components/SourceCaption";
import { TableOfContents } from "@/components/TableOfContents";
import { PatentTools } from "@/components/tools";
import { dataPageJsonLd } from "@/lib/data-page-seo";
import { getPatentData, isDemoDataConfigured } from "@/lib/patent-data";
import { canonicalUrl, fieldPath, topCompaniesForField } from "@/lib/keyword-taxonomy";
import { siteProfile } from "@/lib/site";

type PageProps = {
  params: Promise<{ fieldId: string }>;
};

export async function generateStaticParams() {
  const data = await getPatentData();
  return data.techFields.map(field => ({ fieldId: field.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { fieldId } = await params;
  const data = await getPatentData();
  const field = data.techFields.find(item => item.id === fieldId);
  if (!field) return {};

  const robots = isDemoDataConfigured() ? { index: false, follow: true } : undefined;

  return {
    title: `${field.name} 특허 순위`,
    description: `${field.name} 분야 주요 출원인 순위와 등록률을 출처 기준일과 함께 확인합니다.`,
    alternates: { canonical: canonicalUrl(`/ranking/${field.id}`) },
    robots,
    openGraph: {
      title: `${field.name} 특허 순위 | ${siteProfile.name}`,
      description: `${field.name} 분야 출원인 랭킹입니다.`,
      url: canonicalUrl(`/ranking/${field.id}`),
      type: "article",
      locale: "ko_KR",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: `${field.name} 특허 순위 데이터` }]
    },
    twitter: {
      card: "summary_large_image",
      title: `${field.name} 특허 순위 | ${siteProfile.name}`,
      description: `${field.name} 분야 출원인 랭킹입니다.`,
      images: ["/og-image.png"]
    }
  };
}

export default async function RankingPage({ params }: PageProps) {
  const { fieldId } = await params;
  const data = await getPatentData();
  const field = data.techFields.find(item => item.id === fieldId);
  if (!field) notFound();

  const rows = topCompaniesForField(data, field.id);
  const leader = rows[0];
  const second = rows[1];
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const top3Total = rows.slice(0, 3).reduce((sum, row) => sum + row.count, 0);
  const top3Share = total ? Math.round((top3Total / total) * 100) : 0;
  const rankGap = leader && second ? leader.count - second.count : 0;
  const url = canonicalUrl(`/ranking/${field.id}`);
  const basisLabel = isDemoDataConfigured() ? "시연 데이터 기준" : `${data.meta.asOf} 공개데이터 기준`;

  return (
    <>
      <SiteHeader techHref={fieldPath(field)} />
      <JsonLd
        data={dataPageJsonLd({
          url,
          headline: `${field.name} 특허 순위`,
          description: `${field.name} 분야의 출원인 순위, 등록률, 상위 집중도와 해석 기준을 정리한 데이터 페이지입니다.`,
          keywords: [field.name, `${field.name} 특허 순위`, "출원인 순위", "등록률", "배터리 특허"],
          about: [field.name, "특허 순위", "출원인", "등록률"],
          source: data.meta.source,
          sourceUrl: data.meta.sourceUrl,
          asOf: data.meta.asOf,
          datasetName: `${field.name} 출원인 순위 데이터`,
          datasetDescription: `${field.name} 분야의 출원인별 출원 수와 등록률을 정리한 공개 특허 데이터입니다.`,
          variables: ["출원인", "순위", "출원 수", "등록률", "상위 3개사 비중"],
          breadcrumbs: [
            { name: "홈", path: "/" },
            { name: `${field.name} 특허 동향`, path: `/tech/${field.id}` },
            { name: `${field.name} 특허 순위`, path: `/ranking/${field.id}` }
          ]
        })}
      />
      <main className="article-page">
        <div className="container article-grid">
          <article className="article-body">
            <p className="eyebrow">출원인 순위</p>
            <h1>{field.name} 특허 순위</h1>
            <p className="direct-answer">
              {field.name} 분야의 {basisLabel} 1위 출원인은 {leader?.company.name ?? "확인 필요"}입니다.
              {leader ? ` 출원 수는 ${leader.count.toLocaleString("ko-KR")}건, 등록률은 ${leader.reg}%입니다.` : ""}
              이 순위는 우열 판단이 아니라 출원 분포와 경쟁 집중도를 탐색하기 위한 기준입니다.
            </p>
            <MetricGrid
              metrics={[
                { label: "1위 출원인", value: leader?.company.name ?? "확인 필요", note: leader ? `${leader.count.toLocaleString("ko-KR")}건 출원` : "데이터 연결 후 표시됩니다." },
                { label: "1·2위 격차", value: second ? `${rankGap.toLocaleString("ko-KR")}건` : "확인 필요", note: second ? `${second.company.name} 대비 차이입니다.` : "2위 출원인 연결 후 산출합니다." },
                { label: "상위 3개사 비중", value: `${top3Share}%`, note: "분야 내 경쟁 집중도를 보는 보조 지표입니다." }
              ]}
            />
            <TableOfContents
              items={[
                { id: "ranking-table", label: `${field.name} 출원인 TOP 순위` },
                { id: "how-to-read", label: "순위와 등록률 해석법" },
                { id: "compare", label: "상위 출원인 포트폴리오 비교" },
                { id: "faq-title", label: "자주 묻는 질문" }
              ]}
            />
            <RelatedLinkStrip
              title="빠른 관련 링크"
              links={[
                { href: fieldPath(field), label: `${field.name} 특허 동향` },
                { href: "/guide/patent-map", label: "특허맵이란" },
                { href: "/guide/ipc-code", label: "IPC 분류 뜻" }
              ]}
            />
            <SourceCaption meta={data.meta} />
            <MethodologyBlock data={data} unit={`${field.name} 분야의 출원인별 출원 수와 등록률`} />

            <section id="ranking-table">
              <h2>{field.name} 출원인 TOP 순위와 등록률</h2>
              <table className="data-table">
                <caption>{field.name} 분야 출원인별 출원 수와 등록률 순위</caption>
                <thead><tr><th>순위</th><th>출원인</th><th>출원</th><th>등록률</th></tr></thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row.company.id}>
                      <td className="mono">{index + 1}</td>
                      <td><Link href={`/company/${row.company.id}`}>{row.company.name}</Link></td>
                      <td className="mono">{row.count.toLocaleString("ko-KR")}</td>
                      <td className="mono">{row.reg}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <ActionCta
                href={fieldPath(field)}
                label={`${field.name} 연도별 출원 흐름 같이 보기`}
                description="순위는 누적 분포를 보여주고, 동향 페이지는 최근 증가·감소 구간을 보여줍니다. 두 화면을 함께 봐야 특정 기업의 최근 움직임을 더 안전하게 판단할 수 있습니다."
              />
            </section>

            <section id="how-to-read">
              <h2>{field.name} 순위와 등록률을 함께 해석하는 법</h2>
              <p>
                출원 순위는 특정 기술분야에 얼마나 많은 권리 확보 시도가 있었는지 보여줍니다. 하지만 출원 건수가 많다고
                바로 권리 품질이 높거나 사업 성과가 크다고 볼 수는 없습니다. 등록률과 청구항 범위, 최근 출원 증가 여부를 함께 확인해야 합니다.
              </p>
              <p>
                소재 기업은 특정 조성이나 제조 공정에 집중하는 경우가 많고, 셀 기업은 셀 구조와 안전성 개선까지 넓게 출원할 수 있습니다.
                완성차 기업은 BMS, 팩, 열관리처럼 시스템 적용 분야에 강하게 나타날 수 있어 기업 유형별 차이를 분리해서 읽어야 합니다.
              </p>
              <p>
                이 데이터에서는 상위 3개사의 출원 비중이 약 {top3Share}%입니다. 집중도가 높으면 선두 기업의 방어 출원과 후발 기업의 회피 설계가 중요해지고,
                집중도가 낮으면 세부 소재·공정별로 더 좁은 키워드 분석이 필요합니다.
              </p>
            </section>

            <section id="compare">
              <h2>{field.name} 상위 출원인 포트폴리오 비교</h2>
              <PatentTools data={data} initialCompanyIds={rows.slice(0, 3).map(row => row.company.id)} contextLabel={`${field.name} 순위 상위 출원인을 기본 선택했습니다.`} />
            </section>

            <SeoFaq
              items={[
                {
                  question: `${field.name} 특허 순위는 어떤 기준인가요?`,
                  answer: "현재 페이지의 순위는 시연 데이터 기준 출원 건수를 중심으로 정렬했습니다. 실제 운영 데이터에서는 출처와 기준일을 함께 확인해야 합니다."
                },
                {
                  question: "등록률이 높으면 더 좋은 특허인가요?",
                  answer: "등록률은 참고 지표입니다. 권리 범위가 좁게 등록된 특허와 넓게 등록된 특허의 가치는 다를 수 있어 청구항 확인이 필요합니다."
                }
              ]}
            />
          </article>
          <aside className="related-rail">
            <b>관련 검색</b>
            <Link href="/blog/">전체 글 목록</Link>
            <Link href={fieldPath(field)}>{field.name} 특허 동향</Link>
            <Link href="/guide/patent-map">특허맵이란</Link>
            <Link href="/guide/ipc-code">IPC 분류 뜻</Link>
          </aside>
        </div>
      </main>
    </>
  );
}
