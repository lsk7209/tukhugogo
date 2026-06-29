import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { SiteHeader } from "@/components/SiteHeader";
import { getBlogEntries } from "@/lib/keyword-taxonomy";
import { getPatentData, isDemoDataConfigured } from "@/lib/patent-data";
import { getPublishedContentPosts, postDate, postHref } from "@/lib/posts";
import { canonicalUrl, siteProfile } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export const metadata: Metadata = {
  title: "배터리 특허 검색 글 목록",
  description: "KIPRIS 검색식, 특허맵 설계, IPC 분류, 선행기술 조사, 배터리 소재 특허 분석 글을 카드형 목록으로 정리했습니다.",
  alternates: { canonical: canonicalUrl("/blog/") },
  openGraph: {
    title: `배터리 특허 검색 글 목록 | ${siteProfile.name}`,
    description: "배터리 특허 검색과 분석 실무 글을 모은 목록입니다.",
    url: canonicalUrl("/blog/"),
    locale: "ko_KR",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "특허고고 블로그 글 목록" }]
  },
  twitter: {
    card: "summary_large_image",
    title: `배터리 특허 검색 글 목록 | ${siteProfile.name}`,
    description: "KIPRIS, 특허맵, IPC, 선행기술 조사 글을 모은 목록입니다.",
    images: ["/og-image.png"]
  }
};

export default async function BlogPage() {
  const data = await getPatentData();
  const allEntries = getBlogEntries(data);
  const scheduledEntries = getPublishedContentPosts().map(post => ({
    title: post.title,
    href: postHref(post),
    excerpt: post.description,
    category: post.category,
    intent: post.mainKeyword,
    date: postDate(post),
    keywords: [post.mainKeyword, ...post.extendedKeywords]
  }));
  const demoData = isDemoDataConfigured();
  const entries = [...scheduledEntries, ...(demoData ? allEntries.filter(entry => entry.href.startsWith("/guide/")) : allEntries)];
  const categories = Array.from(new Set(entries.map(entry => entry.category)));
  const firstField = data.techFields[0];

  return (
    <>
      <SiteHeader techHref={!demoData && firstField ? `/tech/${firstField.id}` : "/#tools"} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "특허고고 블로그",
          description: "배터리 특허 데이터 글 목록",
          url: canonicalUrl("/blog/"),
          mainEntity: entries.slice(0, 12).map(entry => ({
            "@type": "Article",
            headline: entry.title,
            url: canonicalUrl(entry.href),
            dateModified: entry.date
          }))
        }}
      />
      <main className="article-page blog-index-page">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">특허 검색 글 목록</p>
            <h1>배터리 특허 데이터 글 목록</h1>
            <p>KIPRIS 검색, 특허 출원, IPC, 기업명, 기술 분야 키워드를 기준으로 실무형 글을 정리했습니다.</p>
          </div>
          <div className="blog-filter-row" aria-label="글 카테고리">
            {categories.map(category => <span key={category}>{category}</span>)}
          </div>
          <div className="blog-card-grid">
            {entries.map(entry => (
              <Link className="blog-card" href={entry.href} key={entry.href}>
                <span>{entry.category}</span>
                <h2>{entry.title}</h2>
                <p>{entry.excerpt}</p>
                <b className="card-cta">글 읽기</b>
                <small>{entry.date} · {entry.intent}</small>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
