export function AdSenseAutoAds({ publisherId }: { publisherId: string }) {
  if (!publisherId) return null;

  return (
    <script
      id="adsense-loader"
      async
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
    />
  );
}
