import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentDir = path.join(root, "content", "posts");
const outputDir = path.join(root, "output", "patentgogo");
const forbiddenTitle = /(총정리|무조건|완벽|100%|충격|끝판왕|대박|필독)/;
const awkwardPhrases = /(검색로|분류로|기준 기준|판단 판단|순서은|준비은|분석은|누락 방지 누락)/;
const guidePaths = new Set(["/guide/kipris-search", "/guide/patent-filing-process", "/guide/patent-filing-cost", "/guide/ipc-code", "/guide/patent-map"]);

function parseScalar(value) {
  const trimmed = value.trim();
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) return JSON.parse(trimmed);
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) return JSON.parse(trimmed);
  return trimmed;
}

function parsePost(file) {
  const raw = fs.readFileSync(path.join(contentDir, file), "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`${file}: frontmatter missing`);
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    meta[line.slice(0, separator).trim()] = parseScalar(line.slice(separator + 1));
  }
  return { file, meta, body: match[2].trim() };
}

function fail(message) {
  throw new Error(message);
}

function requireUnique(posts, key) {
  const seen = new Map();
  for (const post of posts) {
    const value = post.meta[key];
    if (seen.has(value)) fail(`${key} duplicated: ${value}`);
    seen.set(value, post.file);
  }
}

function hasExtendedKeyword(text, keywords) {
  return Array.isArray(keywords) && keywords.some(keyword => typeof keyword === "string" && keyword.length >= 2 && text.includes(keyword));
}

function repeatedValues(values) {
  const seen = new Set();
  const repeated = new Set();
  for (const value of values.map(item => item.trim()).filter(Boolean)) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated];
}

