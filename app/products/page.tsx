import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { shopify } from "@/lib/shopify";
import { emptyMeta, getProductsPage, normalizePage } from "@/lib/shopify/pagination";
import { parseFilters, serializeFilters } from "@/lib/shopify/search";
import { absoluteUrl, plainDescription } from "@/lib/seo";
import ClientProducts from "./ClientProducts";

export const dynamic = "force-dynamic";

type ProductsPageProps = PageProps<"/products">;

export async function generateMetadata({
  searchParams,
}: ProductsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const filters = parseFilters(params);
  const page = normalizePage(params.page);

  let title = "Catálogo de productos";
  let description =
    "Explora todos los productos de la tienda Vitrina: filtra por categoría, precio, etiquetas y opciones.";

  if (filters.collection) {
    const collection = await shopify.getCollection(filters.collection);
    if (collection) {
      title = `Catálogo · ${collection.title}`;
      description = plainDescription(
        collection.description ||
          `Productos de la colección ${collection.title} en Vitrina.`,
      );
    }
  } else if (filters.search) {
    title = `Catálogo · resultados para “${filters.search}”`;
  }

  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(page > 1 ? `/products?page=${page}` : "/products") },
  };
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const page = normalizePage(params.page);

  // Colección en la URL → debe existir (404 si el handle es inválido).
  if (filters.collection) {
    const facets = await shopify.getProductFacets();
    if (!facets.collections.some((c) => c.handle === filters.collection)) {
      notFound();
    }
  }

  const facets = await shopify.getProductFacets();

  let products: Awaited<ReturnType<typeof getProductsPage>> | null = null;
  let apiError = false;
  try {
    products = await getProductsPage(filters, page);
  } catch (error) {
    apiError = true;
    console.error("[products] Shopify query failed:", error);
  }

  // Query base sin `page`: el paginador lo añade por enlace.
  const baseParams = serializeFilters(filters);

  return (
    <ClientProducts
      products={products?.products ?? []}
      meta={products?.meta ?? emptyMeta()}
      baseQuery={baseParams.toString()}
      facets={facets}
      filters={filters}
      apiError={apiError}
    />
  );
}
