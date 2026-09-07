import type { Metadata } from "next";
import { shopify } from "@/lib/shopify";
import { parseFilters } from "@/lib/shopify/search";
import ClientHome from "./ClientHome";

// S-09 (revalidate): la home no lee cookies ni headers; con el catálogo
// cacheado por fetch, la ruta puede renderizarse ISR y servir de memoria.
export const revalidate = 60;

// S-14b: Fisher-Yates parcial — quince piezas distintas del surtido, que
// rotan en cada revalidación ISR.
function sample<T>(pool: T[], n: number): T[] {
  const arr = [...pool];
  for (let i = 0; i < n && i < arr.length; i++) {
    const j = i + Math.floor(Math.random() * (arr.length - i));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Vitrina — Tienda de diseño y artesanía",
    description:
      "Descubre cerámica artesanal, iluminación y decoración hecha a mano. Envíos a todo el país desde Vitrina.",
    alternates: { canonical: "/" },
  };
}

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
  // S-14b: la home "desnuda" (sin filtros) muestra un surtido aleatorio de
  // quince piezas para que el carrusel de destacados tenga de qué vivir.
  // Con filtros activos respetamos lo que pidió el usuario (orden/consulta).
  const plainHome = !hasActiveFilters && !filters.collection;

  const [productsResult, collectionsResult] = await Promise.all([
    filters.collection
      ? shopify.getCollectionProductsFiltered(filters.collection, filters)
      : shopify.getFilteredProducts(filters, plainHome ? 48 : 8),
    hasActiveFilters ? Promise.resolve(null) : shopify.getCollections(),
  ]);

  const fetched = productsResult.products.edges.map((edge) => edge.node);
  const products = plainHome ? sample(fetched, 15) : fetched;
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
