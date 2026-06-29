import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { canonicalUrl, siteProfile } from "@/lib/site";

export const metadata: Metadata = {
  title: "소개",
  description: "특허고고가 배터리 특허 데이터를 정리하는 기준과 운영 원칙을 안내합니다.",
  alternates: { canonical: canonicalUrl("/about/") },
  openGraph: {
    title: `소개 | ${siteProfile.name}`,
    description: "배터리 특허 데이터룸 특허고고 소개",
    url: canonicalUrl("/about/"),
    locale: "ko_KR",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "특허고고 소개" }]
  },
  twitter: {
    card: "summary_large_image",
    title: `소개 | ${siteProfile.name}`,
    description: "배터리 특허 데이터룸 특허고고 소개",
    images: ["/og-image.png"]
  }
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="article-page legal-page">
        <div className="container">
          <article className="article-body">
            <p className="eyebrow">about</p>
            <h1>특허고고 소개</h1>
            <section>
              <h2>운영 목적</h2>
              <p>
                특허고고는 배터리와 이차전지 분야 특허 흐름을 기업, 기술 분야, 연도 기준으로 정리하는
                정보형 데이터룸입니다. 검색자가 KIPRIS와 특허청 자료를 더 빠르게 탐색할 수 있도록
                주요 수치, 비교표, 읽을거리를 함께 제공합니다.
              </p>
            </section>
            <section>
              <h2>운영 및 편집 책임</h2>
              <p>
                사이트의 공개 문장, 데이터 표시 기준, 정정 요청 처리는 {siteProfile.operatorName}이 관리합니다.
                데이터 오류, 출처 정정, 광고·개인정보 관련 문의는{" "}
                <a className="text-link" href={`mailto:${siteProfile.contactEmail}`}>{siteProfile.contactEmail}</a> 으로 접수합니다.
              </p>
            </section>
            <section>
              <h2>데이터 기준</h2>
              <p>
                사이트의 통계와 해석은 출처, 기준일, 가공 여부를 함께 표시하는 것을 원칙으로 합니다.
                데모 데이터가 사용되는 화면은 실제 출원 판단이나 권리 판단의 근거로 사용하면 안 됩니다.
              </p>
            </section>
            <section>
              <h2>주의 사항</h2>
              <p>
                특허고고는 법률 자문, 투자 권유, 특정 기업 추천을 제공하지 않습니다. 실제 출원, 등록,
                침해, 권리 범위 판단은 공식 원문과 전문가 검토를 함께 확인해야 합니다.
              </p>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
