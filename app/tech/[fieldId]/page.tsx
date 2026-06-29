import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ActionCta, MethodologyBlock, MetricGrid } from "@/components/DataQualityBlocks";
import { JsonLd } from "@/components/JsonLd";
import { LineChart } from "@/components/charts";
import { RelatedLinkStrip } from "@/components/RelatedLinkStrip";
import { SeoFaq } from "@/components/SeoFaq";
import { SiteHeader } from "@/components/SiteHeader";
import { SourceCaption } from "@/components/SourceCaption";
import { TableOfContents } from "@/components/TableOfContents";
import { PatentTools } from "@/components/tools";
import { dataPageJsonLd } from "@/lib/data-page-seo";
import { getPatentData, isDemoDataConfigured, koNum } from "@/lib/patent-data";
import { canonicalUrl, rankingPath, topCompaniesForField } from "@/lib/keyword-taxonomy";
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
    title: `${field.name} 특허 동향`,
    description: `${field.name} 특허 출원 추이, 주요 출원인, 관련 IPC ${field.ipc}, 해석 기준을 데이터로 확인합니다.`,
    alternates: { canonical: canonicalUrl(`/tech/${field.id}`) },
    robots,
    openGraph: {
      title: `${field.name} 특허 동향 | ${siteProfile.name}`,
      description: `${field.name} 특허 출원 추이와 주요 출원인을 확인합니다.`,
      url: canonicalUrl(`/tech/${field.id}`),
      type: "article",
      locale: "ko_KR",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: `${field.name} 특허 동향 데이터` }]
    },
    twitter: {
      card: "summary_large_image",
      title: `${field.name} 특허 동향 | ${siteProfile.name}`,
      description: `${field.name} 특허 출원 추이와 주요 출원인을 확인합니다.`,
      images: ["/og-image.png"]
    }
  };
}

