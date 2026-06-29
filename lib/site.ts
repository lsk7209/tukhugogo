function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_SITE_URL is required in production for canonical URL generation.");
  }
  return "https://tukhugogo.vercel.app";
}

function getContactEmail() {
  const configured = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_CONTACT_EMAIL is required in production for public contact and trust pages.");
  }
  return "contact@patentgogo.com";
}

function optionalEnv(name: string) {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export const SITE_URL = getSiteUrl();

export const siteProfile = {
  name: "특허고고",
  shortName: "특허고고",
  description: "배터리 특허 검색, 특허맵, 기업 비교, 분야별 출원 흐름을 공식 출처 기준으로 정리하는 특허 데이터룸입니다.",
  topic: "배터리 특허맵과 이차전지 기술 경쟁 데이터",
  audience: "KIPRIS 검색을 시작하는 실무자, 배터리 산업 리서처, 특허 출원 전 시장과 기술 흐름을 확인하는 창업자와 기업 담당자",
  tone: ["중립적", "출처 우선", "수치 해석은 보수적으로", "법률 자문처럼 단정하지 않음"],
  trustMarkers: ["데이터 기준일", "출처 제시", "시연 데이터 고지", "검토일"],
  operatorName: "특허고고 운영팀",
  adsensePublisherId: "ca-pub-3050601904412736",
  adsTxt: "google.com, pub-3050601904412736, DIRECT, f08c47fec0942fa0",
  contactEmail: getContactEmail(),
  gaMeasurementId: optionalEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID"),
  googleSiteVerification: optionalEnv("NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION"),
  naverSiteVerification: optionalEnv("NEXT_PUBLIC_NAVER_SITE_VERIFICATION")
};

export function canonicalUrl(path = "/") {
  const normalized = path === "/" || path.endsWith("/") || /\.[a-z0-9]+$/i.test(path) ? path : `${path}/`;
  return new URL(normalized, SITE_URL).toString();
}

export function reviewedDate() {
  return "2026-06-28";
}
