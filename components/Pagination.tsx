import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PageMeta } from "@/lib/shopify/pagination";

// S-06 dentro de S-02a06: paginación por enlaces `?page=N` (compartibles).
// S-14o: `meta.totalPages` ahora es EXACTO (corte local en pagination.ts),
// así que la ventana de enlaces es determinista: ya no fluctúa 3→4→3 al
// cambiar de página. `hrefFor` construye la URL conservando filtros/orden.
interface PaginationProps {
  meta: PageMeta;
  hrefFor: (page: number) => string;
  className?: string;
}

const linkBase =
  "inline-flex h-9 min-w-9 items-center justify-center gap-1 border px-2 text-sm transition-colors";
const linkIdle =
  "border-(--border-primary) bg-(--bg-surface) text-(--text-primary) hover:border-(--accent-primary)/50";
const linkActive =
  "border-(--accent-primary) bg-(--accent-primary) text-(--text-inverted)";

function pageWindow(current: number, totalPages: number): number[] {
  // Ventana fija de 5 números anclada a [1, totalPages]; el anclaje depende
  // SOLO de (current, totalPages), nunca de flags de cursores.
  const span = Math.min(5, totalPages);
  const start = Math.max(1, Math.min(current - 2, totalPages - span + 1));
  const pages: number[] = [];
  for (let p = start; p < start + span; p += 1) pages.push(p);
  return pages;
}

export default function Pagination({
  meta,
  hrefFor,
  className,
}: PaginationProps) {
  const { page, hasPrevPage, hasNextPage, totalPages } = meta;
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Paginación"
      className={cn("flex items-center gap-2", className)}
    >
      {hasPrevPage ? (
        <Link
          href={hrefFor(page - 1)}
          aria-label="Página anterior"
          className={cn(linkBase, linkIdle)}
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Anterior</span>
        </Link>
      ) : (
        <span
          aria-hidden
          className={cn(linkBase, linkIdle, "pointer-events-none opacity-40")}
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Anterior</span>
        </span>
      )}

      <ol className="flex items-center gap-1">
        {pageWindow(page, totalPages).map((p) =>
          p === page ? (
            <li key={p}>
              <span aria-current="page" className={cn(linkBase, linkActive)}>
                {p}
              </span>
            </li>
          ) : (
            <li key={p}>
              <Link href={hrefFor(p)} className={cn(linkBase, linkIdle)} aria-label={`Ir a la página ${p}`}>
                {p}
              </Link>
            </li>
          ),
        )}
      </ol>

      {hasNextPage ? (
        <Link
          href={hrefFor(page + 1)}
          aria-label="Página siguiente"
          className={cn(linkBase, linkIdle)}
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight size={16} />
        </Link>
      ) : (
        <span
          aria-hidden
          className={cn(linkBase, linkIdle, "pointer-events-none opacity-40")}
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight size={16} />
        </span>
      )}
    </nav>
  );
}
