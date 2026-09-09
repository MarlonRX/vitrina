import { Bar } from "./Bar";

// Ficha espejo de ProductCard (imagen + título + precio) usada por GridSkeleton.
export function SkeletonCard() {
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
