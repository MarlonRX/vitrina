import type {
  Product,
  ProductFacets,
  ProductFilters,
} from "@/lib/shopify/types";
import type { PageMeta } from "@/lib/shopify/pagination";
import Breadcrumbs from "@/components/Breadcrumbs";
import Pagination from "@/components/Pagination";
import ProductFiltersForm from "@/components/products/ProductFilters";
import ProductGrid from "@/components/products/ProductGrid";
import StateView from "@/components/StateView";
import Link from "next/link";

interface ClientProductsProps {
  products: Product[];
  meta: PageMeta;
  baseQuery: string;
  facets: ProductFacets;
  filters: ProductFilters;
  apiError: boolean;
}

function hrefFor(baseQuery: string, page: number) {
  const params = new URLSearchParams(baseQuery);
  if (page > 1) params.set("page", String(page));
  else params.delete("page");
  const qs = params.toString();
  return qs ? `/products?${qs}` : "/products";
}

export default function ClientProducts({
  products,
  meta,
  baseQuery,
  facets,
  filters,
  apiError,
}: ClientProductsProps) {
  const activeCollection = filters.collection
    ? facets.collections.find((c) => c.handle === filters.collection)
    : undefined;

  const crumbs = [
    { label: "Inicio", href: "/" },
    { label: "Catálogo", href: activeCollection ? "/products" : undefined },
    ...(activeCollection
      ? [
          {
            label: activeCollection.title,
            href: `/collections/${activeCollection.handle}`,
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={crumbs} />
      <h1 className="text-2xl font-bold">
        {activeCollection ? `Catálogo · ${activeCollection.title}` : "Productos"}
      </h1>

      {/* S-14m: filtros de 220px a 300px, mismo que el detalle de
          colecciones. `min-w-0` en ambos hijos evita desbordes cruzados. */}
      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        <ProductFiltersForm facets={facets} filters={filters} />
        <div className="flex min-w-0 flex-col gap-6">
          {apiError ? (
            <StateView
              variant="error"
              title="No pudimos cargar el catálogo"
              description="La tienda no respondió correctamente. Puede ser temporal; inténtalo otra vez."
              retry
            />
          ) : products.length === 0 ? (
            <StateView
              variant="empty"
              title="No hay productos con estos filtros"
              description="Prueba a quitar algún filtro o cambia de categoría para ver más resultados."
              action={
                filters.search || filters.collection || filters.tags.length > 0
                  ? { label: "Ver todo el catálogo", href: "/products" }
                  : undefined
              }
            />
          ) : (
            <>
              <ProductGrid products={products} />
              <div className="flex items-center justify-between">
                <Pagination
                  meta={meta}
                  hrefFor={(page) => hrefFor(baseQuery, page)}
                />
                {activeCollection ? (
                  <Link
                    href={`/collections/${activeCollection.handle}`}
                    className="text-sm underline"
                  >
                    Ver colección completa
                  </Link>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
