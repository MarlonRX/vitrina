import { shopifyQueryRaw } from "./client";
import { mockProviders } from "./mock";
import {
  buildCollectionByHandleQuery,
  buildProductsFacetsQuery,
  buildProductsQuery,
  COLLECTIONS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
} from "./queries/products";
import { buildSearchQuery, matchesFilters, sortProducts } from "./search";
import type {
  CollectionByHandleResult,
  CollectionsResult,
  Product,
  ProductByHandleResult,
  ProductFacets,
  ProductFilters,
  ProductsResult,
} from "./types";

const isMock = () => process.env.SHOPIFY_MOCK === "true";

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

  const options = [...optionsByName.entries()]
    .filter(([, values]) => values.size > 0)
    .map(([name, values]) => ({ name, values: [...values].sort() }))
    .sort((a, b) => a.name.localeCompare(b.name));

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
    first = 12,
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
    first = 12,
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

  async getProduct(
    handle: string,
    buyerIp?: string,
  ): Promise<ProductByHandleResult> {
    if (isMock()) return mockProviders.getProduct(handle);
    return shopifyQueryRaw<ProductByHandleResult>(PRODUCT_BY_HANDLE_QUERY, {
      handle,
    }, buyerIp);
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
      );
      nodes.push(...collections.edges);
      hasNextPage = collections.pageInfo?.hasNextPage ?? false;
      after = collections.pageInfo?.endCursor ?? undefined;
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
    const variables: Record<string, unknown> = { handle, first: 12 };
    if (after) variables.after = after;
    return shopifyQueryRaw<CollectionByHandleResult>(
      buildCollectionByHandleQuery(after),
      variables,
      buyerIp,
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
};
