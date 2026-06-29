import type { PatentData } from "@/lib/patent-data";

export function SourceCaption({ meta }: { meta: PatentData["meta"] }) {
  return (
    <div className="source-caption">
      <span>
        출처:{" "}
        {meta.sourceUrl ? (
          <a href={meta.sourceUrl} target="_blank" rel="noopener noreferrer">{meta.source}</a>
        ) : (
          meta.source
        )}
      </span>
      <span>기준일: {meta.asOf}</span>
      <span>{meta.note}</span>
    </div>
  );
}
