import { getBlogEntries } from "@/lib/keyword-taxonomy";
import { getPatentData, isDemoDataConfigured } from "@/lib/patent-data";
import { getPublishedContentPosts, postHref } from "@/lib/posts";
import { canonicalUrl, reviewedDate, siteProfile } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 300;

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function stableRssDate(value: string) {
  const date = value.includes("T") ? new Date(value) : new Date(`${value}T00:00:00+09:00`);
  return (Number.isNaN(date.getTime()) ? new Date(`${reviewedDate()}T00:00:00+09:00`) : date).toUTCString();
}

export async function GET() {
  const data = await getPatentData();
  const allEntries = getBlogEntries(data);
  const scheduledEntries = getPublishedContentPosts().map(post => ({
    title: post.title,
    href: postHref(post),
    excerpt: post.description,
    category: post.category,
    date: post.publishedAt
  }));
  const entries = [...scheduledEntries, ...(isDemoDataConfigured() ? allEntries.filter(entry => entry.href.startsWith("/guide/")) : allEntries)];
  const latestEntryDate = entries.map(entry => entry.date).sort().at(-1) ?? reviewedDate();
  const items = entries.map(entry => `
    <item>
      <title>${escapeXml(entry.title)}</title>
      <link>${canonicalUrl(entry.href)}</link>
      <guid>${canonicalUrl(entry.href)}</guid>
      <pubDate>${stableRssDate(entry.date)}</pubDate>
      <description>${escapeXml(entry.excerpt)}</description>
      <category>${escapeXml(entry.category)}</category>
    </item>`).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteProfile.name)}</title>
    <link>${canonicalUrl("/")}</link>
    <description>${escapeXml(siteProfile.description)}</description>
    <language>ko-KR</language>
    <lastBuildDate>${stableRssDate(latestEntryDate)}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=3600"
    }
  });
}
