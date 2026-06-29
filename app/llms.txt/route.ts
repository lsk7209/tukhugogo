import { getBlogEntries } from "@/lib/keyword-taxonomy";
import { getPatentData, isDemoDataConfigured } from "@/lib/patent-data";
import { getPublishedContentPosts, postHref } from "@/lib/posts";
import { canonicalUrl, siteProfile } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function GET() {
  const data = await getPatentData();
  const allEntries = getBlogEntries(data);
  const contentEntries = getPublishedContentPosts().map(post => ({ title: post.title, href: postHref(post) }));
  const entries = [...contentEntries, ...(isDemoDataConfigured() ? allEntries.filter(entry => entry.href.startsWith("/guide/")) : allEntries)].slice(0, 40);
  const lines = [
    `# ${siteProfile.name}`,
    "",
    siteProfile.description,
    "",
    `Site: ${canonicalUrl("/")}`,
    `Sitemap: ${canonicalUrl("/sitemap.xml")}`,
    `Feed: ${canonicalUrl("/feed.xml")}`,
    "",
    "## Persona",
    `Topic: ${siteProfile.topic}`,
    `Audience: ${siteProfile.audience}`,
    `Tone: ${siteProfile.tone.join(", ")}`,
    "",
    "## Key pages",
    ...entries.map(entry => `- ${entry.title}: ${canonicalUrl(entry.href)}`)
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600"
    }
  });
}
