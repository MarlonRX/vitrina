import { notFound } from "next/navigation";
import { shopify } from "@/lib/shopify";
import { parseFilters, serializeFilters } from "@/lib/shopify/search";
import type { Connection, PageInfo, Product } from "@/lib/shopify/types";
import ClientProducts from "./ClientProducts";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: PageProps<"/products">) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const after = typeof params.cursor === "string" ? params.cursor : undefined;

  const facets = await shopify.getProductFacets();

  let products: Connection<Product> & { pageInfo: PageInfo };
  if (filters.collection) {
    if (!facets.collections.some((c) => c.handle === filters.collection)) {
      notFound();
    }
    const result = await shopify.getCollectionProductsFiltered(
      filters.collection,
      filters,
    );
    products = result.products;
  } else {
    const result = await shopify.getFilteredProducts(filters, 12, after);
    products = result.products;
  }

  const newSearchParams = serializeFilters(filters);
  if (products.pageInfo.endCursor) {
    newSearchParams.set("cursor", products.pageInfo.endCursor);
  }

  return (
    <ClientProducts
      products={products}
      newSearchParams={newSearchParams}
      facets={facets}
      filters={filters}
    />
  );
}
