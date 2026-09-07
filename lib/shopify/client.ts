// S-09: el cliente Shopify migró de axios a `fetch` nativo para poder usar el
// Data Cache de Next (`next: { revalidate }`). Con axios las queries siempre
// pagaban viaje de red en cada render.
//
// Reglas:
// - Consultas de catálogo/producto/colección: cacheadas con el revalidate que
//   pase cada operación (ver REVALIDATE más abajo).
// - Si hay `buyerIp` la respuesta es personalizada → no-store.
// - Mutaciones (cartCreate): siempre no-store.

const baseURL = `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/${process.env.SHOPIFY_STOREFRONT_VERSION}/graphql.json`;

// Vidas de caché por familia de datos (segundos), comentadas para la demo:
export const REVALIDATE = {
  /** Catálogo y búsqueda: precios/stock cambian durante el día. */
  catalog: 60,
  /** Ficha de producto: contenido casi estático. */
  product: 3600,
  /** Colecciones y su meta. */
  collection: 3600,
  /** Facetas del catálogo (tags/precios/opciones). */
  facets: 600,
  /** Sitemap: se regenera solo cuando hay catálogo nuevo. */
  sitemap: 3600,
} as const;

export async function shopifyQueryRaw<T>(
  query: string,
  variables?: Record<string, unknown>,
  buyerIp?: string,
  revalidate: number = REVALIDATE.catalog,
): Promise<T> {
  const headers: Record<string, string> = {
    "Shopify-Storefront-Private-Token":
      process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN ?? "",
    "Content-Type": "application/json",
  };

  const body = JSON.stringify({ query, variables });

  const init: RequestInit = {
    method: "POST",
    headers,
    body,
    // buyerIp personaliza resultados de búsqueda → nunca cacheable.
    // Las demás pasan por el Data Cache con tag "shopify" para poder
    // purgarlas de golpe (app/api/revalidate) cuando el catálogo cambia.
    ...(buyerIp
      ? { cache: "no-store" as RequestCache }
      : {
          cache: "force-cache" as RequestCache,
          next: { revalidate, tags: ["shopify"] },
        }),
  };

  if (buyerIp) {
    headers["Shopify-Storefront-Buyer-IP"] = buyerIp;
  }

  const response = await fetch(baseURL, init);

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Shopify request failed (${response.status}): ${detail.slice(0, 300)}`,
    );
  }

  const data = (await response.json()) as {
    data?: T;
    errors?: { message: string }[];
  };

  if (data.errors) {
    throw new Error(data.errors.map((e) => e.message).join("; "));
  }

  return data.data as T;
}

// Mutaciones: sin Data Cache jamás (crear un carrito por request).
export async function shopifyMutationRaw<T>(
  query: string,
  variables?: Record<string, unknown>,
  buyerIp?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    "Shopify-Storefront-Private-Token":
      process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN ?? "",
    "Content-Type": "application/json",
  };
  if (buyerIp) {
    headers["Shopify-Storefront-Buyer-IP"] = buyerIp;
  }

  const response = await fetch(baseURL, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Shopify request failed (${response.status}): ${detail.slice(0, 300)}`,
    );
  }

  const data = (await response.json()) as {
    data?: T;
    errors?: { message: string }[];
  };

  if (data.errors) {
    throw new Error(data.errors.map((e) => e.message).join("; "));
  }

  return data.data as T;
}
