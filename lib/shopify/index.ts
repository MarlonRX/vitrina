import { REVALIDATE, shopifyQueryRaw, shopifyMutationRaw } from "./client";
import { mockProviders } from "./mock";
import { CART_CREATE_MUTATION } from "./queries/cart";
import {
  buildCollectionByHandleQuery,
  buildProductsFacetsQuery,
  buildProductsQuery,
  buildSitemapProductsQuery,
  COLLECTION_META_QUERY,
  COLLECTIONS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
} from "./queries/products";
import { buildSearchQuery, matchesFilters, sortProducts } from "./search";
import type {
  CartLineInput,
  CartCreateResult,
  CheckoutResult,
  Collection,
  CollectionByHandleResult,
  CollectionMetaResult,
  CollectionsResult,
  Product,
  ProductByHandleResult,
  ProductFacets,
  ProductFilters,
  ProductsResult,
  SitemapProduct,
  SitemapProductsResponse,
} from "./types";

// Modo mock: activado explicitamente o cuando faltan credenciales reales en
// .env/.env.local (S-01: fallback para que el sitio funcione sin Shopify).
// Exportado (S-02a06) porque la capa de paginación por `?page=N` necesita
// saber si puede paginar localmente o debe seguir cursores de Shopify.
export const isMock = () =>
  process.env.SHOPIFY_MOCK === "true" ||
  !process.env.SHOPIFY_STORE_DOMAIN ||
  !process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN;

type FacetProductNode = {
  id: string;
  tags: string[];
  priceRange: {
    minVariantPrice: { amount: string };
    maxVariantPrice: { amount: string };
  };
  options: { name: string; values: string[] }[];
};

