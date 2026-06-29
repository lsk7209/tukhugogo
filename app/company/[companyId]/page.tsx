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
import { getPatentData, comma, isDemoDataConfigured } from "@/lib/patent-data";
import { canonicalUrl, fieldPath } from "@/lib/keyword-taxonomy";
import { siteProfile } from "@/lib/site";

type PageProps = {
  params: Promise<{ companyId: string }>;
};

export async function generateStaticParams() {
  const data = await getPatentData();
  return data.companies.map(company => ({ companyId: company.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { companyId } = await params;
  const data = await getPatentData();
  const company = data.companies.find(item => item.id === companyId);
  if (!company) return {};

  const robots = isDemoDataConfigured() ? { index: false, follow: true } : undefined;

  return {
    title: `${company.name} 특허 데이터`,
    description: `${company.name}의 기술분야별 특허 출원 분포와 평균 등록률을 중심으로 확인합니다.`,
    alternates: { canonical: canonicalUrl(`/company/${company.id}`) },
    robots,
    openGraph: {
      title: `${company.name} 특허 데이터 | ${siteProfile.name}`,
      description: `${company.name}의 배터리 특허 포트폴리오를 확인합니다.`,
      url: canonicalUrl(`/company/${company.id}`),
      type: "article",
      locale: "ko_KR",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: `${company.name} 특허 데이터` }]
    },
    twitter: {
      card: "summary_large_image",
      title: `${company.name} 특허 데이터 | ${siteProfile.name}`,
      description: `${company.name}의 배터리 특허 포트폴리오를 확인합니다.`,
      images: ["/og-image.png"]
    }
  };
}

export default async function CompanyPage({ params }: PageProps) {
  const { companyId } = await params;
  const data = await getPatentData();
  const company = data.companies.find(item => item.id === companyId);
  if (!company) notFound();

  const rows = data.techFields
    .map(field => ({ field, count: company.fields[field.id] ?? 0, reg: company.reg[field.id] ?? 0 }))
    .sort((a, b) => b.count - a.count);
  const relatedField = rows[0]?.field ?? data.techFields[0];
  const strongest = rows[0];
  const second = rows[1];
  const strongestShare = company.total && strongest ? Math.round((strongest.count / company.total) * 100) : 0;
  const url = canonicalUrl(`/company/${company.id}`);
  const basisLabel = isDemoDataConfigured() ? "시연 데이터 기준" : `${data.meta.asOf} 공개데이터 기준`;

  return (
    <>
      <SiteHeader techHref={relatedField ? fieldPath(relatedField) : "/#tools"} />
      <JsonLd
        data={dataPageJsonLd({
          url,
          headline: `${company.name} 특허 데이터`,
          description: `${company.name}의 기술분야별 특허 출원 분포, 평균 등록률, 포트폴리오 집중도를 정리한 데이터 페이지입니다.`,
          keywords: [company.name, `${company.name} 특허`, "기업 특허 포트폴리오", "배터리 특허", "등록률"],
          about: [company.name, "특허 포트폴리오", "배터리 기술", "등록률"],
          source: data.meta.source,
          sourceUrl: data.meta.sourceUrl,
          asOf: data.meta.asOf,
          datasetName: `${company.name} 특허 포트폴리오 데이터`,
          datasetDescription: `${company.name}의 기술분야별 출원 수와 등록률을 정리한 공개 특허 데이터입니다.`,
          variables: ["기술분야", "출원 수", "등록률", "상위 분야 비중", "평균 등록률"],
          breadcrumbs: [
            { name: "홈", path: "/" },
            { name: `${company.name} 특허 데이터`, path: `/company/${company.id}` }
          ]
        })}
      />
      <main className="article-page">
        <div className="container article-grid">
          <article className="article-body">
            <p className="eyebrow">기업 데이터</p>
            <h1>{company.name} 특허 데이터</h1>
            <p className="direct-answer">
              {company.name}의 {basisLabel} 총 출원은 {comma(company.total)}건이며, 평균 등록률은 {company.regAvg}%입니다.
              가장 큰 비중은 {strongest?.field.name ?? "확인 필요"} 분야에서 나타납니다.
            </p>
            <MetricGrid
              metrics={[
                { label: "총 출원", value: `${comma(company.total)}건`, note: "분야별 출원 수를 합산한 값입니다." },
                { label: "평균 등록률", value: `${company.regAvg}%`, note: "출원 수로 가중한 등록률입니다." },
                { label: "상위 분야 비중", value: strongest ? `${strongestShare}%` : "확인 필요", note: strongest ? `${strongest.field.name} 집중도입니다.` : "분야 데이터 연결 후 산출합니다." }
              ]}
            />
            <TableOfContents
              items={[
                { id: "distribution", label: `${company.name} 기술분야별 분포` },
                { id: "portfolio-read", label: "포트폴리오 집중도 해석" },
                { id: "compare", label: "경쟁사 비교 도구" },
                { id: "faq-title", label: "자주 묻는 질문" }
              ]}
            />
            <RelatedLinkStrip
              title="빠른 관련 링크"
              links={[
                ...(relatedField ? [{ href: `/ranking/${relatedField.id}`, label: `${relatedField.name} 특허 순위` }] : []),
                { href: "/guide/kipris-search", label: "KIPRIS 특허 검색" },
                { href: "/guide/patent-filing-cost", label: "특허 출원 비용" }
              ]}
            />
            <SourceCaption meta={data.meta} />
            <MethodologyBlock data={data} unit={`${company.name}의 기술분야별 출원 수와 등록률`} />

            <section id="distribution">
              <h2>{company.name} 기술분야별 특허 포트폴리오</h2>
              <table className="data-table">
                <caption>{company.name}의 기술분야별 출원 수와 등록률</caption>
                <thead><tr><th>기술분야</th><th>출원</th><th>등록률</th></tr></thead>
                <tbody>
                  {rows.map(row => (
                    <tr key={row.field.id}>
                      <td><Link href={fieldPath(row.field)}>{row.field.name}</Link></td>
                      <td className="mono">{comma(row.count)}</td>
                      <td className="mono">{row.reg}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {strongest ? (
                <ActionCta
                  href={`/ranking/${strongest.field.id}`}
                  label={`${strongest.field.name} 분야 경쟁사 순위 보기`}
                  description={`${company.name}이 가장 많이 출원한 분야입니다. 같은 분야의 상위 출원인을 함께 보면 집중 분야가 시장 전체에서도 강한지 판단하기 쉽습니다.`}
                />
              ) : null}
            </section>

            <section id="portfolio-read">
              <h2>{company.name} 포트폴리오 집중도와 등록률 해석</h2>
              <p>
                {strongest ? `${company.name}은 ${strongest.field.name} 분야에서 가장 많은 출원을 보입니다. ` : ""}
                {second ? `다음으로는 ${second.field.name} 분야가 뒤따릅니다. ` : ""}
                이 분포는 기업이 어떤 기술 축에 관심을 두는지 보여주지만, 실제 사업 전략을 단정하려면 제품 적용 여부와 해외 패밀리, 최근 공개 문헌을 함께 확인해야 합니다.
              </p>
              <p>
                평균 등록률은 포트폴리오의 대략적인 심사 통과 흐름을 보는 보조 지표입니다. 기술 난도가 높은 신사업 분야에서는 등록률이 낮아도 전략적 의미가 있을 수 있고,
                방어 목적 출원이 많은 분야에서는 건수는 높지만 직접 사업성과 연결되지 않을 수 있습니다.
              </p>
              <p>
                {strongest ? `${strongest.field.name} 비중은 약 ${strongestShare}%입니다. ` : ""}
                상위 분야 비중이 높으면 특정 소재·공정에 권리 확보가 몰린 것으로 볼 수 있지만, 실제 경쟁력 판단에는 원문 청구항과 제품 적용 여부를 함께 확인해야 합니다.
              </p>
            </section>

            <section id="compare">
              <h2>{company.name}와 경쟁사 특허 포트폴리오 비교</h2>
              <PatentTools data={data} initialCompanyIds={[company.id, ...data.companies.filter(item => item.id !== company.id).slice(0, 2).map(item => item.id)]} contextLabel={`${company.name} 검색 의도에 맞춰 해당 기업을 기본 선택했습니다.`} />
            </section>

            <SeoFaq
              items={[
                {
                  question: `${company.name} 특허 데이터는 실제 권리 판단에 사용할 수 있나요?`,
                  answer: "이 페이지는 탐색용 데이터입니다. 실제 권리 범위나 침해 여부는 KIPRIS 원문, 등록 청구항, 법률 전문가 검토가 필요합니다."
                },
                {
                  question: "기업별 출원 건수가 많으면 기술력이 높다는 뜻인가요?",
                  answer: "그렇게 단정할 수 없습니다. 출원 목적, 등록률, 청구항 범위, 제품 적용 여부, 해외 패밀리까지 함께 봐야 합니다."
                }
              ]}
            />
          </article>
          <aside className="related-rail">
            <b>관련 검색</b>
            <Link href="/blog/">전체 글 목록</Link>
            {relatedField ? <Link href={`/ranking/${relatedField.id}`}>{relatedField.name} 특허 순위</Link> : null}
            <Link href="/guide/patent-filing-cost">특허 출원 비용</Link>
            <Link href="/guide/kipris-search">KIPRIS 특허 검색</Link>
          </aside>
        </div>
      </main>
    </>
  );
}
