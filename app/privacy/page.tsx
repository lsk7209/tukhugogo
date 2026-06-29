import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { canonicalUrl, siteProfile } from "@/lib/site";

const effectiveDate = "2026-06-28";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "특허고고의 개인정보 처리 기준, Google Analytics·AdSense 쿠키, 맞춤 광고 거부 방법을 안내합니다.",
  alternates: { canonical: canonicalUrl("/privacy/") },
  openGraph: {
    title: `개인정보처리방침 | ${siteProfile.name}`,
    description: "특허고고 개인정보처리방침",
    url: canonicalUrl("/privacy/"),
    locale: "ko_KR",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "특허고고 개인정보처리방침" }]
  },
  twitter: {
    card: "summary_large_image",
    title: `개인정보처리방침 | ${siteProfile.name}`,
    description: "특허고고 개인정보처리방침",
    images: ["/og-image.png"]
  }
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="article-page legal-page">
        <div className="container">
          <article className="article-body">
            <p className="eyebrow">privacy</p>
            <h1>개인정보처리방침</h1>
            <p className="direct-answer">시행일: {effectiveDate}</p>
            <section>
              <h2>수집하는 정보</h2>
              <p>
                특허고고는 회원가입 기능을 제공하지 않으며, 방문자가 직접 입력한 개인정보를 별도 회원 DB에 저장하지 않습니다.
                다만 사이트 보안, 오류 확인, 방문 통계, 광고 품질 관리를 위해 IP 주소 일부, 브라우저 정보, 접속 로그,
                쿠키 또는 유사 식별자가 처리될 수 있습니다.
              </p>
            </section>
            <section>
              <h2>Google Analytics와 AdSense</h2>
              <p>
                특허고고는 Google Analytics와 Google AdSense를 사용할 수 있습니다. Google과 제휴 광고 사업자는
                쿠키를 사용해 방문 통계, 광고 노출, 광고 성과, 부정 클릭 방지, 맞춤 광고 제공 여부를 처리할 수 있습니다.
              </p>
              <p>
                Google 광고 쿠키와 맞춤 광고에 관한 자세한 내용은 Google 광고 설정, Google 개인정보처리방침,
                브라우저 쿠키 설정에서 확인하고 변경할 수 있습니다.
              </p>
            </section>
            <section>
              <h2>쿠키 거부와 선택권</h2>
              <p>
                방문자는 브라우저 설정에서 쿠키 저장을 제한하거나 삭제할 수 있습니다. 맞춤 광고를 원하지 않는 경우
                Google 광고 설정에서 개인 맞춤 광고를 끄거나, 브라우저의 추적 제한 기능을 사용할 수 있습니다.
                쿠키를 제한하면 일부 통계 또는 광고 기능이 정상적으로 작동하지 않을 수 있습니다.
              </p>
            </section>
            <section>
              <h2>제3자 제공과 보관</h2>
              <p>
                특허고고는 방문자가 문의 메일로 보낸 정보를 문의 처리 목적 외로 판매하지 않습니다. 통계와 광고 처리는
                Google 등 외부 서비스 제공자의 정책과 보관 기준을 따를 수 있습니다. 문의 메일은 처리 목적이 끝나면
                필요한 보관 기간 이후 삭제합니다.
              </p>
            </section>
            <section>
              <h2>문의와 정정 요청</h2>
              <p>
                개인정보, 쿠키, 광고, 데이터 정정 관련 요청은{" "}
                <a className="text-link" href={`mailto:${siteProfile.contactEmail}`}>{siteProfile.contactEmail}</a> 으로 보낼 수 있습니다.
                요청 내용을 확인한 뒤 합리적인 범위에서 정정, 삭제, 답변을 진행합니다.
              </p>
            </section>
            <section>
              <h2>방침 변경</h2>
              <p>
                개인정보 처리 기준이 바뀌면 이 페이지에 변경 내용을 게시합니다. 중요한 변경이 있을 경우 시행일과
                변경 사유를 함께 표시합니다.
              </p>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
