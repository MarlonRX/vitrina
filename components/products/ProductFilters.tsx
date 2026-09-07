"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ProductFacets, ProductFilters } from "@/lib/shopify/types";
import MyButton from "@/components/UIComponents/MyButton";
import { MyCheckbox } from "@/components/UIComponents/MyCheckbox";
import { MyInput } from "@/components/UIComponents/MyInput";
import { MySelect } from "@/components/UIComponents/MySelect";

// S-11 (sistema de diseño) + S-13 (catálogo masivo): con ~250 productos las
// facetas crecieron muchísimo, así que el panel se rediseñó:
// - botón "Aplicar filtros" FIJO arriba del panel (nunca perseguirlo),
// - grupos de categorías/tags/opciones muestran máx. 5 opciones con "Ver más",
// - el cuerpo del panel hace scroll interno (max-h) en desktop, pegajoso al
//   top: el aside nunca estira la página ni produce overflow eterno.

const SORT_OPTIONS = [
  { value: "RELEVANCE:0", label: "Relevancia" },
  { value: "PRICE:0", label: "Precio: menor a mayor" },
  { value: "PRICE:1", label: "Precio: mayor a menor" },
  { value: "TITLE:0", label: "Título (A-Z)" },
  { value: "TITLE:1", label: "Título (Z-A)" },
  { value: "CREATED_AT:1", label: "Más recientes" },
  { value: "BEST_SELLING:0", label: "Más vendidos" },
];

const GROUP_LEGEND =
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-(--text-secondary)";

const COLLAPSED_LIMIT = 5;

/** Lista de opciones que se corta en 5 y ofrece "Ver más"/"Ver menos". */
function Collapsible({
  hiddenCount,
  collapsed,
  onToggle,
  children,
}: {
  hiddenCount: number;
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!collapsed}
          className="self-start text-xs font-medium text-(--accent-primary) hover:underline focus-visible:outline-2 focus-visible:outline-(--accent-primary)"
        >
          {collapsed ? `Ver más (${hiddenCount})` : "Ver menos"}
        </button>
      )}
    </>
  );
}

function useCapped(count: number, selectedIndex = -1) {
  const [open, setOpen] = useState(false);
  // Con 5 visibles, el índice seleccionado (si lo hay) también se muestra,
  // así que reduce en uno los ocultos del contador.
  const hidden = open
    ? 0
    : Math.max(0, count - COLLAPSED_LIMIT - (selectedIndex >= COLLAPSED_LIMIT ? 1 : 0));
  return {
    open,
    collapsed: !open,
    hidden,
    toggle: () => setOpen((v) => !v),
    visible: (i: number) => open || i < COLLAPSED_LIMIT || i === selectedIndex,
  };
}

type ProductFiltersProps = {
  facets: ProductFacets;
  filters: ProductFilters;
};

