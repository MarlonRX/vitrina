import { Bar } from "./Bar";

// Aside de filtros espejo del panel real (sticky, 4 grupos), usado por GridSkeleton.
export function SkeletonFilters() {
  return (
    <aside
      aria-hidden
      className="sticky top-24 hidden max-h-[calc(100dvh-7rem)] min-h-0 flex-col gap-4 self-start rounded-lg border border-(--border-primary) bg-(--bg-surface) p-4 md:flex"
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
