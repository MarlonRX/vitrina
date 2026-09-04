import type {
  Connection,
  PageInfo,
  Product,
  ProductFacets,
  ProductFilters,
} from "@/lib/shopify/types";
import Link from "next/link";
import ProductFiltersForm from "@/components/products/ProductFilters";
import ProductGrid from "@/components/products/ProductGrid";

interface ClientProductsProps {
  products: Connection<Product> & { pageInfo: PageInfo };
  newSearchParams: URLSearchParams;
  facets: ProductFacets;
  filters: ProductFilters;
}

export default function ClientProducts({
  products,
  newSearchParams,
  facets,
  filters,
}: ClientProductsProps) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Productos</h1>

      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <ProductFiltersForm facets={facets} filters={filters} action="/products" />
        <div className="flex flex-col gap-6">
          <ProductGrid products={products.edges.map((edge) => edge.node)} />

          {products.pageInfo.hasNextPage && (
            <Link
              href={`/products?${newSearchParams.toString()}`}
              className="text-sm underline"
            >
              Cargar más
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