export default function ProductFiltersForm({
  facets,
  filters,
}: ProductFiltersProps) {
  const router = useRouter();
  // S-15: "Aplicar" navega sobre la ruta ACTUAL (/, /products,
  // /collections/[handle]) en vez de / hardcodeado — los filtros se combinan
  // sobre cualquier búsqueda/colección sin salir de ella.
  const pathname = usePathname();
  const onCollection = /^\/collections\/([^/?#]+)/.exec(pathname);

  // S-13: la búsqueda puede llegar por URL (q=…); el campo vive DENTRO del
  // panel para poder filtrar sobre cualquier consulta (filtros mixtos).
  const activeTags = new Set(filters.tags);
  const activeOptions = new Set(
    filters.options.map((o) => `${o.name}:${o.value}`),
  );
  const sortValue = `${filters.sortKey ?? "RELEVANCE"}:${filters.reverse ? "1" : "0"}`;
  const activeCount =
    Number(!!filters.collection) +
    Number(!!filters.search) +
    filters.tags.length +
    filters.options.length +
    Number(filters.minPrice != null || filters.maxPrice != null);

  const cats = useCapped(
    facets.collections.length,
    filters.collection
      ? facets.collections.findIndex((c) => c.handle === filters.collection)
      : -1,
  );
  const selectedTagIdx = facets.tags
    .map((t, i) => (activeTags.has(t) ? i : -1))
    .find((i) => i >= 0);
  const tags = useCapped(facets.tags.length, selectedTagIdx ?? -1);

  function applyFilters(formData: FormData) {
    const params = new URLSearchParams();

    const q = (formData.get("q") as string | null)?.trim();
    if (q) params.set("q", q);

    const collection = formData.get("collection") as string | null;
    // S-15: en /collections/[handle] la categoría de la ruta es el default;
    // elegir la MISMA conserva la vista de colección, elegir otra (o "todas")
    // sale al catálogo general con el resto de filtros intactos.
    let target = pathname;
    if (onCollection) {
      if (collection && collection !== onCollection[1]) {
        params.set("collection", collection);
        target = "/products";
      } else if (!collection) {
        target = "/products";
      }
    } else if (collection) {
      params.set("collection", collection);
    }

    const sort = formData.get("sort") as string | null;
    if (sort) params.set("sort", sort);

    const tagsSel = formData.getAll("tag") as string[];
    tagsSel.forEach((t) => params.append("tag", t));

    const options = formData.getAll("option") as string[];
    options.forEach((o) => params.append("option", o));

    const minPrice = formData.get("minPrice") as string | null;
    if (minPrice) params.set("minPrice", minPrice);

    const maxPrice = formData.get("maxPrice") as string | null;
    if (maxPrice) params.set("maxPrice", maxPrice);

    const qs = params.toString();
    router.push(qs ? `${target}?${qs}` : target);
    router.refresh();
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    applyFilters(new FormData(e.currentTarget));
  }

  function clearFilters() {
    router.push(pathname);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="sticky top-24 flex max-h-[calc(100dvh-7rem)] min-h-0 flex-col rounded-lg border border-(--border-primary) bg-(--bg-surface) p-4"
    >
      {/* Cabecera fija del panel: acción principal siempre a mano */}
      <div className="flex flex-col gap-3 pb-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em]">
            Filtros
          </h2>
          {activeCount > 0 && (
            <span className="rounded-full bg-(--accent-primary) px-2 py-0.5 text-[11px] font-semibold text-white">
              {activeCount} {activeCount === 1 ? "activo" : "activos"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <MyButton type="submit" className="flex-1">
            Aplicar filtros
          </MyButton>
          {activeCount > 0 && (
            <MyButton
              variant="link"
              color="neutral"
              type="button"
              onClick={clearFilters}
              className="shrink-0 text-(--text-secondary)"
            >
              Limpiar
            </MyButton>
          )}
        </div>
        <MyInput
          type="search"
          name="q"
          aria-label="Buscar en el catálogo"
          placeholder="Buscar en el catálogo…"
          defaultValue={filters.search ?? ""}
        />
      </div>

      {/* Cuerpo con scroll interno: el aside no estira la página */}
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain pr-1">
        <fieldset className="flex flex-col gap-2.5">
          <legend className={GROUP_LEGEND}>Categorías</legend>
          <MyCheckbox
            type="radio"
            name="collection"
            value=""
            defaultChecked={!filters.collection}
            label="Todas las colecciones"
          />
          <Collapsible
            hiddenCount={cats.hidden}
            collapsed={cats.collapsed}
            onToggle={cats.toggle}
          >
            {facets.collections.map((collection, i) =>
              cats.visible(i) ? (
                <MyCheckbox
                  key={collection.handle}
                  type="radio"
                  name="collection"
                  value={collection.handle}
                  defaultChecked={filters.collection === collection.handle}
                  label={collection.title}
                />
              ) : null,
            )}
          </Collapsible>
        </fieldset>

        <MySelect
          label="Ordenar por"
          name="sort"
          defaultValue={sortValue}
          options={SORT_OPTIONS}
        />

        {facets.tags.length > 0 && (
          <fieldset className="flex flex-col gap-2.5">
            <legend className={GROUP_LEGEND}>Tags</legend>
            <Collapsible
              hiddenCount={tags.hidden}
              collapsed={tags.collapsed}
              onToggle={tags.toggle}
            >
              {facets.tags.map((tag, i) =>
                tags.visible(i) ? (
                  <MyCheckbox
                    key={tag}
                    id={`tag-${tag}`}
                    name="tag"
                    value={tag}
                    defaultChecked={activeTags.has(tag)}
                    label={tag}
                  />
                ) : null,
              )}
            </Collapsible>
          </fieldset>
        )}

        <fieldset className="flex flex-col gap-2">
          <legend className={GROUP_LEGEND}>Rango de precio</legend>
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <MyInput
                type="number"
                name="minPrice"
                aria-label="Precio mínimo"
                placeholder={String(facets.price.min)}
                min={facets.price.min}
                max={facets.price.max}
                step="0.01"
                defaultValue={filters.minPrice ?? ""}
              />
            </div>
            <span aria-hidden className="text-(--text-tertiary)">
              —
            </span>
            <div className="min-w-0 flex-1">
              <MyInput
                type="number"
                name="maxPrice"
                aria-label="Precio máximo"
                placeholder={String(facets.price.max)}
                min={facets.price.min}
                max={facets.price.max}
                step="0.01"
                defaultValue={filters.maxPrice ?? ""}
              />
            </div>
          </div>
        </fieldset>

        {facets.options.map((option) => (
          <OptionGroup
            key={option.name}
            name={option.name}
            values={option.values}
            selected={activeOptions}
          />
        ))}
      </div>
    </form>
  );
}

/** Grupo de una opción (Color, Vidriado…) también limitado a 5 valores. */
function OptionGroup({
  name,
  values,
  selected,
}: {
  name: string;
  values: string[];
  selected: Set<string>;
}) {
  const cap = useCapped(values.length, values.findIndex((v) => selected.has(`${name}:${v}`)));
  return (
    <fieldset className="flex flex-col gap-2.5">
      <legend className={GROUP_LEGEND}>{name}</legend>
      <Collapsible
        hiddenCount={cap.hidden}
        collapsed={cap.collapsed}
        onToggle={cap.toggle}
      >
        {values.map((value, i) => {
          const key = `${name}:${value}`;
          return cap.visible(i) ? (
            <MyCheckbox
              key={key}
              name="option"
              value={key}
              defaultChecked={selected.has(key)}
              label={value}
            />
          ) : null;
        })}
      </Collapsible>
    </fieldset>
  );
}
