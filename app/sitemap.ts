import type { MetadataRoute } from "next";
import { getPatentData, isDemoDataConfigured } from "@/lib/patent-data";
import { canonicalUrl, companyPath, fieldPath, getBlogEntries, guideTopics, rankingPath } from "@/lib/keyword-taxonomy";
import { getPublishedContentPosts, postHref } from "@/lib/posts";
import { reviewedDate } from "@/lib/site";

export const revalidate = 300;

function stableDate(value: string) {
  const date = new Date(`${value}T00:00:00+09:00`);
  return Number.isNaN(date.getTime()) ? new Date(`${reviewedDate()}T00:00:00+09:00`) : date;
}

function uniqueByUrl(entries: MetadataRoute.Sitemap) {
  const urls = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const entry of entries) {
    if (!urls.has(entry.url)) urls.set(entry.url, entry);
  }
  return [...urls.values()];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await getPatentData();
  const contentDate = stableDate(reviewedDate());
  const dataDate = stableDate(data.meta.asOf);
  const blogEntries = getBlogEntries(data);
  const contentPosts = getPublishedContentPosts();
  const demoData = isDemoDataConfigured();
  const dataPageEntries: MetadataRoute.Sitemap = demoData
    ? []
    : [
        ...data.techFields.map(field => ({ url: canonicalUrl(fieldPath(field)), lastModified: dataDate, changeFrequency: "weekly" as const, priority: 0.8 })),
        ...data.techFields.map(field => ({ url: canonicalUrl(rankingPath(field)), lastModified: dataDate, changeFrequency: "weekly" as const, priority: 0.7 })),
        ...data.companies.map(company => ({ url: canonicalUrl(companyPath(company)), lastModified: dataDate, changeFrequency: "weekly" as const, priority: 0.7 }))
      ];
  const indexableBlogEntries = demoData ? blogEntries.filter(entry => entry.href.startsWith("/guide/")) : blogEntries;

  const entries: MetadataRoute.Sitemap = [
    { url: canonicalUrl("/"), lastModified: contentDate, changeFrequency: "weekly", priority: 1 },
    { url: canonicalUrl("/blog/"), lastModified: contentDate, changeFrequency: "weekly", priority: 0.9 },
    { url: canonicalUrl("/about/"), lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: canonicalUrl("/contact/"), lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: canonicalUrl("/privacy/"), lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: canonicalUrl("/terms/"), lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    ...guideTopics.map(topic => ({ url: canonicalUrl(`/guide/${topic.slug}`), lastModified: contentDate, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...dataPageEntries,
    ...contentPosts.map(post => ({ url: canonicalUrl(postHref(post)), lastModified: stableDate(post.updatedAt.slice(0, 10)), changeFrequency: "weekly" as const, priority: 0.75 })),
    ...indexableBlogEntries.map(entry => ({ url: canonicalUrl(entry.href), lastModified: stableDate(entry.date), changeFrequency: "monthly" as const, priority: 0.6 }))
  ];

  return uniqueByUrl(entries);
}
