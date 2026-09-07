export type Money = {
  amount: string;
  currencyCode: string;
};

export type Image = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

export type SelectedOption = {
  name: string;
  value: string;
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  compareAtPrice: Money | null;
  selectedOptions: SelectedOption[];
  image: Image | null;
};

export type PriceRange = {
  minVariantPrice: Money;
  maxVariantPrice: Money;
};

export type ProductOption = {
  name: string;
  values: string[];
};

export type Product = {
  id: string;
  title: string;
  handle: string;
  description: string;
  vendor: string;
  tags: string[];
  availableForSale: boolean;
  priceRange: PriceRange;
  featuredImage: Image | null;
  images: { edges: { node: Image }[] };
  options: ProductOption[];
  // Referencia ligera a colecciones (S-02a06: breadcrumbs en detalle).
  collections: { edges: { node: CollectionRef }[] };
  variants: { edges: { node: ProductVariant }[] };
};

export type CollectionRef = {
  id: string;
  title: string;
  handle: string;
};

export type Collection = {
  id: string;
  title: string;
  handle: string;
  description: string;
  image: Image | null;
};

export type Edge<T> = { node: T };
export type Connection<T> = { edges: Edge<T>[] };

export type PageInfo = { hasNextPage: boolean; endCursor: string | null };

export type ProductsResult = {
  products: Connection<Product> & { pageInfo: PageInfo };
};

export type ProductByHandleResult = {
  product: Product | null;
};

export type CollectionsResult = {
  collections: Connection<Collection> & { pageInfo: PageInfo };
};

export type CollectionWithProducts = Collection & {
  products: Connection<Product> & { pageInfo: PageInfo };
};

export type CollectionByHandleResult = {
  collection: CollectionWithProducts | null;
};

export type CollectionMetaResult = {
  collection: Collection | null;
};

export type SitemapProduct = {
  handle: string;
  featuredImage: { url: string } | null;
};

export type SitemapProductsResponse = {
  products: {
    edges: { node: SitemapProduct }[];
    pageInfo: PageInfo;
  };
};

export type FacetOption = {
  name: string;
  values: string[];
};

export type ProductSortKey =
  | "RELEVANCE"
  | "BEST_SELLING"
  | "CREATED_AT"
  | "PRICE"
  | "TITLE";

export type ProductFilters = {
  search?: string;
  collection?: string;
  tags: string[];
  minPrice?: number;
  maxPrice?: number;
  options: SelectedOption[];
  sortKey?: ProductSortKey;
  reverse?: boolean;
};

export type ProductFacets = {
  collections: Collection[];
  tags: string[];
  price: { min: number; max: number };
  options: FacetOption[];
};

export type ProductFacetsResult = {
  facets: ProductFacets;
};

// --- Checkout real de Shopify (S-01) ---

export type CartLineInput = {
  merchandiseId: string;
  quantity: number;
};

export type CartUserError = {
  field: string[] | null;
  message: string;
};

export type CartCreateResult = {
  cartCreate: {
    cart: {
      id: string;
      checkoutUrl: string;
    } | null;
    userErrors: CartUserError[];
  };
};

export type CheckoutResult = {
  checkoutUrl: string | null;
  mock: boolean;
  userErrors: CartUserError[];
};
