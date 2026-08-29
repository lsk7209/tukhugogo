const defaultBaseUrl = "https://patentgogo.com/";
const googlebot =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const baseUrl = new URL(process.argv[2] ?? defaultBaseUrl);
const disallowedRoutes = [
  "/",
  "/blog/",
  "/about/",
  "/contact/",
  "/privacy/",
  "/terms/",
  "/company/c1/",
  "/robots.txt",
  "/sitemap.xml",
  "/feed.xml",
  "/llms.txt",
  "/api/patent-metrics/",
];
const informationalDetailRoutes = [
  "/guide/kipris-search/",
  "/blog/family-priority-workflow/",
  "/tech/solid/",
  "/ranking/solid/",
];
const routesWithoutDeploymentMarker = new Set([
  "/robots.txt",
  "/sitemap.xml",
  "/feed.xml",
  "/llms.txt",
  "/api/patent-metrics/",
]);
const loaderPattern =
  /<script[^>]+src=["'][^"']*pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js[^"']*["'][^>]*>/i;

async function inspect(path, loaderAllowed) {
  const url = new URL(path, baseUrl);
  const response = await fetch(url, {
    headers: { "user-agent": googlebot },
    redirect: "follow",
    signal: AbortSignal.timeout(15_000),
  });
  const html = await response.text();
  const loaderPresent = loaderPattern.test(html);
  return {
    path,
    expectedUrl: url.href,
    status: response.status,
    finalUrl: response.url,
    loaderAllowed,
    loaderPresent,
    deploymentIds: [
      ...new Set(
        [...html.matchAll(/[?&]dpl=(dpl_[A-Za-z0-9]+)/g)].map(
          (match) => match[1],
        ),
      ),
    ],
  };
}

const results = [];
for (const path of disallowedRoutes) {
  results.push(await inspect(path, false));
}
for (const path of informationalDetailRoutes) {
  results.push(await inspect(path, true));
}

const failures = [];
for (const result of results) {
  if (result.status !== 200) {
    failures.push(`${result.path}: expected HTTP 200, got ${result.status}`);
  }
  if (!result.loaderAllowed && result.loaderPresent) {
    failures.push(`${result.path}: AdSense loader is present outside a reader detail route`);
  }
  if (result.finalUrl !== result.expectedUrl) {
    failures.push(
      `${result.path}: expected final URL ${result.expectedUrl}, got ${result.finalUrl}`,
    );
  }
  if (
    !routesWithoutDeploymentMarker.has(result.path) &&
    result.deploymentIds.length !== 1
  ) {
    failures.push(
      `${result.path}: expected exactly one deployment marker, got ${result.deploymentIds.length}`,
    );
  }
}

const deploymentIds = [...new Set(results.flatMap((result) => result.deploymentIds))];
if (deploymentIds.length > 1) {
  failures.push(`mixed deployment markers detected: ${deploymentIds.join(", ")}`);
}

console.log(
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      baseUrl: baseUrl.href,
      deploymentIds,
      readerLoaderPresenceAsserted: false,
      readerLoaderVerification:
        "Raw HTML gates only forbidden routes; verify allowed detail-route hydration with a real browser.",
      results,
      failures,
    },
    null,
    2,
  ),
);

if (failures.length > 0) process.exit(1);
