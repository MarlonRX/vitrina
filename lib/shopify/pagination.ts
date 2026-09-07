// S-06 dentro de S-02a06: paginación por `?page=N` (URL compartible).
// S-14n: página de 21 (pedido del usuario; antes 12 → 14 → 21). TODAS las
// consultas paginadas de productos salen de aquí — nunca de un literal.
// S-14o (seguridad de totales): antes, con cursores opacos de Shopify, la
// capa nunca conocía el total de páginas — el componente `Pagination`
// inventaba la ventana de enlaces y esta cambiaba de tamaño al navegar
// (3 → 4 → 3). Ahora TODAS las rutas materializan la lista filtrada/completa
// (la Storefront API de esta tienda entra de sobra en 2 saltos de 250, con
// Data Cache) y el corte de página es local, a partir de un único helper
// `paginate()`. Así `meta.totalCount`/`totalPages` son exactos, la página
// pedida se clampa al rango real y la ventana de enlaces es estable.
import { shopify } from "./index";
import type {
  CollectionWithProducts,
  Edge,
  Product,
  ProductFilters,
} from "./types";

export const PAGE_SIZE = 21;

// Tope duro para enlaces `?page=` manipulados a mano; el clamp real se hace
// contra `totalPages` dentro de `paginate`.
const MAX_PAGE = 25;

export type PageMeta = {
  page: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  /** Total de productos que coinciden con la consulta (exacto). */
  totalCount: number;
  /** ceil(totalCount / PAGE_SIZE); mínimo 1 para no partir de cero. */
  totalPages: number;
};

/** Meta de repuesto para el estado de error de Shopify (0 resultados). */
export function emptyMeta(): PageMeta {
  return {
    page: 1,
    hasPrevPage: false,
    hasNextPage: false,
    totalCount: 0,
    totalPages: 1,
  };
}

export type PagedProducts = {
  products: Product[];
  meta: PageMeta;
};

export function normalizePage(raw: string | string[] | undefined): number {
  const value = Number(Array.isArray(raw) ? raw[0] : raw);
  if (!Number.isFinite(value) || value < 1) return 1;
  return Math.min(Math.floor(value), MAX_PAGE);
}

/**
 * Única fuente de verdad de la paginación: corte local + metadatos exactos.
 * La página pedida se clampa al rango [1, totalPages] para que un `?page=`
 * manipulando a mano nunca deje la grilla vacía con enlaces absurdos.
 */
function paginate(edges: Edge<Product>[], requested: number): PagedProducts {
  const totalCount = edges.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const page = Math.min(Math.max(1, requested), totalPages);
  const start = (page - 1) * PAGE_SIZE;
  return {
    products: edges.slice(start, start + PAGE_SIZE).map((edge) => edge.node),
    meta: {
      page,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      totalCount,
      totalPages,
    },
  };
}

// Filtros neutros para pedir "todo X" cuando solo se quiere la lista base.
const NO_EXTRA_FILTERS: Pick<ProductFilters, "tags" | "options"> = {
  tags: [],
  options: [],
};

export async function getProductsPage(
  filters: ProductFilters,
  page: number,
  buyerIp?: string,
): Promise<PagedProducts> {
  // Colección + filtros: lista completa de la colección filtrada en memoria.
  if (filters.collection) {
    const result = await shopify.getCollectionProductsFiltered(
      filters.collection,
      filters,
      buyerIp,
    );
    return paginate(result.products.edges, page);
  }

  // Catálogo (con o sin búsqueda/orden): lista completa ya filtrada y
  // ordenada POR SHOPIFY en el query (buildSearchQuery + sortKey).
  const result = await shopify.getAllFilteredProducts(filters, buyerIp);
  return paginate(result.products.edges, page);
}

export type PagedCollection = {
  collection: CollectionWithProducts | null;
  paged: PagedProducts;
};

export async function getCollectionPage(
  handle: string,
  page: number,
  buyerIp?: string,
): Promise<PagedCollection> {
  // Meta ligera de la colección + lista completa de sus productos, en
  // paralelo. Antes se sondeaban cursores 1..page-1 (page-1 peticiones);
  // ahora es un solo barrido cacheado y el corte es local.
  const [collectionMeta, result] = await Promise.all([
    shopify.getCollection(handle, buyerIp),
    shopify.getCollectionProductsFiltered(
      handle,
      { ...NO_EXTRA_FILTERS, ...filtersForHandle(handle) },
      buyerIp,
    ),
  ]);

  if (!collectionMeta) {
    return { collection: null, paged: paginate([], page) };
  }

  const paged = paginate(result.products.edges, page);
  const collection: CollectionWithProducts = {
    ...collectionMeta,
    products: {
      edges: result.products.edges,
      pageInfo: {
        hasNextPage: paged.meta.hasNextPage,
        endCursor: null,
      },
    },
  };
  return { collection, paged };
}

function filtersForHandle(handle: string): Pick<ProductFilters, "collection"> {
  return { collection: handle };
}
