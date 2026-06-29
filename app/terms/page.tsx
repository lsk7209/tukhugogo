import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { canonicalUrl, siteProfile } from "@/lib/site";

export const metadata: Metadata = {
  title: "이용약관",
  description: "특허고고 이용 조건, 정보 제공 범위, 책임 제한 기준을 안내합니다.",
  alternates: { canonical: canonicalUrl("/terms/") },
  openGraph: {
    title: `이용약관 | ${siteProfile.name}`,
    description: "특허고고 이용약관",
    url: canonicalUrl("/terms/"),
    locale: "ko_KR",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "특허고고 이용약관" }]
  },
  twitter: {
    card: "summary_large_image",
    title: `이용약관 | ${siteProfile.name}`,
    description: "특허고고 이용약관",
    images: ["/og-image.png"]
  }
};

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="article-page legal-page">
        <div className="container">
          <article className="article-body">
            <p className="eyebrow">terms</p>
            <h1>이용약관</h1>
            <section>
              <h2>서비스 성격</h2>
              <p>
                특허고고는 배터리 특허 데이터를 정리해 제공하는 정보형 사이트입니다. 사이트의 글, 표,
                차트는 이해를 돕기 위한 참고 자료이며 법률 자문이나 투자 판단 자료가 아닙니다.
              </p>
            </section>
            <section>
              <h2>이용자 책임</h2>
              <p>
                이용자는 특허 출원, 등록, 권리 범위, 침해 여부를 판단할 때 공식 원문과 전문가 검토를
                함께 확인해야 합니다. 사이트 정보만으로 발생한 판단 결과에 대해 운영자는 책임을 지지 않습니다.
              </p>
            </section>
            <section>
              <h2>저작권과 재사용</h2>
              <p>
                사이트의 자체 편집 문장, 구조, 차트 구성은 운영자에게 권리가 있습니다. 외부 출처 데이터는
                각 제공 기관의 이용 조건을 따르며, 재배포 전 원 출처의 라이선스를 확인해야 합니다.
              </p>
            </section>
            <section>
              <h2>변경</h2>
              <p>
                운영자는 데이터 품질, 보안, 정책 준수를 위해 사이트 구조와 약관을 변경할 수 있습니다.
                중요한 변경은 이 페이지 또는 변경 기록에 반영합니다.
              </p>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
