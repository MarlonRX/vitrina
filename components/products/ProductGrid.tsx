import type { Product } from "@/lib/shopify/types";
import { Reveal } from "@/components/ui/Reveal";
import StateView from "@/components/StateView";
import ProductCard from "./ProductCard";
import { cn } from "@/lib/utils";

// S-14k: dos variantes de grilla.
//  - "full": aprovecha todo el ancho con columnas densas (como siempre en el
//    catálogo; el usuario la prefiere así).
//  - "balanced": 2/3/4 columnas — todas divisoras de las 12 piezas por
//    página, así las filas SIEMPRE cierran completas (colecciones).
const GRID_VARIANTS = {
  full: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4",
  balanced: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4",
} as const;

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

  const cols = variant === "full" ? 7 : 4;

  return (
    <div className={cn(GRID_VARIANTS[variant])}>
      {products.map((product, index) => {
        // S-01.5: reveal escalonado SOLO para lo que nace bajo el fold. La
        // primera fila va SIN Reveal: envolverla en opacity-0 retrasaría el
        // LCP (la trampa que acabamos de quitar del hero en S-09).
        const card = (
          <ProductCard
            product={product}
            // La primera fila queda above-the-fold en cualquier breakpoint;
            // eager evita el aviso de LCP.
            eager={index < cols}
          />
        );
        if (index < cols) return <div key={product.id}>{card}</div>;
        return (
          <Reveal key={product.id} delay={(index % cols) * 60}>
            {card}
          </Reveal>
        );
      })}
    </div>
  );
}
