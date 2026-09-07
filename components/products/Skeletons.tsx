// S-14p: familia de esqueletos por módulo — cada uno es espejo estructural
// del layout REAL de su ruta (mismos contenedores, columnas y proporciones),
// para que el paso de carga a contenido no mueva nada.
//
//  <GridSkeleton/>          → /products y /collections/[handle] (filtros + grilla)
//  <ProductDetailSkeleton/> → /products/[handle] (galería + compra)
//  <CollectionsSkeleton/>   → /collections (tarjetas 4:3)

const bar = "skeleton-shimmer rounded-full";

function Bar({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return <div aria-hidden className={`${bar} ${className}`} style={style} />;
}

// ────────────────────────── catálogo / colección ──────────────────────────
// Espejo de ClientProducts y ClientCollectionProducts: breadcrumbs, título,
// grid [300px_1fr] con aside sticky de filtros y ProductGrid full (21 ítems).

const GRID_CARD_COUNT = 21;

function SkeletonCard() {
  return (
    <div className="flex w-full flex-col gap-3 overflow-hidden border border-(--border-primary) bg-(--bg-surface) p-3 rounded-xs">
      <div className="skeleton-shimmer aspect-square w-full rounded-xs" />
      <Bar className="h-3.5 w-3/4" />
      <div className="flex items-center justify-between">
        <Bar className="h-3.5 w-14" />
        <Bar className="h-3.5 w-10" />
      </div>
    </div>
  );
}

function SkeletonFilters() {
  return (
    <aside
      aria-hidden
      className="sticky top-24 flex max-h-[calc(100dvh-7rem)] min-h-0 flex-col gap-4 self-start rounded-lg border border-(--border-primary) bg-(--bg-surface) p-4"
    >
      <div className="flex items-baseline justify-between">
        <Bar className="h-4 w-20" />
        <Bar className="h-4 w-10" />
      </div>
      {Array.from({ length: 4 }).map((_, group) => (
        <div key={group} className="flex flex-col gap-2.5">
          <Bar className="h-3 w-24" />
          {Array.from({ length: 3 }).map((__, line) => (
            <Bar key={line} className="h-3" style={{ width: `${72 - line * 14}%` }} />
          ))}
        </div>
      ))}
    </aside>
  );
}

export function GridSkeleton({ centered = false }: { centered?: boolean }) {
  return (
    <div className="flex flex-col gap-6">
      <div
        className={
          centered
            ? "flex flex-col items-center gap-2 text-center"
            : "flex flex-col gap-2"
        }
      >
        <Bar className="h-3.5 w-40" />
        <Bar className="h-7 w-56 rounded-md" />
        {centered && <Bar className="h-4 w-72 max-w-full opacity-70" />}
      </div>

      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        <SkeletonFilters />
        <div className="flex min-w-0 flex-col gap-6">
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
            {Array.from({ length: GRID_CARD_COUNT }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="skeleton-shimmer h-9 w-9 rounded-sm" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────── detalle de producto ──────────────────────────
// Espejo de VariantViewer: grid md:grid-cols-2 → a la izquierda la galería
// (imagen cuadrada + ristra de miniaturas) y a la derecha título, vendor,
// selectores de opción, precio, cantidad + CTA, y descripción abajo.
const DETAIL_THUMBS = 5;

export function ProductDetailSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-8">
      <Bar className="h-3.5 w-64 max-w-full" />

      <div className="grid gap-8 md:grid-cols-2">
        {/* Galería */}
        <div className="flex flex-col gap-2">
          <div className="skeleton-shimmer aspect-square w-full rounded-xs" />
          <div className="flex gap-2">
            {Array.from({ length: DETAIL_THUMBS }).map((_, index) => (
              <div
                key={index}
                className="skeleton-shimmer h-16 w-16 rounded-md"
              />
            ))}
          </div>
        </div>

        {/* Compra */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Bar className="h-9 w-3/5 rounded-md" />
            <Bar className="h-4 w-32 opacity-70" />
          </div>
          {Array.from({ length: 2 }).map((_, option) => (
            <div key={option} className="flex flex-col gap-1.5">
              <Bar className="h-3 w-16" />
              <div className="skeleton-shimmer h-10 w-full rounded-md" />
            </div>
          ))}
          <Bar className="h-6 w-24" />
          <div className="flex items-center gap-3">
            <div className="skeleton-shimmer h-10 w-28 rounded-md" />
            <div className="skeleton-shimmer h-10 flex-1 rounded-md" />
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Bar className="h-4 w-20" />
            <Bar className="h-3.5 w-full max-w-prose opacity-70" />
            <Bar className="h-3.5 w-11/12 max-w-prose opacity-70" />
            <Bar className="h-3.5 w-3/4 max-w-prose opacity-70" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────── listado de colecciones ──────────────────────────
// Espejo de ClientCollections: encabezado centrado + grilla max-w-5xl de
// tarjetas 4:3 (2 columnas móvil, 3 escritorio) con renglón de título.
const COLLECTION_CARDS = 6;

export function CollectionsSkeleton() {
  return (
    <div aria-hidden className="flex flex-col items-center gap-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <Bar className="h-3.5 w-36" />
        <Bar className="h-9 w-56 rounded-md" />
        <Bar className="h-4 w-80 max-w-full opacity-70" />
      </div>
      <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-4 md:grid-cols-3">
        {Array.from({ length: COLLECTION_CARDS }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col gap-1 overflow-hidden border border-(--border-primary) bg-(--bg-surface)"
          >
            <div className="skeleton-shimmer aspect-[4/3] w-full" />
            <div className="flex items-center justify-between px-3 py-2.5">
              <Bar className="h-4 w-2/3" />
              <Bar className="h-3 w-8 opacity-70" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
