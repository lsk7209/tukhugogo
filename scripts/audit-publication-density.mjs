import fs from "node:fs";
import path from "node:path";

const postsDir = path.join(process.cwd(), "content", "posts");
const maxPostsPerDay = 2;

const publishedDates = fs.readdirSync(postsDir)
  .filter((file) => file.endsWith(".md"))
  .map((file) => {
    const source = fs.readFileSync(path.join(postsDir, file), "utf8");
    const publishedAt = source.match(/^publishedAt:\s*"([^\"]+)"$/m)?.[1];
    if (!publishedAt) throw new Error(`${file}: publishedAt is required`);
    return { file, day: publishedAt.slice(0, 10) };
  });

const byDay = new Map();
for (const post of publishedDates) {
  byDay.set(post.day, [...(byDay.get(post.day) ?? []), post.file]);
}

const overloadedDays = [...byDay.entries()]
  .filter(([, files]) => files.length > maxPostsPerDay)
  .map(([day, files]) => ({ day, count: files.length, files }));

console.log(JSON.stringify({
  posts: publishedDates.length,
  maxPostsPerDay,
  days: byDay.size,
  overloadedDays,
}, null, 2));

process.exit(overloadedDays.length ? 1 : 0);
