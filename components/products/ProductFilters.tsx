"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { ProductFacets, ProductFilters } from "@/lib/shopify/types";
import { Button } from "@/components/ui/button";

type ProductFiltersProps = {
  facets: ProductFacets;
  filters: ProductFilters;
};

export default function ProductFiltersForm({
  facets,
  filters,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTags = new Set(filters.tags);
  const activeOptions = new Set(
    filters.options.map((o) => `${o.name}:${o.value}`),
  );
  const sortValue = `${filters.sortKey ?? "RELEVANCE"}:${filters.reverse ? "1" : "0"}`;
  const hasActiveFilters =
    !!filters.search ||
    !!filters.collection ||
    filters.tags.length > 0 ||
    filters.minPrice != null ||
    filters.maxPrice != null ||
    filters.options.length > 0;

  function applyFilters(formData: FormData) {
    const params = new URLSearchParams();

    const collection = formData.get("collection") as string | null;
    if (collection) params.set("collection", collection);

    const sort = formData.get("sort") as string | null;
    if (sort) params.set("sort", sort);

    const tags = formData.getAll("tag") as string[];
    tags.forEach((t) => params.append("tag", t));

    const options = formData.getAll("option") as string[];
    options.forEach((o) => params.append("option", o));

    const minPrice = formData.get("minPrice") as string | null;
    if (minPrice) params.set("minPrice", minPrice);

    const maxPrice = formData.get("maxPrice") as string | null;
    if (maxPrice) params.set("maxPrice", maxPrice);

    router.push(`/?${params.toString()}`);
    router.refresh();
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    applyFilters(new FormData(e.currentTarget));
  }

  function clearFilters() {
    router.push("/");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 border border-(--border-primary) bg-(--bg-surface) p-4"
    >
      <div className="flex flex-col gap-1">
        <label
          htmlFor="filter-collection"
          className="text-sm text-(--text-secondary)"
        >
          Categorías
        </label>
        <select
          id="filter-collection"
          name="collection"
          defaultValue={filters.collection ?? ""}
          className="h-9 border border-(--border-primary) bg-(--bg-surface) px-2 text-sm"
        >
          <option value="">Todas las colecciones</option>
          {facets.collections.map((collection) => (
            <option key={collection.id} value={collection.handle}>
              {collection.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="filter-sort"
          className="text-sm text-(--text-secondary)"
        >
          Ordenar por
        </label>
        <select
          id="filter-sort"
          name="sort"
          defaultValue={sortValue}
          className="h-9 border border-(--border-primary) bg-(--bg-surface) px-2 text-sm"
        >
          <option value="RELEVANCE:0">Relevancia</option>
          <option value="PRICE:0">Precio: menor a mayor</option>
          <option value="PRICE:1">Precio: mayor a menor</option>
          <option value="TITLE:0">Título (A-Z)</option>
          <option value="TITLE:1">Título (Z-A)</option>
          <option value="CREATED_AT:1">Más recientes</option>
          <option value="BEST_SELLING:0">Más vendidos</option>
        </select>
      </div>

      {facets.tags.length > 0 && (
        <fieldset className="flex flex-col gap-1">
          <legend className="text-sm text-(--text-secondary)">Tags</legend>
          {facets.tags.map((tag) => (
            <label key={tag} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="tag"
                value={tag}
                defaultChecked={activeTags.has(tag)}
              />
              {tag}
            </label>
          ))}
        </fieldset>
      )}

      <fieldset className="flex flex-col gap-1">
        <legend className="text-sm text-(--text-secondary)">
          Rango de precio
        </legend>
        <div className="flex items-center gap-2">
          <input
            type="number"
            name="minPrice"
            aria-label="Precio mínimo"
            placeholder={String(facets.price.min)}
            min={facets.price.min}
            max={facets.price.max}
            step="0.01"
            defaultValue={filters.minPrice ?? ""}
            className="h-9 w-full min-w-0 border border-(--border-primary) bg-(--bg-surface) px-2 text-sm"
          />
          <span className="text-(--text-secondary)">-</span>
          <input
            type="number"
            name="maxPrice"
            aria-label="Precio máximo"
            placeholder={String(facets.price.max)}
            min={facets.price.min}
            max={facets.price.max}
            step="0.01"
            defaultValue={filters.maxPrice ?? ""}
            className="h-9 w-full min-w-0 border border-(--border-primary) bg-(--bg-surface) px-2 text-sm"
          />
        </div>
      </fieldset>

      {facets.options.map((option) => (
        <fieldset key={option.name} className="flex flex-col gap-1">
          <legend className="text-sm text-(--text-secondary)">
            {option.name}
          </legend>
          {option.values.map((value) => {
            const key = `${option.name}:${value}`;
            return (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="option"
                  value={key}
                  defaultChecked={activeOptions.has(key)}
                />
                {value}
              </label>
            );
          })}
        </fieldset>
      ))}

      <div className="flex items-center gap-2">
        <Button type="submit" className="flex-1">
          Aplicar filtros
        </Button>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-(--text-secondary) underline"
          >
            Limpiar
          </button>
        )}
      </div>
    </form>
  );
}
