import Link from "next/link";
import type {
  CollectionWithProducts,
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

interface ClientCollectionProductsProps {
  collection: CollectionWithProducts | null;
  products: Product[];
  meta: PageMeta;
  apiError: boolean;
  /** S-15: panel de filtros mixtos (facets null → sin filtros cargados). */
  facets?: ProductFacets | null;
  filters?: ProductFilters;
  baseQuery?: string;
}

export default function ClientCollectionProducts({
  collection,
  products,
  meta,
  apiError,
  facets,
  filters,
  baseQuery = "",
}: ClientCollectionProductsProps) {
  const handle = collection?.handle ?? "";

  function hrefFor(page: number) {
    const params = new URLSearchParams(baseQuery);
    if (page > 1) params.set("page", String(page));
    else params.delete("page");
    const qs = params.toString();
    return `/collections/${handle}${qs ? `?${qs}` : ""}`;
  }

  const grid = apiError ? (
    <StateView
      variant="error"
      title="No pudimos cargar esta colección"
      description="La tienda no respondió correctamente. Puede ser temporal; inténtalo otra vez."
      retry
    />
  ) : products.length === 0 ? (
    <StateView
      variant="empty"
      title={
        filters && (filters.search || filters.tags.length > 0 || filters.options.length > 0)
          ? "Ningún producto de esta colección coincide con los filtros"
          : "Esta colección está vacía por ahora"
      }
      description="Prueba a quitar algún filtro o cambia de categoría para ver más resultados."
      action={{ label: "Limpiar y ver colección", href: `/collections/${handle}` }}
    />
  ) : (
    <>
      <ProductGrid products={products} />
      <Pagination meta={meta} hrefFor={hrefFor} className="justify-center" />
    </>
  );

  return (
    // S-14l: sin max-w-6xl propio — el catálogo (ClientProducts) no topa su
    // ancho y usa todo el contenedor del layout. Aquí ese tope de 72rem dejaba
    // ~35% de franja muerta a la derecha de la grilla de 7 columnas.
    <main className="mx-auto flex w-full flex-col gap-6 py-2">
      <div className="flex flex-col items-center gap-2 text-center">
        {collection ? (
          <Breadcrumbs
            items={[
              { label: "Inicio", href: "/" },
              { label: "Colecciones", href: "/collections" },
              { label: collection.title },
            ]}
          />
        ) : null}
        <h1 className="text-3xl md:text-4xl">
          {collection?.title ?? "Colección"}
        </h1>
        <p className="max-w-md text-sm text-(--text-secondary)">
          {collection?.description}
        </p>
      </div>

      {facets && filters ? (
        // S-14m: panel de filtros de 220px a 300px (sintaxis simple, ya
        // probada; los paréntesis con comas no generan CSS en Tailwind).
        // `min-w-0` en ambos hijos: nada desborda su columna y mezclarse.
        <div className="grid gap-8 md:grid-cols-[300px_1fr]">
          <ProductFiltersForm facets={facets} filters={filters} />
          <div className="flex min-w-0 flex-col gap-6">{grid}</div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {grid}
          {collection ? (
            <Link
              href={`/products?collection=${collection.handle}`}
              className="text-sm underline"
            >
              Filtrar catálogo por esta colección
            </Link>
          ) : null}
        </div>
      )}
    </main>
  );
}
