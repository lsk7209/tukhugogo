import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { IntentCta } from "@/components/IntentCta";
import { JsonLd } from "@/components/JsonLd";
import { SeoFaq } from "@/components/SeoFaq";
import { SiteHeader } from "@/components/SiteHeader";
import { TableOfContents } from "@/components/TableOfContents";
import { canonicalUrl, companyPath, fieldPath, findGuideTopic, guideTopics, rankingPath } from "@/lib/keyword-taxonomy";
import { getPatentData, isDemoDataConfigured } from "@/lib/patent-data";
import { reviewedDate, siteProfile } from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return guideTopics.map(topic => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = findGuideTopic(slug);
  if (!topic) return {};

  return {
    title: topic.primaryKeyword,
    description: topic.summary,
    alternates: { canonical: canonicalUrl(`/guide/${topic.slug}`) },
    openGraph: {
      title: `${topic.primaryKeyword} | ${siteProfile.name}`,
      description: topic.summary,
      url: canonicalUrl(`/guide/${topic.slug}`),
      type: "article",
      locale: "ko_KR",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: `${topic.primaryKeyword} 특허고고 가이드` }]
    },
    twitter: {
      card: "summary_large_image",
      title: `${topic.primaryKeyword} | ${siteProfile.name}`,
      description: topic.summary,
      images: ["/og-image.png"]
    }
  };
}

function officialLinksFor(slug: string) {
  const common = [
    { label: "KIPRIS 특허정보검색서비스", href: "https://www.kipris.or.kr/", note: "원문 검색과 공개·등록 상태 확인" },
    { label: "특허청", href: "https://www.kipo.go.kr/", note: "제도 안내와 공지 확인" }
  ];
  if (slug === "ipc-code") {
    return [
      ...common,
      { label: "WIPO IPC 분류", href: "https://www.wipo.int/classifications/ipc/en/", note: "국제특허분류 체계 확인" }
    ];
  }
  if (slug === "patent-filing-cost" || slug === "patent-filing-process") {
    return [
      ...common,
      { label: "특허로", href: "https://www.patent.go.kr/", note: "전자출원과 수수료 관련 업무 확인" }
    ];
  }
  return [
    ...common,
    { label: "WIPO PATENTSCOPE", href: "https://patentscope.wipo.int/", note: "국제 공개 특허 검색 보조 확인" }
  ];
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const topic = findGuideTopic(slug);
  if (!topic) notFound();

  const data = await getPatentData();
  const demoData = isDemoDataConfigured();
  const relatedField = data.techFields[0];
  const relatedCompany = data.companies[0];
  const url = canonicalUrl(`/guide/${topic.slug}`);
  const officialLinks = officialLinksFor(topic.slug);
  const tocItems = [
    ...topic.sections.map(section => ({ id: section.id, label: section.heading })),
    { id: "checklist", label: "확인 체크리스트" },
    { id: "official-sources", label: "공식 확인 링크" },
    { id: "faq-title", label: "자주 묻는 질문" }
  ];

  return (
    <>
      <SiteHeader techHref={relatedField ? fieldPath(relatedField) : "/#tools"} />
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: topic.title,
            description: topic.summary,
            url,
            image: [canonicalUrl("/og-image.png")],
            datePublished: reviewedDate(),
            dateModified: reviewedDate(),
            inLanguage: "ko-KR",
            publisher: { "@id": canonicalUrl("/#organization") }
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "홈", item: canonicalUrl("/") },
              { "@type": "ListItem", position: 2, name: "블로그", item: canonicalUrl("/blog/") },
              { "@type": "ListItem", position: 3, name: topic.title, item: url }
            ]
          }
        ]}
      />
      <main className="article-page">
        <div className="container article-grid">
          <article className="article-body">
            <p className="eyebrow">{topic.intent === "transaction" ? "출원 가이드" : "특허 검색 가이드"}</p>
            <h1>{topic.title}</h1>
            <p className="direct-answer">{topic.summary}</p>
            <div className="keyword-line">
              {topic.secondaryKeywords.map(keyword => <span key={keyword}>{keyword}</span>)}
            </div>
            <TableOfContents items={tocItems} />

            {topic.sections.map(section => (
              <section id={section.id} key={section.id}>
                <h2>{section.heading}</h2>
                <p>{section.body}</p>
              </section>
            ))}

            <section id="checklist">
              <h2>확인 체크리스트</h2>
              <p>
                이 주제를 실제 업무에 적용할 때는 검색식, 출처, 기준일, 데이터 가공 여부를 함께 기록해야 합니다.
                특허 문헌은 공개 시점과 등록 시점이 다르기 때문에 최근 데이터일수록 심사 상태를 별도로 확인하는 것이 좋습니다.
              </p>
              <p>
                특허고고의 시연 데이터는 흐름을 이해하기 위한 예시입니다. 실제 출원, 침해, 권리 범위 판단에는
                KIPRIS 원문, 특허청 공보, 전문가 검토를 함께 사용해야 합니다.
              </p>
            </section>

            <section id="official-sources">
              <h2>{topic.primaryKeyword} 공식 확인 링크</h2>
              <p>
                검색 결과를 인용하거나 출원 판단에 쓰기 전에는 아래 공식 출처에서 원문, 기준일, 공개·등록 상태를 다시 확인하세요.
                특허고고의 글은 탐색 순서를 정리하는 참고 자료이며, 최종 권리 판단이나 비용 판단을 대신하지 않습니다.
              </p>
              <ul className="source-link-list">
                {officialLinks.map(link => (
                  <li key={link.href}>
                    <a href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>
                    <span>{link.note}</span>
                  </li>
                ))}
              </ul>
            </section>

            <IntentCta
              type={topic.ctaType}
              relatedDataHref={!demoData && relatedField ? fieldPath(relatedField) : "/blog/"}
              relatedDataLabel={!demoData && relatedField ? `${relatedField.name} 특허 동향 보기` : "다른 특허 가이드 보기"}
            />
            <SeoFaq
              items={[
                {
                  question: `${topic.primaryKeyword}에서 가장 먼저 볼 것은 무엇인가요?`,
                  answer: "검색 목적, 출처, 기준일, 공개·등록 상태를 먼저 확인해야 합니다. 그다음 출원인과 IPC 분류를 좁히면 결과 해석이 쉬워집니다."
                },
                {
                  question: "특허 데이터만으로 기업 우위를 판단해도 되나요?",
                  answer: "아닙니다. 출원 건수는 탐색 신호이며 등록률, 청구항 범위, 패밀리 국가, 제품 적용 여부를 함께 봐야 합니다."
                }
              ]}
            />
          </article>
          <aside className="related-rail">
            <b>관련 데이터</b>
            <Link href="/blog/">전체 글 목록</Link>
            {!demoData && relatedField ? <Link href={fieldPath(relatedField)}>{relatedField.name} 특허 동향</Link> : null}
            {!demoData && relatedField ? <Link href={rankingPath(relatedField)}>{relatedField.name} 특허 순위</Link> : null}
            {!demoData && relatedCompany ? <Link href={companyPath(relatedCompany)}>{relatedCompany.name} 특허</Link> : null}
            <Link href="/guide/patent-map/">특허맵이란 무엇인가</Link>
            <Link href="/guide/ipc-code/">IPC 분류 뜻과 특허맵 활용</Link>
          </aside>
        </div>
      </main>
    </>
  );
}
