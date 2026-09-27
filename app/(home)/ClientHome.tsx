import Link from "next/link";
import HeroCarousel from "@/components/home/HeroCarousel";
import { heroSlides } from "@/components/home/heroSlides";
import HomeCard from "@/components/home/HomeCard";
import CollectionsBento from "@/components/home/CollectionsBento";
import AuroraBand from "@/components/home/AuroraBand";
import ProductGrid from "@/components/products/ProductGrid";
import type { Collection, Product } from "@/lib/shopify/types";

interface ClientHomeProps {
  products: Product[];
  collections: Collection[];
  hasActiveFilters: boolean;
}

export default function ClientHome({
  products,
  collections,
  hasActiveFilters,
}: ClientHomeProps) {
  // S-10 (accesibilidad): el `<main>` da destino al atajo "saltar al
  // contenido" de los lectores de pantalla (las demás rutas ya lo tenían).
  return (
    <main className="flex flex-col gap-10">
      {!hasActiveFilters && <HeroCarousel slides={heroSlides} />}

      {hasActiveFilters ? (
        <section className="flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-(--text-secondary)">
                Resultados
              </span>
              <h1 className="text-2xl font-bold md:text-3xl">
                Productos destacados
              </h1>
            </div>
            <Link href="/products" className="text-sm underline">
              Ver todo
            </Link>
          </div>
          <ProductGrid products={products} />
        </section>
      ) : (
        /* Sin filtros la grilla se sustituye por la tarjeta de destacados,
           que solapa el borde inferior del hero (estilo MercadoLibre). El
           margen compensa primero el `gap-10` del contenedor (2.5rem) y
           luego solapa sobre el carrusel: 2.5rem en móvil y 4rem en md+.
           `z-20` la sube por encima del degradado (z-4) y de los puntos
           (z-10) del hero. */
        <HomeCard
          products={products}
          maxItems={15}
          className="z-10 -mt-28 md:-mt-64"
        />
      )}

      {/* S-17 (rework React Bits): solo la home "vitrina" lleva las secciones
          de racconto - colecciones en bento mágico y banda manifiesto con
          aurora. Con filtros activos la página es un listado de resultados. */}
      {!hasActiveFilters && (
        <>
          <CollectionsBento collections={collections} />
          <AuroraBand />
        </>
      )}
    </main>
  );
}
