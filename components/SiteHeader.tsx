import Link from "next/link";

export function SiteHeader({ techHref = "/#tools" }: { techHref?: string }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="wordmark" href="/" aria-label="특허고고 홈">
          <span>특허고고</span><i aria-hidden="true" />
        </Link>
        <nav aria-label="주요 메뉴">
          <Link href="/blog/">블로그</Link>
          <Link href="/guide/kipris-search">KIPRIS</Link>
          <Link href={techHref}>기술동향</Link>
          <Link href="/#tools">비교도구</Link>
        </nav>
      </div>
    </header>
  );
}
