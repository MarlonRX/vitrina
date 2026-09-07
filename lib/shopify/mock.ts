import { matchesFilters, sortProducts } from "./search";
import type {
  Collection,
  CollectionByHandleResult,
  Product,
  ProductByHandleResult,
  ProductFacets,
  ProductFilters,
  ProductsResult,
  CollectionsResult,
} from "./types";

const image = (url: string, altText: string) => ({
  url,
  altText,
  width: 800,
  height: 800,
});

const mockProducts: Product[] = [
  {
    id: "gid://shopify/Product/1",
    title: "Cerámica Artesanal",
    handle: "ceramica-artesanal",
    description: "Vasija de cerámica hecha a mano.",
    vendor: "Vitrina",
    tags: ["ceramica", "hogar"],
    availableForSale: true,
    priceRange: {
      minVariantPrice: { amount: "45.00", currencyCode: "USD" },
      maxVariantPrice: { amount: "45.00", currencyCode: "USD" },
    },
    featuredImage: image(
      "/mock/ceramica.jpg",
      "Vasija de cerámica artesanal",
    ),
    images: {
      edges: [
        {
          node: image(
            "/mock/ceramica.jpg",
            "Vasija de cerámica artesanal",
          ),
        },
      ],
    },
    options: [{ name: "Color", values: ["Cobre", "Verde"] }],
    collections: {
      edges: [
        {
          node: {
            id: "gid://shopify/Collection/1",
            title: "Hogar",
            handle: "hogar",
          },
        },
      ],
    },
    variants: {
      edges: [
        {
          node: {
            id: "gid://shopify/ProductVariant/1",
            title: "Cobre",
            availableForSale: true,
            price: { amount: "45.00", currencyCode: "USD" },
            compareAtPrice: null,
            selectedOptions: [{ name: "Color", value: "Cobre" }],
            image: image("/mock/ceramica.jpg", "Vasija de cerámica artesanal"),
          },
        },
      ],
    },
  },
  {
    id: "gid://shopify/Product/2",
    title: "Lámpara de Ratán",
    handle: "lampara-de-ratan",
    description: "Lámpara colgante tejida en ratán natural.",
    vendor: "Vitrina",
    tags: ["iluminacion", "hogar"],
    availableForSale: true,
    priceRange: {
      minVariantPrice: { amount: "89.00", currencyCode: "USD" },
      maxVariantPrice: { amount: "89.00", currencyCode: "USD" },
    },
    featuredImage: image("/mock/lampara.jpg", "Lámpara de ratán"),
    images: {
      edges: [
        { node: image("/mock/lampara.jpg", "Lámpara de ratán") },
      ],
    },
    options: [{ name: "Tamaño", values: ["Mediana", "Grande"] }],
    collections: {
      edges: [
        {
          node: {
            id: "gid://shopify/Collection/2",
            title: "Iluminación",
            handle: "iluminacion",
          },
        },
      ],
    },
    variants: {
      edges: [
        {
          node: {
            id: "gid://shopify/ProductVariant/2",
            title: "Mediana",
            availableForSale: true,
            price: { amount: "89.00", currencyCode: "USD" },
            compareAtPrice: null,
            selectedOptions: [{ name: "Tamaño", value: "Mediana" }],
            image: image("/mock/lampara.jpg", "Lámpara de ratán"),
          },
        },
      ],
    },
  },
];

const mockCollections: Collection[] = [
  {
    id: "gid://shopify/Collection/1",
    title: "Hogar",
    handle: "hogar",
    description: "Decoración para tu casa.",
    image: image("/mock/hogar.jpg", "Hogar"),
  },
  {
    id: "gid://shopify/Collection/2",
    title: "Iluminación",
    handle: "iluminacion",
    description: "Luz y ambientes.",
    image: image("/mock/iluminacion.jpg", "Iluminación"),
  },
];

export const mockProviders = {
  async getProducts(): Promise<ProductsResult> {
    return { products: { edges: mockProducts.map((node) => ({ node })), pageInfo: { hasNextPage: false, endCursor: null } } };
  },
  async getFilteredProducts(filters: ProductFilters): Promise<ProductsResult> {
    const sorted = sortProducts(
      mockProducts.filter((p) => matchesFilters(p, filters)),
      filters.sortKey,
      filters.reverse,
    );
    const edges = sorted.map((node) => ({ node }));
    return { products: { edges, pageInfo: { hasNextPage: false, endCursor: null } } };
  },
  async getProduct(handle: string): Promise<ProductByHandleResult> {
    return { product: mockProducts.find((p) => p.handle === handle) ?? null };
  },
  async getCollections(): Promise<CollectionsResult> {
    return {
      collections: {
        edges: mockCollections.map((node) => ({ node })),
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    };
  },
  async getProductFacets(): Promise<ProductFacets> {
    const tags = [...new Set(mockProducts.flatMap((p) => p.tags))].sort();
    const min = Math.min(
      ...mockProducts.map((p) => Number(p.priceRange.minVariantPrice.amount)),
    );
    const max = Math.max(
      ...mockProducts.map((p) => Number(p.priceRange.maxVariantPrice.amount)),
    );
    const optionsMap = new Map<string, Set<string>>();
    for (const product of mockProducts) {
      for (const option of product.options) {
        if (option.name === "Title") continue;
        const values = optionsMap.get(option.name) ?? new Set<string>();
        for (const value of option.values) values.add(value);
        optionsMap.set(option.name, values);
      }
    }
    const options = [...optionsMap.entries()].map(([name, values]) => ({
      name,
      values: [...values].sort(),
    }));
    return { collections: mockCollections, tags, price: { min, max }, options };
  },
  async getCollectionProducts(
    handle: string,
  ): Promise<CollectionByHandleResult> {
    const collection = mockCollections.find((c) => c.handle === handle);
    if (!collection) return { collection: null };
    // S-09 (react-doctor js-combine-iterations): un solo recorrido en lugar
    // de filter().map().
    const edges: { node: Product }[] = [];
    for (const product of mockProducts) {
      if (product.tags.includes(handle)) edges.push({ node: product });
    }
    return {
      collection: {
        ...collection,
        products: {
          edges,
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      },
    };
  },
  async getCollectionProductsFiltered(
    handle: string,
    filters: ProductFilters,
  ): Promise<ProductsResult> {
    const collection = mockCollections.find((c) => c.handle === handle);
    if (!collection) {
      return { products: { edges: [], pageInfo: { hasNextPage: false, endCursor: null } } };
    }
    // S-09 (react-doctor js-combine-iterations): un solo recorrido combinando
    // ambos predicados antes de ordenar.
    const matched: Product[] = [];
    for (const product of mockProducts) {
      if (product.tags.includes(handle) && matchesFilters(product, filters)) {
        matched.push(product);
      }
    }
    const edges = sortProducts(
      matched,
      filters.sortKey,
      filters.reverse,
    ).map((node) => ({ node }));
    return { products: { edges, pageInfo: { hasNextPage: false, endCursor: null } } };
  },
};
