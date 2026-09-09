import { Bar } from "./Bar";
import { SkeletonCard } from "./SkeletonCard";
import { SkeletonFilters } from "./SkeletonFilters";

// ────────────────────────── catálogo / colección ──────────────────────────
// Espejo de ClientProducts y ClientCollectionProducts: breadcrumbs, título,
// grid [300px_1fr] con aside sticky de filtros y ProductGrid full (21 ítems).

const GRID_CARD_COUNT = 21;

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
          {/* S-14q: en móvil el panel se vuelve barra sticky + gaveta; el
              esqueleto imita esa barra para que el salto no mueva el layout. */}
          <div className="skeleton-shimmer h-11 w-full rounded-lg md:hidden" />
          {/* S-14q: espejo de ProductGrid — mismo patrón @container (envoltorio)
              + grid hijo con variantes @min-[Npx], con los MISMOS umbrales,
              para que esqueleto y contenido calculen idénticas columnas. */}
          <div className="@container">
            <div className="grid grid-cols-1 gap-3 @min-[320px]:grid-cols-2 @min-[480px]:gap-4 @min-[520px]:grid-cols-3 @min-[700px]:grid-cols-4 @min-[880px]:grid-cols-5 @min-[1010px]:grid-cols-6 @min-[1150px]:grid-cols-7">
              {Array.from({ length: GRID_CARD_COUNT }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
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
