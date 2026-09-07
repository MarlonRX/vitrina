import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadCollectionPage } from "@/lib/shopify/loaders";
import { shopify } from "@/lib/shopify";
import {
  emptyMeta,
  getProductsPage,
  normalizePage,
  type PagedProducts,
} from "@/lib/shopify/pagination";
import { parseFilters, serializeFilters } from "@/lib/shopify/search";
import type {
  CollectionWithProducts,
  ProductFacets,
  ProductFilters,
} from "@/lib/shopify/types";
import { absoluteUrl, plainDescription } from "@/lib/seo";
import ClientCollectionProducts from "./ClientCollectionProducts";

export const dynamic = "force-dynamic";

type CollectionPageProps = PageProps<"/collections/[handle]">;

type CollectionLoad = {
  collection: CollectionWithProducts | null;
  paged: PagedProducts;
  facets: ProductFacets | null;
  filters: ProductFilters;
};

export async function generateMetadata({
  params,
  searchParams,
}: CollectionPageProps): Promise<Metadata> {
  const { handle } = await params;
  const sp = await searchParams;
  const page = normalizePage(sp.page);

  // Reutiliza la misma carga de datos de la página (misma req).
  const { collection } = await loadCollectionPage(handle, 1);

  if (!collection) {
    return { title: "Colección no encontrada" };
  }

  const title = page > 1 ? `${collection.title} · página ${page}` : collection.title;
  const description = plainDescription(
    collection.description || `Productos de la colección ${collection.title}.`,
  );
  const canonical = page > 1 ? `/collections/${handle}?page=${page}` : `/collections/${handle}`;

  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(canonical) },
    openGraph: {
      title,
      description,
      url: absoluteUrl(canonical),
      images: collection.image
        ? [{ url: collection.image.url, alt: collection.image.altText ?? collection.title }]
        : undefined,
    },
  };
}

async function loadCollectionWithFilters(
  handle: string,
  sp: Record<string, string | string[] | undefined>,
  page: number,
): Promise<CollectionLoad> {
  const baseFilters = parseFilters(sp);
  const filters: ProductFilters = { ...baseFilters, collection: handle };
  const hasFilters = Boolean(
    baseFilters.search ||
      baseFilters.tags.length > 0 ||
      baseFilters.options.length > 0 ||
      baseFilters.minPrice != null ||
      baseFilters.maxPrice != null ||
      (baseFilters.sortKey && baseFilters.sortKey !== "RELEVANCE"),
  );

  // S-15: con filtros activos la lista se filtra/ordena en memoria
  // (getCollectionProductsFiltered) y el corte de página es local; sin
  // filtros se conserva el paginado por cursor, más barato.
  if (hasFilters) {
    const [paged, facets, collection] = await Promise.all([
      getProductsPage(filters, page),
      shopify.getProductFacets(),
      shopify.getCollection(handle),
    ]);
    // CollectionWithProducts exige el campo products; aquí la lista llega por
    // getProductsPage, así que se satisface con un connection vacío tipado.
    const collectionFull: CollectionWithProducts | null = collection
      ? {
          ...collection,
          products: { edges: [], pageInfo: { hasNextPage: false, endCursor: null } },
        }
      : null;
    return { collection: collectionFull, paged, facets, filters };
  }

  const result = await loadCollectionPage(handle, page);
  return {
    collection: result.collection,
    paged: result.paged,
    facets: null,
    filters,
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  const { handle } = await params;
  const sp = await searchParams;
  const page = normalizePage(sp.page);

  let load: CollectionLoad | null = null;
  let apiError = false;
  try {
    load = await loadCollectionWithFilters(handle, sp, page);
  } catch (error) {
    apiError = true;
    console.error("[collection] Shopify query failed:", error);
  }

  // Handle inexistente → 404 solo si la API respondió (no en error).
  if (!apiError && load && !load.collection) {
    notFound();
  }

  const baseParams = serializeFilters({
    ...load?.filters,
    collection: undefined,
  } as ProductFilters);

  return (
    <ClientCollectionProducts
      collection={load?.collection ?? null}
      products={load?.paged.products ?? []}
      meta={load?.paged.meta ?? emptyMeta()}
      apiError={apiError}
      facets={load?.facets ?? null}
      filters={load?.filters}
      baseQuery={baseParams.toString()}
    />
  );
}
