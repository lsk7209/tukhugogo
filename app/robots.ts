import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/lib/keyword-taxonomy";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/api/*"
      },
      {
        userAgent: ["Googlebot", "Mediapartners-Google", "AdsBot-Google"],
        allow: "/",
        disallow: "/api/*"
      },
      {
        userAgent: ["GPTBot", "ChatGPT-User", "ClaudeBot", "PerplexityBot"],
        allow: "/",
        disallow: "/api/*"
      }
    ],
    sitemap: canonicalUrl("/sitemap.xml")
  };
}
