import { Bar } from "./Bar";

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
