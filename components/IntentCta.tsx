import Link from "next/link";

export function IntentCta({
  type,
  relatedDataHref = "/#tools",
  relatedDataLabel = "관련 데이터 보기"
}: {
  type: "guide" | "compare" | "lead";
  relatedDataHref?: string;
  relatedDataLabel?: string;
}) {
  if (type === "lead") {
    return (
      <div className="inline-callout">
        <b>출원 상담 전 체크</b>
        <p>
          발명 요약, 공개 여부, 기존 제품과의 차이, 실험 데이터, 예상 출원 국가를 정리하면 상담 시간이 줄고
          명세서 작성 범위를 더 명확하게 잡을 수 있습니다.
        </p>
        <Link className="text-link" href="/contact/">문의 기준 확인</Link>
      </div>
    );
  }

  if (type === "compare") {
    return (
      <div className="inline-callout">
        <b>데이터로 바로 비교하기</b>
        <p>
          기업별 기술분야 출원 분포를 함께 보면 단순 검색 결과보다 빠르게 경쟁이 집중된 영역과 비어 있는
          영역을 구분할 수 있습니다.
        </p>
        <Link className="text-link" href="/#tools">기업 비교기로 이동</Link>
      </div>
    );
  }

  return (
    <div className="inline-callout">
      <b>관련 데이터 보기</b>
      <p>
        기술분야별 출원 흐름과 기업별 분포를 함께 확인하면 용어 이해를 실제 분석 흐름으로 연결할 수 있습니다.
      </p>
      <Link className="text-link" href={relatedDataHref}>{relatedDataLabel}</Link>
    </div>
  );
}
