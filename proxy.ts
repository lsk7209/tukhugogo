import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase();

  if (host === "www.patentgogo.com" || host === "tukhugogo.vercel.app") {
    const url = request.nextUrl.clone();
    url.hostname = "patentgogo.com";
    url.protocol = "https";
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*"
};
