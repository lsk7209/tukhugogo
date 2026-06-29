import { slugifyHeading } from "@/lib/posts";
import type { ReactNode } from "react";

function renderInline(text: string) {
  const parts: ReactNode[] = [];
  const pattern = /(\*\*([^*]+)\*\*)|\[([^\]]+)\]\(([^)]+)\)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    if (match.index > cursor) parts.push(text.slice(cursor, match.index));
    if (match[2]) {
      parts.push(<strong key={`${match.index}-strong`}>{match[2]}</strong>);
    } else if (match[3] && match[4]) {
      const href = match[4];
      const external = /^https?:\/\//.test(href);
      parts.push(
        <a key={`${match.index}-link`} href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
          {match[3]}
        </a>
      );
    }
    cursor = pattern.lastIndex;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

function flushParagraph(buffer: string[], nodes: ReactNode[], key: string) {
  if (!buffer.length) return;
  nodes.push(<p key={key}>{renderInline(buffer.join(" "))}</p>);
  buffer.length = 0;
}

export function MarkdownArticle({ body }: { body: string }) {
  const nodes: ReactNode[] = [];
  const paragraph: string[] = [];
  const lines = body.split(/\r?\n/);
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      flushParagraph(paragraph, nodes, `p-${index}`);
      index += 1;
      continue;
    }
    if (line.startsWith("## ")) {
      flushParagraph(paragraph, nodes, `p-${index}`);
      const label = line.replace(/^##\s+/, "");
      nodes.push(<h2 id={slugifyHeading(label)} key={`h2-${index}`}>{renderInline(label)}</h2>);
      index += 1;
      continue;
    }
    if (line.startsWith("### ")) {
      flushParagraph(paragraph, nodes, `p-${index}`);
      const label = line.replace(/^###\s+/, "");
      nodes.push(<h3 id={slugifyHeading(label)} key={`h3-${index}`}>{renderInline(label)}</h3>);
      index += 1;
      continue;
    }
    if (line.startsWith("> ")) {
      flushParagraph(paragraph, nodes, `p-${index}`);
      nodes.push(<blockquote key={`q-${index}`}>{renderInline(line.replace(/^>\s+/, ""))}</blockquote>);
      index += 1;
      continue;
    }
    const calloutMatch = line.match(/^:{3,4}(info|caution)\s+(.+)$/);
    if (calloutMatch) {
      flushParagraph(paragraph, nodes, `p-${index}`);
      const kind = calloutMatch[1];
      const title = calloutMatch[2].trim();
      const content: string[] = [];
      index += 1;
      while (index < lines.length && !/^:{3,4}$/.test(lines[index].trim())) {
        if (lines[index].trim()) content.push(lines[index].trim());
        index += 1;
      }
      nodes.push(
        <aside className={`article-callout ${kind === "caution" ? "article-callout-caution" : "article-callout-info"}`} key={`callout-${index}`}>
          <strong>{renderInline(title)}</strong>
          <p>{renderInline(content.join(" "))}</p>
        </aside>
      );
      index += 1;
      continue;
    }
    const visualMatch = line.match(/^:{3,4}visual\s+([a-z0-9-]+)\s+(.+)$/);
    if (visualMatch) {
      flushParagraph(paragraph, nodes, `p-${index}`);
      const kind = visualMatch[1];
      const title = visualMatch[2].trim();
      const items: string[] = [];
      index += 1;
      while (index < lines.length && !/^:{3,4}$/.test(lines[index].trim())) {
        const item = lines[index].trim().replace(/^-\s+/, "");
        if (item) items.push(item);
        index += 1;
      }
      nodes.push(
        <aside className={`article-visual article-visual-${kind}`} key={`visual-${index}`}>
          <strong>{renderInline(title)}</strong>
          <ul>{items.map(item => <li key={item}>{renderInline(item)}</li>)}</ul>
        </aside>
      );
      index += 1;
      continue;
    }
    if (line.startsWith("- ")) {
      flushParagraph(paragraph, nodes, `p-${index}`);
      const items: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("- ")) {
        items.push(lines[index].trim().replace(/^-\s+/, ""));
        index += 1;
      }
      nodes.push(<ul key={`ul-${index}`}>{items.map(item => <li key={item}>{renderInline(item)}</li>)}</ul>);
      continue;
    }
    paragraph.push(line);
    index += 1;
  }

  flushParagraph(paragraph, nodes, "p-final");
  return <div className="markdown-article">{nodes}</div>;
}
