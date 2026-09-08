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

// S-14c: una sola fila de quince fichas en TODOS los tamaños — la pista es
// siempre carrusel horizontal; las flechas mueven una ficha por clic. El
// ancho fijo por breakpoint hace que todas las tarjetas midan exactamente lo
// mismo. S-14f: máximo 5 visibles por vez en escritorio (antes 7.5) — fichas
// más grandes y legibles, el resto sigue rodando con las flechas.
const ITEM_WIDTH = [
  "w-[calc((100%-0.8rem)/2.2)]",
  "sm:w-[calc((100%-2rem)/4.5)]",
  "md:w-[calc((100%-3rem)/5)]",
].join(" ");

// Flechas circulares: como la tarjeta madre ya no tiene superficie propia,
// flotan sobre las fichas con `bg-(--bg-surface)/90` + blur para mantener el
// contraste sobre cualquier foto.
const CARD_ARROW_CLASS = [
  "absolute top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full",
  "border border-(--border-secondary) bg-(--bg-surface)/90 text-(--text-primary)",
  "shadow-md backdrop-blur-sm",
  // S-01.5 (react-doctor no-transition-all): solo animan lo que cambian.
  "transition-[transform,border-color,background-color,color,opacity,box-shadow] duration-300",
  "hover:scale-110 hover:border-(--accent-primary)/50 hover:bg-(--bg-surface) hover:text-(--accent-primary)",
  "active:scale-95",
  // En los extremos la flecha desaparece en vez de quedar "apagada".
  "disabled:!opacity-0 disabled:shadow-none",
  // S-14i: opacas por defecto; aparecen al pasar el ratón por el carrusel
  // (o al recibir foco de teclado, para no romper accesibilidad).
  "opacity-0 group-hover/carousel:opacity-100 group-focus-within/carousel:opacity-100",
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
      // S-14d: el carrusel usa casi todo el ancho de la página (antes topaba
      // en max-w-5xl y dejaba columnas muertas a los lados). S-14g: pedido
      // del usuario — 70% del viewport, centrado, ya no full-bleed. S-14q:
      // ese 70% era de escritorio; en móvil el carrusel toma el 100%
      // del contenedor (que ya es ~todo el viewport) para evitar overflow.
      className={cn(
        "group/carousel relative mx-auto w-full max-w-full animate-fade-up md:w-[70vw] md:max-w-[70vw]",
        className,
      )}
    >
      <div className="relative">
        <div
          ref={trackRef}
          tabIndex={0}
          aria-label="Productos destacados: usa las flechas o desliza para ver más"
          className="hide-scrollbar flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1 outline-none focus-visible:ring-2 focus-visible:ring-(--accent-primary)/30"
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
