import "server-only";
import fs from "node:fs";
import path from "node:path";

export type SourceLink = {
  label: string;
  url: string;
};

export type ContentPost = {
  title: string;
  slug: string;
  description: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  status: "scheduled" | "published";
  cluster: string;
  category: string;
  mainKeyword: string;
  extendedKeywords: string[];
  searchIntent: string;
  sourceLinks: SourceLink[];
  internalLinks: string[];
  body: string;
};

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

function parseScalar(value: string) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return JSON.parse(trimmed);
  }
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) return JSON.parse(trimmed);
  return trimmed;
}

function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error("Post is missing frontmatter.");
  const meta: Record<string, unknown> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    meta[line.slice(0, separator).trim()] = parseScalar(line.slice(separator + 1));
  }
  return { meta, body: match[2].trim() };
}

function requireString(meta: Record<string, unknown>, key: string) {
  const value = meta[key];
  if (typeof value !== "string" || !value.trim()) throw new Error(`Post frontmatter is missing ${key}.`);
  return value;
}

function requireStringArray(meta: Record<string, unknown>, key: string) {
  const value = meta[key];
  if (!Array.isArray(value) || value.some(item => typeof item !== "string")) {
    throw new Error(`Post frontmatter ${key} must be a string array.`);
  }
  return value as string[];
}

function requireSources(meta: Record<string, unknown>) {
  const value = meta.sourceLinks;
  if (!Array.isArray(value)) throw new Error("Post frontmatter sourceLinks must be an array.");
  return value.map(item => {
    const source = item as Partial<SourceLink>;
    if (!source.label || !source.url) throw new Error("Post sourceLinks entries need label and url.");
    return { label: String(source.label), url: String(source.url) };
  });
}

function readPost(filePath: string): ContentPost {
  const { meta, body } = parseFrontmatter(fs.readFileSync(filePath, "utf8"));
  return {
    title: requireString(meta, "title"),
    slug: requireString(meta, "slug"),
    description: requireString(meta, "description"),
    author: requireString(meta, "author"),
    publishedAt: requireString(meta, "publishedAt"),
    updatedAt: requireString(meta, "updatedAt"),
    status: requireString(meta, "status") as ContentPost["status"],
    cluster: requireString(meta, "cluster"),
    category: requireString(meta, "category"),
    mainKeyword: requireString(meta, "mainKeyword"),
    extendedKeywords: requireStringArray(meta, "extendedKeywords"),
    searchIntent: requireString(meta, "searchIntent"),
    sourceLinks: requireSources(meta),
    internalLinks: requireStringArray(meta, "internalLinks"),
    body
  };
}

function publishedAtTime(post: ContentPost) {
  const time = Date.parse(post.publishedAt);
  return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time;
}

export function isPostPublished(post: ContentPost, now = new Date()) {
  return post.status === "published" && publishedAtTime(post) <= now.getTime();
}

export function getAllContentPosts() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter(file => file.endsWith(".md"))
    .map(file => readPost(path.join(POSTS_DIR, file)))
    .sort((a, b) => publishedAtTime(a) - publishedAtTime(b));
}

export function getPublishedContentPosts(now = new Date()) {
  return getAllContentPosts()
    .filter(post => isPostPublished(post, now))
    .sort((a, b) => publishedAtTime(b) - publishedAtTime(a));
}

export function getContentPostBySlug(slug: string, now = new Date()) {
  const post = getAllContentPosts().find(item => item.slug === slug);
  if (!post || !isPostPublished(post, now)) return undefined;
  return post;
}

export function postDate(post: ContentPost) {
  return post.publishedAt.slice(0, 10);
}

export function postHref(post: ContentPost) {
  return `/blog/${post.slug}/`;
}

export function extractH2Items(markdown: string) {
  return markdown
    .split(/\r?\n/)
    .filter(line => line.startsWith("## ") && !line.startsWith("### "))
    .map(line => {
      const label = line.replace(/^##\s+/, "").trim();
      return { id: slugifyHeading(label), label };
    });
}

export function extractFaqItems(markdown: string) {
  const lines = markdown.split(/\r?\n/);
  const faqStart = lines.findIndex(line => /^##\s+.+자주 묻는 질문\s*$/.test(line.trim()));
  if (faqStart === -1) return [];
  const items: { question: string; answer: string }[] = [];
  let index = faqStart + 1;
  while (index < lines.length) {
    const line = lines[index].trim();
    if (line.startsWith("## ")) break;
    if (line.startsWith("### ")) {
      const question = line.replace(/^###\s+/, "").trim();
      const answerParts: string[] = [];
      index += 1;
      while (index < lines.length) {
        const answerLine = lines[index].trim();
        if (answerLine.startsWith("### ") || answerLine.startsWith("## ")) break;
        if (answerLine && !answerLine.startsWith(":::")) answerParts.push(answerLine.replace(/^-\s+/, ""));
        index += 1;
      }
      const answer = answerParts.join(" ").trim();
      if (question && answer) items.push({ question, answer });
      continue;
    }
    index += 1;
  }
  return items.slice(0, 4);
}

export function slugifyHeading(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}
