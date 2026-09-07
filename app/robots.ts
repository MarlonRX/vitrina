import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// S-04 dentro de S-02a06: robots.txt que apunta al sitemap generado.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/cart", "/search"]
      // nota S-13: /search redirige 308 a /products?q=,
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