export default async function TechPage({ params }: PageProps) {
  const { fieldId } = await params;
  const data = await getPatentData();
  const field = data.techFields.find(item => item.id === fieldId);
  if (!field) notFound();

  const values = data.timeline[field.id] ?? [];
  const latest = values.at(-1) ?? 0;
  const first = values[0] ?? 0;
  const growth = first ? Math.round(((latest - first) / first) * 100) : 0;
  const top = topCompaniesForField(data, field.id).slice(0, 5);
  const leader = top[0];
  const url = canonicalUrl(`/tech/${field.id}`);
  const total = values.reduce((sum, value) => sum + value, 0);
  const topShare = total && leader ? Math.round((leader.count / total) * 100) : 0;
  const latestYear = data.years.at(-1) ?? "최근";
  const basisLabel = isDemoDataConfigured() ? "시연 데이터 기준" : `${data.meta.asOf} 공개데이터 기준`;

  return (
    <>
      <SiteHeader techHref={`/tech/${field.id}`} />
      <JsonLd
        data={dataPageJsonLd({
          url,
          headline: `${field.name} 특허 동향`,
          description: `${field.name} 분야의 출원 추이, 주요 출원인, IPC ${field.ipc}, 집계 기준과 해석 한계를 정리한 데이터 페이지입니다.`,
          keywords: [field.name, `${field.name} 특허`, "특허 동향", field.ipc, "배터리 특허"],
          about: [field.name, "특허 출원", "배터리 기술", field.ipc],
          source: data.meta.source,
          sourceUrl: data.meta.sourceUrl,
          asOf: data.meta.asOf,
          datasetName: `${field.name} 특허 출원 추이 데이터`,
          datasetDescription: `${field.name} 분야의 연도별 출원 수, 주요 출원인, 등록률을 정리한 공개 특허 데이터입니다.`,
          variables: ["연도별 출원 수", "출원인별 출원 수", "등록률", "IPC"],
          temporalCoverage: `${data.years[0]}/${latestYear}`,
          breadcrumbs: [
            { name: "홈", path: "/" },
            { name: `${field.name} 특허 동향`, path: `/tech/${field.id}` }
          ]
        })}
      />
      <main className="article-page">
        <div className="container article-grid">
          <article className="article-body">
            <p className="eyebrow">기술 동향</p>
            <h1>{field.name} 특허 동향</h1>
            <p className="direct-answer">
              {field.name} 분야의 {latestYear}년 출원은 {koNum(latest)}건이며, 기준 IPC는 {field.ipc}입니다.
              {basisLabel} 2016년 대비 증가율은 약 {growth}%이고, {leader ? `최다 출원인은 ${leader.company.name}입니다.` : "최다 출원인은 데이터 연결 후 확인해야 합니다."}
            </p>
            <MetricGrid
              metrics={[
                { label: "누적 출원", value: `${koNum(total)}건`, note: `${data.years[0]}~${latestYear}년 집계 합계입니다.` },
                { label: "최근 증가율", value: `${growth}%`, note: "첫 연도 대비 마지막 연도 기준의 방향성 지표입니다." },
                { label: "상위 집중도", value: leader ? `${topShare}%` : "확인 필요", note: leader ? `${leader.company.name} 출원 비중입니다.` : "상위 출원인 연결 후 산출합니다." }
              ]}
            />
            <TableOfContents
              items={[
                { id: "overview", label: `${field.name} 분야 개요` },
                { id: "trend", label: `${field.name} 연도별 출원 추이` },
                { id: "applicants", label: `${field.name} 주요 출원인` },
                { id: "interpretation", label: "출원 증가 해석 한계" },
                { id: "compare", label: `${field.name} 기업 비교` },
                { id: "faq-title", label: "자주 묻는 질문" }
              ]}
            />
            <RelatedLinkStrip
              title="빠른 관련 링크"
              links={[
                { href: rankingPath(field), label: `${field.name} 특허 순위` },
                { href: "/guide/kipris-search", label: "KIPRIS 특허 검색" },
                { href: "/guide/patent-map", label: "특허맵이란" }
              ]}
            />

            <section id="overview">
              <h2>{field.name} 분야 개요</h2>
              <p>{field.desc}를 중심으로 묶은 기술 영역입니다. 같은 IPC 안에서도 소재 조성, 제조 공정, 셀 적용 방식, 안전성 개선처럼 세부 쟁점이 나뉘므로 출원 건수만으로 결론을 내리면 안 됩니다.</p>
              <p>이 페이지는 분야별 흐름을 빠르게 보기 위한 시작점입니다. 관심 기업이 보이면 순위표와 기업별 페이지로 이동해 어떤 분야에 출원이 집중되는지 함께 확인하는 것이 좋습니다.</p>
            </section>

            <section id="trend">
              <h2>{field.name} 연도별 출원 추이와 증가 구간</h2>
              <div className="chart-box"><LineChart years={data.years} values={values} /></div>
              <p>
                장기 추이는 연구개발 관심과 포트폴리오 축적 방향을 보여줍니다. 다만 최근 연도는 공개 지연과 심사 진행 상태의 영향을 받을 수 있어
                절대 건수보다 증가 방향과 기업별 분포를 함께 보는 것이 안전합니다.
              </p>
              <SourceCaption meta={data.meta} />
              <MethodologyBlock data={data} unit={`${field.name} 분야의 연도·출원인·등록률`} />
            </section>

            <section id="applicants">
              <h2>{field.name} 주요 출원인</h2>
              <table className="data-table">
                <caption>{field.name} 분야 상위 출원인의 출원 수와 등록률</caption>
                <thead><tr><th>출원인</th><th>출원</th><th>등록률</th></tr></thead>
                <tbody>
                  {top.map(row => (
                    <tr key={row.company.id}>
                      <td><Link href={`/company/${row.company.id}`}>{row.company.name}</Link></td>
                      <td className="mono">{row.count.toLocaleString("ko-KR")}</td>
                      <td className="mono">{row.reg}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <ActionCta
                href={rankingPath(field)}
                label={`전체 ${field.name} 출원인 순위 보기`}
                description="상위 5개사만으로는 경쟁 구도가 좁게 보일 수 있습니다. 전체 순위에서 1위와 후발 출원인의 격차를 함께 확인하세요."
              />
            </section>

            <section id="interpretation">
              <h2>{field.name} 출원 증가를 기술 경쟁력으로 볼 때의 한계</h2>
              <p>
                {leader ? `${leader.company.name}이 이 분야에서 가장 많은 출원을 보이지만, ` : ""}
                순위는 기술 우위나 사업 성과를 그대로 뜻하지 않습니다. 등록률, 패밀리 국가, 청구항 범위, 실제 제품 적용 여부를 함께 검토해야 합니다.
              </p>
              <p>
                특히 배터리 특허는 소재 기업, 셀 기업, 완성차 기업의 출원 목적이 다릅니다. 방어 출원과 양산 적용 출원이 섞일 수 있으므로
                분야별 순위는 경쟁 구도를 읽는 출발점으로 활용하는 편이 적절합니다.
              </p>
              <p>
                {leader
                  ? `${leader.company.name}의 비중이 약 ${topShare}%로 보이는 경우에도, 해당 기업의 실제 강점은 청구항 범위와 패밀리 국가를 확인해야 판단할 수 있습니다.`
                  : "상위 출원인 데이터가 연결되면 특정 기업 집중도와 장기 증가 구간을 함께 읽어야 합니다."}
                이 페이지는 공개 특허 메타데이터 기반 탐색 자료이며, 권리범위 판단은 등록 청구항과 원문 확인이 필요합니다.
              </p>
            </section>

            <section id="compare">
              <h2>기업 비교</h2>
              <PatentTools data={data} initialCompanyIds={top.slice(0, 3).map(row => row.company.id)} contextLabel={`${field.name} 검색 의도에 맞춰 주요 출원인을 기본 선택했습니다.`} />
            </section>

            <SeoFaq
              items={[
                {
                  question: `${field.name} 특허 동향에서 가장 중요한 지표는 무엇인가요?`,
                  answer: "출원 건수, 최근 증가율, 등록률, 출원인 분포를 함께 봐야 합니다. 한 지표만으로 기술 경쟁력을 단정하기 어렵습니다."
                },
                {
                  question: `IPC ${field.ipc}만 보면 충분한가요?`,
                  answer: "충분하지 않습니다. IPC는 탐색 축이고, 실제 판단에는 청구항, 실시예, 패밀리 문헌, 공개 시점을 함께 확인해야 합니다."
                }
              ]}
            />
          </article>
          <aside className="related-rail">
            <b>관련 검색</b>
            <Link href="/blog/">전체 글 목록</Link>
            <Link href={rankingPath(field)}>{field.name} 특허 순위</Link>
            <Link href="/guide/kipris-search">KIPRIS 특허 검색</Link>
            <Link href="/guide/patent-map">특허맵이란</Link>
          </aside>
        </div>
      </main>
    </>
  );
}
