import Link from "next/link";
import { siteProfile } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <strong>{siteProfile.name}</strong>
          <p>
            특허고고는 배터리 특허 데이터를 분야, 기업, 연도 기준으로 정리하는 정보형 데이터룸입니다.
            수치와 해석은 출처와 기준일을 함께 확인할 수 있도록 제공합니다.
          </p>
        </div>
        <div>
          <p>
            법률 자문이나 투자 권유가 아닌 정보 제공 사이트입니다. 실제 출원, 등록, 권리 판단은
            KIPRIS, 특허청 자료, 전문가 검토를 함께 확인해야 합니다.
          </p>
          <nav className="footer-links" aria-label="사이트 정보">
            <Link href="/about/">소개</Link>
            <Link href="/contact/">문의</Link>
            <Link href="/privacy/">개인정보처리방침</Link>
            <Link href="/terms/">이용약관</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
