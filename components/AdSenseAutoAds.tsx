"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

const isReaderDetailRoute = (pathname: string) =>
  /^\/(guide|tech|ranking|blog)\/[^/]+\/?$/.test(pathname);

export function AdSenseAutoAds({ publisherId }: { publisherId: string }) {
  const pathname = usePathname();

  if (!publisherId || !isReaderDetailRoute(pathname)) return null;

  return (
    <Script
      async
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      strategy="afterInteractive"
    />
  );
}
