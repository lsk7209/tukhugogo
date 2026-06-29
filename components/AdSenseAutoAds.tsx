"use client";

import { useEffect } from "react";

export function AdSenseAutoAds({ publisherId }: { publisherId: string }) {
  useEffect(() => {
    if (!publisherId) return;
    if (document.querySelector('meta[name="robots"][content*="noindex"]')) return;
    if (document.getElementById("adsense-loader")) return;

    const script = document.createElement("script");
    script.id = "adsense-loader";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
    document.head.appendChild(script);
  }, [publisherId]);

  return null;
}
