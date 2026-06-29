import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { LineChart } from "@/components/charts";
import { SiteHeader } from "@/components/SiteHeader";
import { PatentTools } from "@/components/tools";
import { getBlogEntries, guideTopics, rankingPath } from "@/lib/keyword-taxonomy";
import { getPatentData, isDemoDataConfigured, koNum } from "@/lib/patent-data";
import { canonicalUrl, siteProfile } from "@/lib/site";

function MiniBars({ values }: { values: number[] }) {
  return (
    <div className="mini-bars">
      {values.map((value, index) => (
        <div className="bar-row" key={index}>
          <span>분야{index + 1}</span>
          <div className="bar-track"><div className="bar-fill" style={{ width: `${value}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

export default async function Page() {
  const data = await getPatentData();
  const solid = data.timeline.solid ?? data.timeline[data.techFields[0].id];
  const cell = data.timeline.cell ?? data.timeline[data.techFields[0].id];
  const total2025 = data.techFields.reduce((sum, field) => sum + (data.timeline[field.id]?.at(-1) ?? 0), 0);
  const firstField = data.techFields[0];
  const demoData = isDemoDataConfigured();
  const allBlogEntries = getBlogEntries(data);
  const blogEntries = (demoData ? allBlogEntries.filter(entry => entry.href.startsWith("/guide/")) : allBlogEntries).slice(0, 6);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: siteProfile.name,
          description: siteProfile.description,
          url: canonicalUrl("/")
        }}
      />
      <a className="skip-link" href="#main">본문으로 건너뛰기</a>
      <SiteHeader techHref={demoData ? "/#tools" : `/tech/${firstField.id}`} />

      <main id="main">
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <p className="eyebrow">특허 데이터룸 · 이차전지</p>
              <h1>특허 검색을 끝내는 배터리 특허 데이터룸.</h1>
              <p className="lead">KIPRIS 검색으로 들어온 사용자가 기업 비교, 분야 추세 확인, 관심 기업 추적까지 한 화면에서 이어갈 수 있도록 만든 특허맵 기반 사이트입니다.</p>
            </div>
            <aside className="decision-panel" aria-label="사이트 요약">
              <strong>페르소나 기준</strong>
              <p><b>중립적인 특허 데이터 해설자</b>로 작동합니다. 출원 건수를 기술 우위로 단정하지 않고, 출처와 기준일을 먼저 보여줍니다.</p>
              <div className="source-caption">
                <span>출처: {data.meta.source}</span>
                <span>기준: {data.meta.asOf}</span>
              </div>
            </aside>
          </div>
        </section>

        <section id="analysis-standard" className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">분석 기준</p>
              <h2>출원 건수를 결론이 아니라 탐색 신호로 봅니다</h2>
              <p>배터리 특허는 출원인 표기, 패밀리 중복, 공개 지연, 등록 상태가 함께 얽힙니다. 특허고고는 숫자를 먼저 보여주되 해석의 한계를 같이 표시합니다.</p>
            </div>
            <div className="gate-grid">
              <article>
                <span>출원인</span>
                <h3>기업명은 정규화가 필요합니다</h3>
                <p>한글명, 영문명, 계열사, 과거 사명이 나뉘면 같은 기업도 여러 출원인으로 보일 수 있습니다.</p>
              </article>
              <article>
                <span>기술분야</span>
                <h3>IPC와 키워드를 함께 봅니다</h3>
                <p>양극재, 전해질, BMS처럼 표현이 다른 영역은 IPC 분류와 핵심 키워드를 함께 확인해야 누락이 줄어듭니다.</p>
              </article>
              <article>
                <span>연도</span>
                <h3>최근 문헌은 심사 전일 수 있습니다</h3>
                <p>공개 직후 문헌은 등록률이 낮게 보일 수 있으므로 출원 추세와 등록 상태를 분리해 읽어야 합니다.</p>
              </article>
              <article>
                <span>해석</span>
                <h3>건수만으로 기술 우위를 단정하지 않습니다</h3>
                <p>특허 수는 관심 영역을 찾는 신호입니다. 청구항 범위, 패밀리 국가, 인용 관계를 함께 확인해야 합니다.</p>
              </article>
            </div>
            <div className="inline-callout">
              <strong>{demoData ? "현재 통계 화면은 시연 데이터 기준입니다." : "현재 통계 화면은 연결된 데이터 기준입니다."}</strong>
              <p>
                {demoData
                  ? "실데이터 연결 전까지 분야·랭킹·기업 상세 페이지는 검색 색인에서 제외하고, 공개 탐색 경로는 가이드와 비교 도구 중심으로 유지합니다."
                  : `기준일 ${data.meta.asOf}, 출처 ${data.meta.source} 기준으로 분야·랭킹·기업 상세 페이지를 제공합니다.`}
              </p>
            </div>
          </div>
        </section>

        <section id="chart-variants" className="section paper-band">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">핵심 추세</p>
              <h2>기술 분야별 흐름을 한눈에 비교합니다</h2>
              <p>연도별 증가 폭과 분야 간 차이를 함께 보면 어느 영역에서 출원이 집중되는지 빠르게 확인할 수 있습니다.</p>
            </div>
            <div className="variant-grid charts">
              {[
                ["전고체 전지 출원 흐름", "고체전해질과 셀 구조 관련 문헌의 장기 흐름을 확인합니다.", "전고체"],
                ["전고체·셀 패키징 비교", "소재 중심 분야와 셀 구조 분야가 다른 속도로 움직이는지 비교합니다.", "비교"]
              ].map(([title, note, tag], index) => (
                <article className="artboard-card chart-card" key={title}>
                  <h3>{title}</h3>
                  <div className="chart-box"><LineChart years={data.years} values={solid} secondValues={index ? cell : undefined} /></div>
                  <p>{note}</p>
                  <span className="pro-tag">{tag}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="tools" className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">비교 도구</p>
              <h2>인터랙티브 도구 3종</h2>
              <p>검색 유입을 체류와 재방문으로 바꾸기 위해 기업 비교, 분야 타임라인, 관심 추적을 제공합니다.</p>
            </div>
            <PatentTools data={data} />
          </div>
        </section>

        <section id="keyword-entry" className="section paper-band">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">검색 가이드</p>
              <h2>다양한 검색 의도를 받는 진입 페이지</h2>
              <p>KIPRIS 검색, 특허 출원 비용, IPC 분류, 기업명, 기술분야, 랭킹형 키워드를 각각 별도 URL로 받습니다.</p>
            </div>
            <div className="gate-grid">
              {guideTopics.slice(0, 4).map(topic => (
                <article key={topic.slug}>
                  <span>{topic.intent}</span>
                  <h3><Link href={`/guide/${topic.slug}`}>{topic.primaryKeyword}</Link></h3>
                  <p>{topic.summary}</p>
                </article>
              ))}
            </div>
            <div className="inline-callout">
              <strong>분야·랭킹 페이지도 자동 생성됩니다.</strong>
              {demoData ? (
                <p>실데이터가 연결되면 분야별 동향과 출원인 랭킹 페이지를 색인 대상으로 전환합니다. 지금은 <Link className="text-link" href="/#tools">비교 도구</Link>와 검색 가이드에서 탐색을 시작할 수 있습니다.</p>
              ) : (
                <p><Link className="text-link" href={`/tech/${firstField.id}`}>{firstField.name} 특허 동향</Link>과 <Link className="text-link" href={rankingPath(firstField)}>{firstField.name} 출원인 랭킹</Link>에서 확인할 수 있습니다.</p>
              )}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">글 목록</p>
              <h2>최신 특허 데이터 글</h2>
              <p>기존 랜딩 페이지를 카드형 글 목록으로 재구성해 더 많은 검색어와 탐색 흐름을 받습니다.</p>
            </div>
            <div className="blog-card-grid">
              {blogEntries.map(entry => (
                <Link className="blog-card" href={entry.href} key={entry.href}>
                  <span>{entry.category}</span>
                  <h3>{entry.title}</h3>
                  <p>{entry.excerpt}</p>
                  <small>{entry.date} · {entry.intent}</small>
                </Link>
              ))}
            </div>
            <Link className="text-link" href="/blog/">전체 글 목록 보기</Link>
          </div>
        </section>
      </main>
    </>
  );
}
