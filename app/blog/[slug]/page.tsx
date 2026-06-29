import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { MarkdownArticle } from "@/components/MarkdownArticle";
import { RelatedLinkStrip } from "@/components/RelatedLinkStrip";
import { SiteHeader } from "@/components/SiteHeader";
import { TableOfContents } from "@/components/TableOfContents";
import { guideTopics } from "@/lib/keyword-taxonomy";
import { extractFaqItems, extractH2Items, getContentPostBySlug, getPublishedContentPosts, postDate, postHref } from "@/lib/posts";
import { canonicalUrl, siteProfile } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
};

function sourcePurpose(source: { label: string; url: string }) {
  const text = `${source.label} ${source.url}`.toLowerCase();
  if (text.includes("kipris")) return "국내 특허 원문 DB";
  if (text.includes("kipo") || text.includes("patent.go.kr")) return "특허 제도·절차 확인";
  if (text.includes("ipc") || text.includes("classification")) return "분류 기준 확인";
  if (text.includes("patentscope") || text.includes("wipo")) return "국제공개·PCT 확인";
  if (text.includes("espacenet")) return "해외 패밀리·인용 확인";
  if (text.includes("google")) return "해외 원문 검색 보조";
  if (text.includes("uspto")) return "미국 출원·심사 확인";
  return "원문 확인";
}

function buildRelatedLinks(hrefs: string[]) {
  const postLabels = new Map(getPublishedContentPosts().map(item => [postHref(item), item.title]));
  const guideLabels = new Map(guideTopics.map(item => [`/guide/${item.slug}`, item.title]));
  return hrefs.slice(0, 5).map(href => {
    const normalized = href.replace(/\/$/, "");
    return {
      href,
      label: postLabels.get(href) ?? postLabels.get(`${normalized}/`) ?? guideLabels.get(normalized) ?? normalized.replace(/^\/(blog|guide)\//, "").replaceAll("-", " ")
    };
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getContentPostBySlug(slug);
  if (!post) return {};
  const url = canonicalUrl(`/blog/${post.slug}/`);

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${post.title} | ${siteProfile.name}`,
      description: post.description,
      url,
      type: "article",
      locale: "ko_KR",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: `${post.title} 특허고고 글` }]
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | ${siteProfile.name}`,
      description: post.description,
      images: ["/og-image.png"]
    }
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getContentPostBySlug(slug);
  if (!post) notFound();

  const url = canonicalUrl(`/blog/${post.slug}/`);
  const tocItems = extractH2Items(post.body);
  const faqItems = extractFaqItems(post.body);
  const relatedLinks = buildRelatedLinks(post.internalLinks);
  const wordCount = post.body.replace(/---[\s\S]*?---/, "").replace(/\s/g, "").length;

  return (
    <>
      <SiteHeader />
      <JsonLd
        data={[{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.description,
          url,
          image: [canonicalUrl("/og-image.png")],
          datePublished: post.publishedAt,
          dateModified: post.updatedAt,
          inLanguage: "ko-KR",
          keywords: [post.mainKeyword, ...post.extendedKeywords],
          articleSection: post.category,
          wordCount,
          about: [{ "@type": "Thing", name: post.mainKeyword }],
          mentions: post.extendedKeywords.map(keyword => ({ "@type": "Thing", name: keyword })),
          isAccessibleForFree: true,
          author: { "@type": "Organization", name: post.author },
          publisher: { "@id": canonicalUrl("/#organization") },
          mainEntityOfPage: url,
          citation: post.sourceLinks.map(source => source.url)
        }, {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: siteProfile.name, item: canonicalUrl("/") },
            { "@type": "ListItem", position: 2, name: "블로그", item: canonicalUrl("/blog/") },
            { "@type": "ListItem", position: 3, name: post.title, item: url }
          ]
        }, ...(faqItems.length ? [{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map(item => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer }
          }))
        }] : [])]}
      />
      <main className="article-page">
        <div className="container article-grid">
          <article className="article-body">
            <p className="eyebrow">{post.category}</p>
            <h1>{post.title}</h1>
            <p className="post-meta-line">{postDate(post)} · {post.searchIntent} · {post.mainKeyword}</p>
            <p className="direct-answer">{post.description}</p>
            <div className="keyword-line">
              {[post.mainKeyword, ...post.extendedKeywords].slice(0, 6).map(keyword => <span key={keyword}>{keyword}</span>)}
            </div>
            <TableOfContents items={[...tocItems, { id: "source-links", label: "공식 출처와 다음 글" }]} />
            {relatedLinks.length ? <RelatedLinkStrip title="이어 읽을 글" links={relatedLinks} /> : null}
            <MarkdownArticle body={post.body} />
            <section id="source-links">
              <h2>{post.mainKeyword} 확인에 사용한 공식 출처</h2>
              <p>
                아래 링크는 글의 사실 확인과 추가 검색에 사용한 공식 또는 1차 출처입니다.
                특허고고 글은 검색 순서와 해석 기준을 정리하는 자료이며, 실제 권리 판단은 원문과 전문가 검토가 필요합니다.
              </p>
              <ul className="source-link-list">
                {post.sourceLinks.map(source => (
                  <li key={source.url}>
                    <b>{sourcePurpose(source)}</b>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a>
                    <span>{source.url}</span>
                  </li>
                ))}
              </ul>
            </section>
          </article>
          <aside className="related-rail">
            <b>글 탐색</b>
            <a href="/blog/">전체 글 목록</a>
            {relatedLinks.slice(0, 3).map(link => <a href={link.href} key={link.href}>{link.label}</a>)}
          </aside>
        </div>
      </main>
    </>
  );
}