function normalizePattern(title, post) {
  return title
    .replace(post.meta.mainKeyword, "{main}")
    .replaceAll(post.meta.cluster, "{cluster}")
    .replaceAll(post.meta.extendedKeywords?.[0] ?? "", "{ext0}")
    .replaceAll(post.meta.extendedKeywords?.[1] ?? "", "{ext1}")
    .replaceAll(post.meta.extendedKeywords?.[2] ?? "", "{ext2}")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeLongParagraph(block) {
  return block
    .replace(/\[[^\]]+\]\([^)]+\)/g, "")
    .replace(/\bhttps?:\/\/\S+/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function visibleMarkdownText(markdown) {
  return markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\bhttps?:\/\/\S+/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function patentCaseBlocks(markdown) {
  return [...markdown.matchAll(/^:{3,4}info\s+문헌 미니케이스:[\s\S]*?^:{3,4}$/gm)].map(match => match[0]);
}

function visiblePatentNumbers(markdown) {
  const visible = visibleMarkdownText(markdown);
  return [...visible.matchAll(/(?:특허번호|공개번호|등록번호|출원번호|publication number|patent number)\s*:\s*((?:KR|US|EP|WO|JP|CN)[0-9][A-Z0-9-]{5,})/gi)].map(match => match[1].toUpperCase());
}

function main() {
  if (!fs.existsSync(contentDir)) fail("content/posts does not exist");
  const files = fs.readdirSync(contentDir).filter(file => file.endsWith(".md")).sort();
  const posts = files.map(parsePost).sort((a, b) => Date.parse(a.meta.publishedAt) - Date.parse(b.meta.publishedAt));
  if (posts.length !== 100) fail(`expected 100 posts, got ${posts.length}`);
  requireUnique(posts, "title");
  requireUnique(posts, "slug");
  requireUnique(posts, "mainKeyword");

  const now = Date.now();
  const visible = posts.filter(post => Date.parse(post.meta.publishedAt) <= now);
  if (visible.length < 1) fail("at least one generated post must be visible immediately");
  for (let index = 1; index < posts.length; index += 1) {
    const gap = Date.parse(posts[index].meta.publishedAt) - Date.parse(posts[index - 1].meta.publishedAt);
    if (gap !== 5 * 60 * 60 * 1000) fail(`schedule gap is not 5 hours at row ${index + 1}`);
  }

  const clusterPatterns = new Map();
  const globalHeadingCounts = new Map();
  const crossPostParagraphs = new Map();
  for (const post of posts) {
    const plainLength = post.body.replace(/\s/g, "").length;
    const h2Count = (post.body.match(/^##\s+/gm) ?? []).length;
    const h2Headings = [...post.body.matchAll(/^##\s+(.+)$/gm)].map(match => match[1]);
    const paragraphs = post.body
      .split(/\n{2,}/)
      .map(block => block.replace(/\s+/g, " ").trim())
      .filter(block => block.length > 120 && !block.startsWith(":::"));
    const internalLinks = post.body.match(/\]\(\/(?:blog|guide)\/[^)]+\)/g) ?? [];
    const callouts = post.body.match(/^:{3,4}(info|caution)\s+/gm) ?? [];
    const visualBlocks = [...post.body.matchAll(/^:{3,4}visual\s+([a-z0-9-]+)\s+/gm)].map(match => match[1]);
    const faqQuestions = post.body.match(/^###\s+.+\?$/gm) ?? [];
    const caseBlocks = patentCaseBlocks(post.body);
    const patentNumbers = visiblePatentNumbers(post.body);
    const publishedAt = Date.parse(post.meta.publishedAt);
    const sourceLinks = post.meta.sourceLinks;
    const titlePattern = normalizePattern(post.meta.title, post);
    const clusterKey = `${post.meta.cluster}:${titlePattern}`;

    if (plainLength < 3500) fail(`${post.file}: body too short (${plainLength})`);
    if (awkwardPhrases.test(`${post.meta.title}\n${post.meta.description}\n${post.body}`)) fail(`${post.file}: awkward generated phrase found`);
    if (post.meta.title.length > 70) fail(`${post.file}: title too long for search result display (${post.meta.title.length})`);
    if (h2Count < 6) fail(`${post.file}: needs at least 6 H2 headings`);
    const duplicateH2 = repeatedValues(h2Headings);
    if (duplicateH2.length) fail(`${post.file}: duplicate H2 heading ${duplicateH2[0]}`);
    for (const heading of h2Headings) globalHeadingCounts.set(heading, (globalHeadingCounts.get(heading) ?? 0) + 1);
    const duplicateParagraphs = repeatedValues(paragraphs);
    if (duplicateParagraphs.length) fail(`${post.file}: repeated long paragraph block`);
    for (const paragraph of paragraphs) {
      const normalizedParagraph = normalizeLongParagraph(paragraph);
      if (normalizedParagraph.length < 180) continue;
      const filesForParagraph = crossPostParagraphs.get(normalizedParagraph) ?? new Set();
      filesForParagraph.add(post.file);
      crossPostParagraphs.set(normalizedParagraph, filesForParagraph);
    }
    if (internalLinks.length < 2) fail(`${post.file}: needs at least 2 internal links`);
    if (callouts.length < 2) fail(`${post.file}: needs at least 2 semantic visual callouts`);
    if (visualBlocks.length < 3) fail(`${post.file}: needs at least 3 actual visual blocks`);
    if (!caseBlocks.length || !patentNumbers.length) fail(`${post.file}: needs visible patent-number mini-case block`);
    for (const block of caseBlocks) {
      for (const label of ["특허번호:", "출처:", "확인일:", "출원인:", "문헌명:", "이 글에서 보는 포인트:"]) {
        if (!block.includes(label)) fail(`${post.file}: patent mini-case missing visible field ${label}`);
      }
    }
    if (!post.body.includes(`${post.meta.mainKeyword} 자주 묻는 질문`) || faqQuestions.length < 2) fail(`${post.file}: needs article-specific FAQ section`);
    if (!post.meta.title.includes(post.meta.mainKeyword) || !hasExtendedKeyword(post.meta.title, post.meta.extendedKeywords)) {
      fail(`${post.file}: title must include main keyword and at least one extended keyword`);
    }
    if (!post.meta.description.includes(post.meta.mainKeyword) || !hasExtendedKeyword(post.meta.description, post.meta.extendedKeywords)) {
      fail(`${post.file}: subtitle/description must include main keyword and at least one extended keyword`);
    }
    if (!Array.isArray(sourceLinks) || sourceLinks.length < 5) fail(`${post.file}: needs at least 5 source links`);
    if (!sourceLinks.some(source => /kipo|kipris|patent|wipo|uspto/i.test(source.url))) fail(`${post.file}: no official source URL`);
    if (forbiddenTitle.test(post.meta.title)) fail(`${post.file}: title contains forbidden clickbait term`);
    if (clusterPatterns.has(clusterKey)) fail(`${post.file}: repeated same-cluster title pattern with ${clusterPatterns.get(clusterKey)}`);
    clusterPatterns.set(clusterKey, post.file);

    for (const link of [...internalLinks, ...post.meta.internalLinks.map(href => `](${href})`)]) {
      const slug = link.match(/\]\(\/blog\/([^)\/]+)/)?.[1];
      const guide = link.match(/\]\((\/guide\/[^)]+)\)/)?.[1];
      if (guide && !guidePaths.has(guide)) fail(`${post.file}: links to missing guide route ${guide}`);
      if (slug) {
        const target = posts.find(item => item.meta.slug === slug);
        if (target && Date.parse(target.meta.publishedAt) > publishedAt) fail(`${post.file}: links to future scheduled post ${slug}`);
      }
    }
    const manifestVisuals = post.meta.visualElements ?? [];
    void manifestVisuals;
  }
  for (const [heading, count] of globalHeadingCounts) {
    if (count > 2) fail(`H2 heading repeated across too many posts (${count}): ${heading}`);
  }
  for (const [paragraph, filesForParagraph] of crossPostParagraphs) {
    if (filesForParagraph.size > 6) {
      fail(`long paragraph reused across ${filesForParagraph.size} posts: ${[...filesForParagraph].slice(0, 3).join(", ")} :: ${paragraph.slice(0, 120)}`);
    }
  }

  const manifest = JSON.parse(fs.readFileSync(path.join(outputDir, "manifest.json"), "utf8"));
  if (manifest.generated_count !== 100 || manifest.rows?.length !== 100) fail("manifest count mismatch");
  if (manifest.rows.some(row => Number(row.score) < 90)) fail("manifest contains score below 90");
  if (manifest.rows.some(row => !Array.isArray(row.visual_elements) || row.visual_elements.length < 3)) fail("manifest visual elements missing");
  for (const row of manifest.rows) {
    const post = posts.find(item => item.meta.slug === row.slug);
    if (!post) fail(`manifest row missing post: ${row.slug}`);
    const actualVisuals = [...post.body.matchAll(/^:{3,4}visual\s+([a-z0-9-]+)\s+/gm)].map(match => match[1]);
    for (const visual of row.visual_elements) {
      if (!actualVisuals.includes(visual)) fail(`${post.file}: manifest visual element not rendered in markdown: ${visual}`);
    }
    const numbers = visiblePatentNumbers(post.body);
    if (!row.patent_case?.number || !numbers.includes(String(row.patent_case.number).toUpperCase())) {
      fail(`${post.file}: manifest patent case is not rendered as a visible labeled number`);
    }
  }

  const researchCount = fs.readdirSync(path.join(outputDir, "research")).filter(file => file.endsWith(".json")).length;
  const qaFiles = fs.readdirSync(path.join(outputDir, "qa")).filter(file => file.endsWith(".json"));
  if (researchCount !== 100 || qaFiles.length !== 100) fail(`research/qa count mismatch: ${researchCount}/${qaFiles.length}`);
  for (const file of qaFiles) {
    const qa = JSON.parse(fs.readFileSync(path.join(outputDir, "qa", file), "utf8"));
    if (Number(qa.score) < 90) fail(`${file}: QA score below 90`);
    if (!qa.hard_gate_results?.visual_elements || !qa.hard_gate_results?.subtitle_keyword_coverage || !qa.hard_gate_results?.patent_case_examples) fail(`${file}: QA hard gates missing`);
  }

  console.log(JSON.stringify({
    ok: true,
    posts: posts.length,
    visible_now: visible.length,
    hidden_future: posts.length - visible.length,
    first: posts[0].meta.publishedAt,
    last: posts.at(-1).meta.publishedAt,
    min_body_chars: Math.min(...posts.map(post => post.body.replace(/\s/g, "").length)),
    max_body_chars: Math.max(...posts.map(post => post.body.replace(/\s/g, "").length)),
    min_score: Math.min(...manifest.rows.map(row => Number(row.score)))
  }, null, 2));
}

main();
