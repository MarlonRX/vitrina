import { shopify } from "@/lib/shopify";
import { parseFilters } from "@/lib/shopify/search";
import ClientHome from "./ClientHome";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const filters = parseFilters(params);

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.collection ||
      filters.tags.length > 0 ||
      filters.minPrice != null ||
      filters.maxPrice != null ||
      filters.options.length > 0,
  );

  const [productsResult, collectionsResult] = await Promise.all([
    filters.collection
      ? shopify.getCollectionProductsFiltered(filters.collection, filters)
      : shopify.getFilteredProducts(filters, 8),
    hasActiveFilters ? Promise.resolve(null) : shopify.getCollections(),
  ]);

  const products = productsResult.products.edges.map((edge) => edge.node);
  const collections = collectionsResult
    ? collectionsResult.collections.edges.map((edge) => edge.node).slice(0, 4)
    : [];

  return (
    <ClientHome
      products={products}
      collections={collections}
      hasActiveFilters={hasActiveFilters}
    />
  );
}
