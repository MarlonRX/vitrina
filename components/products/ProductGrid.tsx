import type { Product } from "@/lib/shopify/types";
import { Reveal } from "@/components/ui/Reveal";
import StateView from "@/components/StateView";
import ProductCard from "./ProductCard";
import { cn } from "@/lib/utils";

// S-14q (responsive, reescrito): la grilla ya NO depende del ancho del
// viewport sino del ANCHO REAL de su contenedor, vía consultas de contenedor
// de Tailwind (`@container` + variantes `@min-[Npx]:`). Con breakpoint de
// viewport, una tableta u ordenador mediano heredaban las 5-7 columnas del
// catálogo dentro de la columna que comparte row con el aside de 300px, y las
// fichas salían ilegibles. Aquí los umbrales están calibrados para que la
// ficha nunca baje de ~150px y, sobre un monitor de 1920, el resultado sea
// EXACTAMENTE el de antes (7 columnas):
//   <320 → 1 · ≥320 → 2 · ≥520 → 3 · ≥700 → 4 · ≥880 → 5 · ≥1010 → 6 · ≥1150 → 7
// `min-w-0` en los wrappers: ninguna columna la ensancha su contenido.
//
// OJO con la envoltura: por especificación, una consulta de contenedor se
// resuelve contra el contenedor ANCESTRO MÁS CERCANO — un elemento nunca se
// consulta a sí mismo. Por eso el `@container` vive en el div envoltorio y el
// grid (con las variantes `@min-…`) es su hijo. El envoltorio no tiene
// padding, así que su ancho es exactamente el de la grilla.
const GRID_BASE = "grid grid-cols-1 gap-3";

const GRID_VARIANTS = {
  full: [
    GRID_BASE,
    "@min-[320px]:grid-cols-2",
    "@min-[520px]:grid-cols-3",
    "@min-[700px]:grid-cols-4",
    "@min-[880px]:grid-cols-5",
    "@min-[1010px]:grid-cols-6",
    "@min-[1150px]:grid-cols-7",
    "@min-[480px]:gap-4",
  ].join(" "),
  balanced: [
    GRID_BASE,
    "@min-[320px]:grid-cols-2",
    "@min-[520px]:grid-cols-3",
    "@min-[700px]:grid-cols-4",
    "@min-[880px]:grid-cols-5",
    "@min-[480px]:gap-4",
  ].join(" "),
} as const;

/** Máximo de columnas por variante: corte de la primera fila (eager/reveal). */
const FIRST_ROW_COLS = { full: 7, balanced: 5 } as const;

export default function ProductGrid({
  products,
  variant = "full",
}: {
  products: Product[];
  variant?: keyof typeof GRID_VARIANTS;
}) {
  if (products.length === 0) {
    return (
      <StateView
        variant="empty"
        title="No hay productos para mostrar"
        description="Esta selección quedó vacía. Prueba con otros filtros o explora el catálogo completo."
        action={{ label: "Ver catálogo", href: "/products" }}
      />
    );
  }

  const cols = FIRST_ROW_COLS[variant];

  return (
    <div className="@container">
      <div className={cn(GRID_VARIANTS[variant])}>
        {products.map((product, index) => {
          // S-01.5: reveal escalonado SOLO para lo que nace bajo el fold. La
          // primera fila va SIN Reveal: envolverla en opacity-0 retrasaría el
          // LCP (la trampa que acabamos de quitar del hero en S-09). `cols` es
          // el MÁXIMO de columnas de la variante, así que en pantallas chicas
          // unas pocas fichas extra tampoco se revelan con delay; el LCP lo
          // marca la primera imagen, que nunca va envuelta.
          const card = (
            <ProductCard
              product={product}
              // La primera fila queda above-the-fold en cualquier breakpoint;
              // eager evita el aviso de LCP.
              eager={index < cols}
            />
          );
          // `min-w-0`: una columna de grilla nunca la ensancha su contenido.
          if (index < cols) {
            return (
              <div key={product.id} className="min-w-0">
                {card}
              </div>
            );
          }
          return (
            <Reveal
              key={product.id}
              delay={(index % cols) * 60}
              className="min-w-0"
            >
              {card}
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