type FacetsResponse = {
  products: {
    edges: { node: FacetProductNode }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
};

const MAX_FIRST = 250;

async function fetchAllFacetProducts(buyerIp?: string): Promise<FacetProductNode[]> {
  if (isMock()) return [];
  const nodes: FacetProductNode[] = [];
  let after: string | undefined;
  let hasNextPage = true;

  while (hasNextPage) {
    const variables: Record<string, unknown> = { first: MAX_FIRST };
    if (after) variables.after = after;
    const { products } = await shopifyQueryRaw<FacetsResponse>(
      buildProductsFacetsQuery(after),
      variables,
      buyerIp,
      REVALIDATE.facets,
    );
    nodes.push(...products.edges.map((edge) => edge.node));
    hasNextPage = products.pageInfo.hasNextPage;
    after = products.pageInfo.endCursor ?? undefined;
  }

  return nodes;
}

function aggregateFacets(
  nodes: FacetProductNode[],
  collections: CollectionsResult,
): ProductFacets {
  const tags = new Set<string>();
  let min = Infinity;
  let max = -Infinity;
  const optionsByName = new Map<string, Set<string>>();

  for (const node of nodes) {
    for (const tag of node.tags) tags.add(tag);

    const minAmount = Number(node.priceRange.minVariantPrice.amount);
    const maxAmount = Number(node.priceRange.maxVariantPrice.amount);
    if (Number.isFinite(minAmount)) min = Math.min(min, minAmount);
    if (Number.isFinite(maxAmount)) max = Math.max(max, maxAmount);

    for (const option of node.options) {
      if (option.name === "Title") continue;
      const values = optionsByName.get(option.name) ?? new Set<string>();
      for (const value of option.values) values.add(value);
      optionsByName.set(option.name, values);
    }
  }

  // S-09 (react-doctor js-combine-iterations): era filter().map() sobre la
  // lista de opciones; se recorre una sola vez.
  const options: { name: string; values: string[] }[] = [];
  for (const [name, values] of optionsByName) {
    if (values.size > 0) options.push({ name, values: [...values].sort() });
  }
  options.sort((a, b) => a.name.localeCompare(b.name));

  return {
    collections: collections.collections.edges.map((edge) => edge.node),
    tags: [...tags].sort(),
    price: {
      min: Number.isFinite(min) ? min : 0,
      max: Number.isFinite(max) ? max : 0,
    },
    options,
  };
}

export const shopify = {
  async getProducts(
    query = "",
    // S-14n: página de 14 (antes 12).
    first = 21,
    after?: string,
    buyerIp?: string,
  ): Promise<ProductsResult> {
    if (isMock()) return mockProviders.getProducts();
    const variables: Record<string, unknown> = { query, first };
    if (after) variables.after = after;
    return shopifyQueryRaw<ProductsResult>(
      buildProductsQuery(after),
      variables,
      buyerIp,
    );
  },

  async getFilteredProducts(
    filters: ProductFilters,
    first = 21,
    after?: string,
    buyerIp?: string,
  ): Promise<ProductsResult> {
    if (isMock()) return mockProviders.getFilteredProducts(filters);
    const hasSort = filters.sortKey && filters.sortKey !== "RELEVANCE";
    const variables: Record<string, unknown> = {
      query: buildSearchQuery(filters),
      first,
    };
    if (after) variables.after = after;
    if (hasSort) {
      variables.sortKey = filters.sortKey;
      variables.reverse = filters.reverse ?? false;
    }
    return shopifyQueryRaw<ProductsResult>(
      buildProductsQuery(
        after,
        hasSort ? filters.sortKey : undefined,
        hasSort ? filters.reverse : undefined,
      ),
      variables,
      buyerIp,
    );
  },

  // S-14o: catálogo completo que coincide con la consulta, materializado en
  // barridos de 250 (Data Cache). Base del corte de página local con total
  // EXACTO — reemplaza al sondeo de cursores que hacía fluctuar totalPages.
  // Se filtra/ordena localmente con la misma lógica que las colecciones para
  // que el total responda a lo que la UI muestra, no a lo que Shopify estima.
  async getAllFilteredProducts(
    filters: ProductFilters,
    buyerIp?: string,
  ): Promise<ProductsResult> {
    if (isMock()) return mockProviders.getFilteredProducts(filters);
    const nodes: Product[] = [];
    let after: string | undefined;
    let hasNextPage = true;
    const hasSort = filters.sortKey && filters.sortKey !== "RELEVANCE";

    while (hasNextPage) {
      const variables: Record<string, unknown> = {
        query: buildSearchQuery(filters),
        first: MAX_FIRST,
      };
      if (after) variables.after = after;
      if (hasSort) {
        variables.sortKey = filters.sortKey;
        variables.reverse = filters.reverse ?? false;
      }
      const { products } = await shopifyQueryRaw<ProductsResult>(
        buildProductsQuery(
          after,
          hasSort ? filters.sortKey : undefined,
          hasSort ? filters.reverse : undefined,
        ),
        variables,
        buyerIp,
        REVALIDATE.catalog,
      );
      nodes.push(...products.edges.map((edge) => edge.node));
      hasNextPage = products.pageInfo.hasNextPage;
      after = products.pageInfo.endCursor ?? undefined;
      if (nodes.length >= 1000) break; // red de seguridad, nunca se alcanza aquí
    }

    const matched = nodes.filter((node) => matchesFilters(node, filters));
    const sorted = sortProducts(matched, filters.sortKey, filters.reverse);
    return {
      products: {
        edges: sorted.map((node) => ({ node })),
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    };
  },

  async getProduct(
    handle: string,
    buyerIp?: string,
  ): Promise<ProductByHandleResult> {
    if (isMock()) return mockProviders.getProduct(handle);
    return shopifyQueryRaw<ProductByHandleResult>(PRODUCT_BY_HANDLE_QUERY, {
      handle,
    }, buyerIp, REVALIDATE.product);
  },

  async getCollections(buyerIp?: string): Promise<CollectionsResult> {
    if (isMock()) return mockProviders.getCollections();
    const nodes: CollectionsResult["collections"]["edges"] = [];
    let after: string | undefined;
    let hasNextPage = true;

    while (hasNextPage) {
      const variables: Record<string, unknown> = { first: MAX_FIRST };
      if (after) variables.after = after;
      const { collections } = await shopifyQueryRaw<CollectionsResult>(
        COLLECTIONS_QUERY,
        variables,
        buyerIp,
        REVALIDATE.collection,
      );
      nodes.push(...collections.edges);
      hasNextPage = collections.pageInfo?.hasNextPage ?? false;
      after = collections.pageInfo?.endCursor ?? undefined;
    }

    // S-14c: `frontpage` es el canal interno de Shopify, no una categoría de
    // la vitrina. Se excluye en la fuente: desaparece del listado de
    // colecciones, del menú, de los filtros por facetas y del sitemap.
    for (let i = nodes.length - 1; i >= 0; i--) {
      if (nodes[i].node.handle === "frontpage") nodes.splice(i, 1);
    }

    return {
      collections: {
        edges: nodes,
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    };
  },

  async getProductFacets(buyerIp?: string): Promise<ProductFacets> {
    const [nodes, collections] = await Promise.all([
      fetchAllFacetProducts(buyerIp),
      shopify.getCollections(buyerIp),
    ]);
    return aggregateFacets(nodes, collections);
  },

  async getCollectionProducts(
    handle: string,
    after?: string,
    buyerIp?: string,
  ): Promise<CollectionByHandleResult> {
    if (isMock()) return mockProviders.getCollectionProducts(handle);
    const variables: Record<string, unknown> = { handle, first: 21 };
    if (after) variables.after = after;
    return shopifyQueryRaw<CollectionByHandleResult>(
      buildCollectionByHandleQuery(after),
      variables,
      buyerIp,
      REVALIDATE.collection,
    );
  },

  async getCollectionProductsFiltered(
    handle: string,
    filters: ProductFilters,
    buyerIp?: string,
  ): Promise<ProductsResult> {
    if (isMock()) {
      return mockProviders.getCollectionProductsFiltered(handle, filters);
    }
    const nodes: Product[] = [];
    let after: string | undefined;
    let hasNextPage = true;

    while (hasNextPage) {
      const variables: Record<string, unknown> = { handle, first: MAX_FIRST };
      if (after) variables.after = after;
      const { collection } = await shopifyQueryRaw<CollectionByHandleResult>(
        buildCollectionByHandleQuery(after),
        variables,
        buyerIp,
        REVALIDATE.collection,
      );
      if (!collection) break;
      nodes.push(...collection.products.edges.map((edge) => edge.node));
      hasNextPage = collection.products.pageInfo.hasNextPage;
      after = collection.products.pageInfo.endCursor ?? undefined;
    }

    const matched = nodes.filter((node) => matchesFilters(node, filters));
    const sorted = sortProducts(matched, filters.sortKey, filters.reverse);
    const edges = sorted.map((node) => ({ node }));

    return {
      products: {
        edges,
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    };
  },

  // Primera página de una colección, sin paginar (S-03/S-04: meta y checks).
  async getCollection(
    handle: string,
    buyerIp?: string,
  ): Promise<Collection | null> {
    if (isMock()) {
      const { collection } = await mockProviders.getCollectionProducts(handle);
      if (!collection) return null;
      return {
        id: collection.id,
        title: collection.title,
        handle: collection.handle,
        description: collection.description,
        image: collection.image,
      };
    }
    // Meta de colección ligera (sin productos), query dedicado.
    const { collection } = await shopifyQueryRaw<CollectionMetaResult>(
      COLLECTION_META_QUERY,
      { handle },
      buyerIp,
      REVALIDATE.collection,
    );
    return collection ?? null;
  },

  // Lista ligera de productos para el sitemap (S-04): solo handle + imagen.
  async getSitemapProducts(buyerIp?: string): Promise<SitemapProduct[]> {
    if (isMock()) {
      const { products } = await mockProviders.getProducts();
      return products.edges.map(({ node }) => ({
        handle: node.handle,
        featuredImage: node.featuredImage
          ? { url: node.featuredImage.url }
          : null,
      }));
    }
    const items: SitemapProduct[] = [];
    let after: string | undefined;
    let hasNextPage = true;

    while (hasNextPage) {
      const variables: Record<string, unknown> = { first: MAX_FIRST };
      if (after) variables.after = after;
      const { products } = await shopifyQueryRaw<SitemapProductsResponse>(
        buildSitemapProductsQuery(after),
        variables,
        buyerIp,
        REVALIDATE.sitemap,
      );
      items.push(
        ...products.edges.map((edge) => ({
          handle: edge.node.handle,
          featuredImage: edge.node.featuredImage ?? null,
        })),
      );
      hasNextPage = products.pageInfo.hasNextPage;
      after = products.pageInfo.endCursor ?? undefined;
    }

    return items;
  },

  // Lista ligera de colecciones para el sitemap (S-04).
  async getSitemapCollections(buyerIp?: string): Promise<string[]> {
    const { collections } = await shopify.getCollections(buyerIp);
    return collections.edges.map((edge) => edge.node.handle);
  },

  // S-01: crea un Shopify Cart Checkout con las líneas del carrito y devuelve su
  // checkoutUrl (en API 2026-07 `cartCheckoutCreate` ya no existe: `cartCreate`
  // es el equivalente y expone `cart.checkoutUrl`). En modo mock (sin
  // credenciales o SHOPIFY_MOCK=true) devuelve mock:true sin llamar a Shopify.
  async createCartCheckout(
    lines: CartLineInput[],
    buyerIp?: string,
  ): Promise<CheckoutResult> {
    if (isMock()) {
      return { checkoutUrl: null, mock: true, userErrors: [] };
    }

    const { cartCreate } = await shopifyMutationRaw<CartCreateResult>(
      CART_CREATE_MUTATION,
      {
        input: {
          lines,
          buyerIdentity: {},
        },
      },
      buyerIp,
    );

    return {
      checkoutUrl: cartCreate.cart?.checkoutUrl ?? null,
      mock: false,
      userErrors: cartCreate.userErrors ?? [],
    };
  },
};
