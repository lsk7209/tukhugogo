import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { canonicalUrl, siteProfile } from "@/lib/site";

export const metadata: Metadata = {
  title: "문의",
  description: "특허고고 데이터 오류, 출처 정정, 개인정보·광고·제휴 문의 접수 기준을 안내합니다.",
  alternates: { canonical: canonicalUrl("/contact/") },
  openGraph: {
    title: `문의 | ${siteProfile.name}`,
    description: "특허고고 문의 안내",
    url: canonicalUrl("/contact/"),
    locale: "ko_KR",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "특허고고 문의" }]
  },
  twitter: {
    card: "summary_large_image",
    title: `문의 | ${siteProfile.name}`,
    description: "특허고고 문의 안내",
    images: ["/og-image.png"]
  }
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="article-page legal-page">
        <div className="container">
          <article className="article-body">
            <p className="eyebrow">contact</p>
            <h1>문의</h1>
            <section>
              <h2>연락처</h2>
              <p>
                사이트 운영, 데이터 오류, 출처 정정, 개인정보, 광고 관련 문의는{" "}
                <a className="text-link" href={`mailto:${siteProfile.contactEmail}`}>{siteProfile.contactEmail}</a> 으로 보내 주세요.
                검토가 필요한 URL, 확인한 날짜, 관련 특허번호나 기업명을 함께 적으면 더 빠르게 확인할 수 있습니다.
              </p>
            </section>
            <section>
              <h2>문의 범위</h2>
              <p>
                데이터 오류, 출처 정정, 페이지 개선 제안, 제휴 문의를 접수합니다. 특허 출원 전략,
                침해 판단, 분쟁 대응처럼 전문 판단이 필요한 사안은 변리사나 법률 전문가에게 상담해야 합니다.
              </p>
            </section>
            <section>
              <h2>보내주면 좋은 정보</h2>
              <p>
                문제가 있는 URL, 확인한 날짜, 관련 특허번호나 기업명, 정정이 필요한 문장을 함께 보내면
                원문과 데이터 기준일을 대조해 검토할 수 있습니다. 개인정보가 포함된 자료는 필요한 범위만 보내 주세요.
              </p>
            </section>
            <section>
              <h2>답변 기준</h2>
              <p>
                단순 오탈자나 링크 오류는 확인 후 사이트에 반영합니다. 데이터 해석이나 특허 권리 판단이 필요한
                문의는 공식 원문 확인 범위까지만 답변하며, 법률 자문은 제공하지 않습니다.
              </p>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
