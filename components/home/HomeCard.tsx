"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MyButton from "@/components/UIComponents/MyButton";
import ProductCard from "@/components/products/ProductCard";
import type { Product } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

interface HomeCardProps {
  products: Product[];
  /** Máximo de productos que entran en la tarjeta. */
  maxItems?: number;
  className?: string;
}

// Por debajo de md: 2.1 fichas visibles en móvil y 2.5 en sm (pista con
// scroll). De md hacia arriba la pista pasa a grilla de 5 columnas iguales,
// así que `md:w-auto` anula los calc y el ancho lo reparte la grilla.
const ITEM_WIDTH = [
  "w-[calc(47%-0.4rem)]",
  "sm:w-[calc(40%-0.45rem)]",
  "md:w-auto",
].join(" ");

// Flechas circulares: como la tarjeta madre ya no tiene superficie propia,
// flotan sobre las fichas con `bg-(--bg-surface)/90` + blur para mantener el
// contraste sobre cualquier foto.
const CARD_ARROW_CLASS = [
  "absolute top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full",
  "border border-(--border-secondary) bg-(--bg-surface)/90 text-(--text-primary)",
  "shadow-md backdrop-blur-sm",
  "transition-all duration-300",
  "hover:scale-110 hover:border-(--accent-primary)/50 hover:bg-(--bg-surface) hover:text-(--accent-primary)",
  "active:scale-95",
  // En los extremos la flecha desaparece en vez de quedar "apagada".
  "disabled:opacity-0 disabled:shadow-none",
].join(" ");

/**
 * Carrusel de destacados sin contenedor visible: la tarjeta es transparente
 * (sin borde, fondo, sombra ni padding) y solo se ven las fichas flotando
 * sobre el borde inferior del hero (el solape lo da el margen negativo del
 * `className` del padre).
 *
 * De md hacia arriba muestra las 5 fichas repartidas en una grilla de 5
 * columnas iguales, centrada y más angosta que el contenedor de la página
 * (`mx-auto max-w-5xl`). Por debajo de md sigue siendo una pista horizontal
 * estilo MercadoLibre: las flechas mueven exactamente una ficha por clic y
 * solo aparecen cuando el contenido desborda (carrusel opcional). Además de
 * las flechas, la pista acepta arrastre táctil/trackpad y scroll con teclado.
 */
export default function HomeCard({
  products,
  maxItems = 5,
  className,
}: HomeCardProps) {
  const items = products.slice(0, maxItems);

  const trackRef = useRef<HTMLDivElement>(null);
  // `overflow` activa las flechas; `start`/`end` las desactivan en los bordes.
  const [scroll, setScroll] = useState({
    overflow: false,
    start: true,
    end: false,
  });

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setScroll({
      overflow: el.scrollWidth > el.clientWidth + 1,
      start: el.scrollLeft <= 1,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1,
    });
  }, []);

  // Las imágenes cargan después de montarse y pueden cambiar el ancho del
  // contenido; el `resize` cubre cambios de ventana. El scroll se mide con
  // rAF para no trabajar en cada frame del deslizamiento.
  useEffect(() => {
    sync();
    const el = trackRef.current;
    if (!el) return;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sync);
    };

    window.addEventListener("resize", sync);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", sync);
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [sync]);

  // Avanza una ficha entera: la distancia entre las dos primeras (ancho +
  // gap) es el paso exacto, midiendo rects para no depender del scrollLeft.
  const scrollByItem = useCallback((direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el || el.children.length === 0) return;

    const [first, second] = Array.from(el.children);
    const step =
      second != null
        ? second.getBoundingClientRect().left - first.getBoundingClientRect().left
        : first.getBoundingClientRect().width;

    const reducedMotion = window
      .matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    el.scrollBy({
      left: direction * step,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, []);

  if (items.length === 0) return null;

  return (
    <section
      aria-label="Productos destacados"
      className={cn("relative mx-auto w-full max-w-5xl animate-fade-up", className)}
    >
      <div className="relative">
        <div
          ref={trackRef}
          tabIndex={0}
          aria-label="Productos destacados: usa las flechas o desliza para ver más"
          className="hide-scrollbar flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1 outline-none focus-visible:ring-2 focus-visible:ring-(--accent-primary)/30 md:grid md:grid-cols-5 md:overflow-x-visible md:snap-none"
        >
          {items.map((product, index) => (
            <div
              key={product.id}
              className={cn("flex shrink-0 snap-start", ITEM_WIDTH)}
            >
              <ProductCard product={product} eager={index < 2} />
            </div>
          ))}
        </div>

        {scroll.overflow && (
          <>
            <MyButton
              variant="ghost"
              size="icon"
              onClick={() => scrollByItem(-1)}
              disabled={scroll.start}
              aria-label="Productos anteriores"
              leftIcon={<ChevronLeft className="h-5 w-5" aria-hidden />}
              className={`${CARD_ARROW_CLASS} left-0 md:left-1`}
            />
            <MyButton
              variant="ghost"
              size="icon"
              onClick={() => scrollByItem(1)}
              disabled={scroll.end}
              aria-label="Productos siguientes"
              leftIcon={<ChevronRight className="h-5 w-5" aria-hidden />}
              className={`${CARD_ARROW_CLASS} right-0 md:right-1`}
            />
          </>
        )}
      </div>
    </section>
  );
}
