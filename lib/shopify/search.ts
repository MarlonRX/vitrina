import type { Product, ProductFilters, ProductSortKey, SelectedOption } from "./types";

const toArray = (v: string | string[] | undefined): string[] => {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
};

const toNumber = (v: string | string[] | undefined): number | undefined => {
  const raw = Array.isArray(v) ? v[0] : v;
  if (raw == null || raw === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
};

const SORT_KEYS: ProductSortKey[] = [
  "RELEVANCE",
  "BEST_SELLING",
  "CREATED_AT",
  "PRICE",
  "TITLE",
];

function toSortKey(v: string | string[] | undefined): ProductSortKey {
  const raw = Array.isArray(v) ? v[0] : v;
  if (raw == null) return "RELEVANCE";
  const key = raw.split(":")[0];
  return SORT_KEYS.includes(key as ProductSortKey)
    ? (key as ProductSortKey)
    : "RELEVANCE";
}

function toReverse(v: string | string[] | undefined): boolean {
  const raw = Array.isArray(v) ? v[0] : v;
  if (raw == null) return false;
  return raw.endsWith(":1") || raw === "1";
}

export function parseFilters(
  params: Record<string, string | string[] | undefined>,
): ProductFilters {
  const search = toArray(params.q)[0] ?? "";
  const collection = toArray(params.collection)[0] ?? "";
  const tags = toArray(params.tag).map((t) => t.trim()).filter(Boolean);
  const minPrice = toNumber(params.minPrice);
  const maxPrice = toNumber(params.maxPrice);
  const sortKey = toSortKey(params.sort);
  const reverse = toReverse(params.sort);
  const options = toArray(params.option)
    .map((entry) => {
      const idx = entry.indexOf(":");
      if (idx <= 0) return null;
      const name = entry.slice(0, idx);
      const value = entry.slice(idx + 1);
      return { name, value };
    })
    .filter((o): o is SelectedOption => o !== null);

  return {
    search: search || undefined,
    collection: collection || undefined,
    tags,
    minPrice,
    maxPrice,
    options,
    sortKey,
    reverse,
  };
}

export function serializeFilters(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search) params.set("q", filters.search);
  if (filters.collection) params.set("collection", filters.collection);
  for (const tag of filters.tags) params.append("tag", tag);
  if (filters.minPrice != null) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice != null) params.set("maxPrice", String(filters.maxPrice));
  for (const option of filters.options) {
    params.append("option", `${option.name}:${option.value}`);
  }
  if (filters.sortKey && filters.sortKey !== "RELEVANCE") {
    params.set("sort", `${filters.sortKey}:${filters.reverse ? "1" : "0"}`);
  }
  return params;
}

const escapeTerm = (value: string): string =>
  value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

function minPriceOf(product: Product): number {
  return Math.min(
    ...product.variants.edges.map((edge) => Number(edge.node.price.amount)),
  );
}

export function sortProducts(
  products: Product[],
  sortKey?: ProductFilters["sortKey"],
  reverse = false,
): Product[] {
  if (!sortKey || sortKey === "RELEVANCE") return products;

  const sorted = [...products].sort((a, b) => {
    if (sortKey === "PRICE") return minPriceOf(a) - minPriceOf(b);
    if (sortKey === "TITLE") return a.title.localeCompare(b.title);
    if (sortKey === "CREATED_AT") return a.id.localeCompare(b.id);
    return 0;
  });

  return reverse ? sorted.reverse() : sorted;
}

export function buildSearchQuery(filters: ProductFilters): string {
  const parts: string[] = [];

  if (filters.search?.trim()) {
    parts.push(filters.search.trim());
  }

  if (filters.tags.length > 0) {
    const inner = filters.tags.map((t) => `tag:${t}`).join(" OR ");
    parts.push(filters.tags.length > 1 ? `(${inner})` : inner);
  }

  if (filters.minPrice != null) {
    parts.push(`variants.price:>=${filters.minPrice}`);
  }
  if (filters.maxPrice != null) {
    parts.push(`variants.price:<=${filters.maxPrice}`);
  }

  const byOption = new Map<string, string[]>();
  for (const option of filters.options) {
    const list = byOption.get(option.name) ?? [];
    list.push(option.value);
    byOption.set(option.name, list);
  }
  for (const values of byOption.values()) {
    const inner = values
      .map((v) => `variant:title:"${escapeTerm(v)}"`)
      .join(" OR ");
    parts.push(values.length > 1 ? `(${inner})` : inner);
  }

  return parts.join(" AND ");
}

export function matchesFilters(
  product: Product,
  filters: ProductFilters,
): boolean {
  if (filters.search?.trim()) {
    const needle = filters.search.trim().toLowerCase();
    const haystack = [
      product.title,
      product.description,
      product.vendor,
      ...product.tags,
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(needle)) return false;
  }

  if (filters.tags.length > 0) {
    const tags = new Set(product.tags);
    if (!filters.tags.some((t) => tags.has(t))) return false;
  }

  if (filters.minPrice != null || filters.maxPrice != null) {
    const variants = product.variants.edges.map((edge) => edge.node);
    if (variants.length === 0) return false;
    const prices = variants.map((v) => Number(v.price.amount));
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (filters.minPrice != null && max < filters.minPrice) return false;
    if (filters.maxPrice != null && min > filters.maxPrice) return false;
  }

  for (const option of filters.options) {
    const values = new Set(
      product.variants.edges.flatMap((edge) =>
        edge.node.selectedOptions
          .filter((o) => o.name === option.name)
          .map((o) => o.value),
      ),
    );
    if (!values.has(option.value)) return false;
  }

  return true;
}
