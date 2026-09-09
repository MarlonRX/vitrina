import { Bar } from "./Bar";

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
      {/* S-14q: espejo de ClientCollections — @container en el envoltorio,
          grid en el hijo (una consulta nunca se resuelve contra sí misma). */}
      <div className="@container mx-auto w-full max-w-5xl">
        <div className="grid grid-cols-2 gap-4 @min-[640px]:grid-cols-3">
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
    </div>
  );
}
