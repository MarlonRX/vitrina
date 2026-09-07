import type { MetadataRoute } from "next";
import { shopify } from "@/lib/shopify";
import { SITE_URL } from "@/lib/seo";

// S-04 dentro de S-02a06: sitemap con páginas estáticas + productos +
// colecciones desde Shopify (funciona también en modo mock).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/collections`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];

  // /search, /cart y /api no se publican (no indexables por metadata).
  try {
    const [products, collectionHandles] = await Promise.all([
      shopify.getSitemapProducts(),
      shopify.getSitemapCollections(),
    ]);

    const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${SITE_URL}/products/${product.handle}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
      ...(product.featuredImage ? { images: [product.featuredImage.url] } : {}),
    }));

    const collectionEntries: MetadataRoute.Sitemap = collectionHandles.map(
      (handle) => ({
        url: `${SITE_URL}/collections/${handle}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
      }),
    );

    return [...staticPages, ...productEntries, ...collectionEntries];
  } catch (error) {
    // Si Shopify falla, el sitemap sigue sirviendo las páginas estáticas.
    console.error("[sitemap] Shopify query failed:", error);
    return staticPages;
  }
}
