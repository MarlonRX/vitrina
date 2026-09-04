"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { heroSlides, type HeroSlide } from "./heroSlides";
import MyButton from "../UIComponents/MyButton";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroCarouselProps {
  slides?: HeroSlide[];
  /** Milisegundos entre avanzadas automáticas. */
  intervalMs?: number;
}

const TRANSITION_MS = 700;
const TRANSITION = `transform ${TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;
// Colchón para ejecutar el salto invisible solo cuando la transición ya terminó.
const SNAP_DELAY_MS = TRANSITION_MS + 60;

const ARROW_BUTTON_CLASS = [
  "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 rounded-full md:inline-flex",
  "border border-(--bg-primary)/30 bg-black/25 text-(--bg-primary)",
  "shadow-lg backdrop-blur-md",
  "transition-all duration-300",
  "hover:scale-110 hover:border-(--bg-primary)/70 hover:bg-black/45 hover:text-(--bg-primary)",
  "hover:shadow-xl hover:shadow-black/40",
  "focus-visible:ring-(--bg-primary)/60",
  "active:scale-95",
].join(" ");

/**
 * Carrusel de hero con bucle infinito.
 *
 * - Full-bleed: ignora el contenedor del layout y ocupa todo el ancho del
 *   viewport. El `-mt-[120px]` anula el padding superior del layout (-mt-10)
 *   y la altura del navbar sticky (h-20) para que la imagen suba por debajo
 *   del cristal del navbar.
 * - Cada slide es una imagen de fondo con scrim oscuro y un enlace que cubre
 *   toda la superficie (props `image` + `href` de HeroSlide; sin botones).
 * - Al final del carrusel hay un degradado que lo funde con el fondo de la
 *   página (de 100% del slide a 0%).
 *
 * La pista real es [última, ...slides, primera]: dos diapositivas clonadas en
 * los extremos (`offset = 1`). Todas las animaciones de avance van siempre en
 * el mismo sentido; al aterrizar sobre un clon se espera a que termine la
 * transición y se salta SIN animación a la diapositiva verdadera equivalente,
 * cuyo fotograma es idéntico al del clon. Así nunca se ve un rebobinado.
 */
export default function HeroCarousel({
  slides = heroSlides,
  intervalMs = 6000,
}: HeroCarouselProps) {
  const count = slides.length;
  const hasLoop = count > 1;
  const offset = hasLoop ? 1 : 0;
  const lastIndex = count + offset; // posición del clon del inicio

  // `index` es la posición dentro de la pista:
  //   count>1 → 0 (clon del final), 1..count (reales), count+1 (clon del inicio)
  //   count=1 → 0
  const [index, setIndex] = useState(offset);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  // Controla que las flechas solo existan en el DOM con el mouse encima.
  const [hovered, setHovered] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // Índice acotado a la pista: si `slides` cambiara de longitud entre renders,
  // evita posicionar fuera de rango (pantalla en blanco).
  const display = Math.min(Math.max(index, 0), lastIndex);

  // Diapositiva real (0-based) que muestran los puntos y las etiquetas ARIA.
  const activeSlide =
    count === 0 ? 0 : (((display - offset) % count) + count) % count;

  const goNext = useCallback(() => {
    // Sobre el clon no se avanza más: el salto al original ya está programado.
    if (!hasLoop || display === lastIndex) return;
    setAnimate(true);
    setIndex(display + 1);
  }, [hasLoop, display, lastIndex]);

  const goPrev = useCallback(() => {
    // Sobre el clon no se retrocede más: el salto al original ya está programado.
    if (!hasLoop || display === 0) return;
    setAnimate(true);
    setIndex(display - 1);
  }, [hasLoop, display]);

  const goToSlide = useCallback(
    (slide: number) => {
      setAnimate(true);
      setIndex(slide + offset);
    },
    [offset],
  );

  useEffect(() => {
    if (!hasLoop) return;
    const landedOnClone = display === 0 || display === lastIndex;
    if (!landedOnClone) return;

    const id = setTimeout(() => {
      // 1) Apagar la transición en el DOM y forzar un reflow: así el navegador
      //    consolida el estado "transition: none" ANTES de que React cambie el
      //    transform (React aplica `transform` antes que `transition` al
      //    actualizar estilos; sin esto el salto podría animarse en reversa).
      // 2) Saltar al slide real equivalente con el mismo fotograma visible.
      const el = trackRef.current;
      if (el) {
        el.style.transition = "none";
        void el.offsetWidth;
      }
      setAnimate(false);
      setIndex(display === lastIndex ? 1 : count);
    }, SNAP_DELAY_MS);

    return () => clearTimeout(id);
  }, [display, hasLoop, lastIndex, count]);

  // Reactivar la animación en el siguiente frame tras el salto.
  useEffect(() => {
    if (animate) return;
    const raf = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(raf);
  }, [animate]);

  // Autoplay: se pausa al interactuar y se omite con movimiento reducido.
  useEffect(() => {
    if (paused || !hasLoop) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(goNext, intervalMs);
    return () => clearInterval(id);
  }, [paused, hasLoop, intervalMs, goNext]);

  if (count === 0) return null;

  const track = hasLoop ? [slides[count - 1], ...slides, slides[0]] : slides;

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Destacados de la temporada"
      className="group relative -mt-30 ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] animate-fade-up overflow-hidden"
      onMouseEnter={() => {
        setHovered(true);
        setPaused(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
        setPaused(false);
      }}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") goNext();
        if (event.key === "ArrowLeft") goPrev();
      }}
    >
      {/* Pista: todas las diapositivas se renderizan lado a lado, así la altura
          es la de la más alta y no salta al cambiar. */}
      <div
        ref={trackRef}
        className="flex will-change-transform"
        style={{
          transform: `translateX(-${display * 100}%)`,
          transition: animate ? TRANSITION : "none",
        }}
      >
        {track.map((slide, position) => {
          const isActive = position === display;
          // La diapositiva visible aporta el h1 de la home; las demás bajan de
          // nivel para no dejar varios encabezados de primer nivel en el DOM.
          const Heading: "h1" | "h2" = isActive ? "h1" : "h2";

          return (
            <div
              key={`${position}-${slide.eyebrow}`}
              role="group"
              aria-roledescription="diapositiva"
              aria-label={`Diapositiva ${activeSlide + 1} de ${count}`}
              aria-hidden={!isActive}
              inert={!isActive}
              className="group/slide relative flex min-h-[60vh] basis-full shrink-0 flex-col justify-center overflow-hidden bg-(--accent-hover) px-8 py-20 md:min-h-[65vh] md:px-[calc(10vw+1rem)]"
            >
              <Image
                src={slide.image}
                alt=""
                fill
                sizes="100vw"
                loading={position === offset ? "eager" : "lazy"}
                fetchPriority={position === offset ? "high" : "auto"}
                className="object-cover duration-900 ease-out transition-transform group-hover/slide:scale-[1.03]"
              />
              {/* Scrim lateral para que el texto se lea sobre cualquier foto. */}
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(90deg,rgba(23,12,14,0.85)_0%,rgba(23,12,14,0.6)_50%,rgba(23,12,14,0.18)_100%)]"
              />
              {/* Enlace que cubre la diapositiva entera (sin botones internos). */}
              <Link
                href={slide.href}
                aria-label={`${slide.titleLines.join(" ")} — abrir`}
                className="absolute inset-0 z-2 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-(--bg-primary)"
              />
              <div className="pointer-events-none relative z-3 flex max-w-2xl flex-col gap-5">
                <span className="text-xs font-semibold uppercase tracking-[0.35em] text-(--bg-primary)/70">
                  {slide.eyebrow}
                </span>
                <Heading className="text-4xl font-bold leading-[1.05] text-(--bg-primary) md:text-6xl">
                  {slide.titleLines.map((line, lineIndex) => (
                    <span key={`${lineIndex}-${line}`}>
                      {lineIndex > 0 && <br />}
                      <span className="text-(--bg-primary)">{line}</span>
                    </span>
                  ))}
                </Heading>
                <p className="max-w-md text-sm leading-relaxed text-(--bg-primary)/80 md:text-base">
                  {slide.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      {/* Degradado final: funde el carrusel (100%) con el fondo de la página.
          El stop intermedio (75% de opacidad al 25% de la altura) emula la
          curva resultante de apilar dos capas de degradado idénticas: la
          opacidad total es 1-(1-α)², que no es lineal. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-4 h-24 bg-[linear-gradient(to_top,var(--bg-primary)_0%,color-mix(in_srgb,var(--bg-primary)_75%,transparent)_25%,transparent_50%)] md:h-28"
      />

      {hasLoop && hovered && (
        <>
          <MyButton
            variant="ghost"
            size="icon"
            onClick={goPrev}
            aria-label="Diapositiva anterior"
            tooltip="Anterior"
            leftIcon={<ChevronLeft className="h-5 w-5" aria-hidden />}
            className={`${ARROW_BUTTON_CLASS} left-3`}
          />
          <MyButton
            variant="ghost"
            size="icon"
            onClick={goNext}
            aria-label="Diapositiva siguiente"
            tooltip="Siguiente"
            leftIcon={<ChevronRight className="h-5 w-5" aria-hidden />}
            className={`${ARROW_BUTTON_CLASS} right-3`}
          />
        </>
      )}

      {hasLoop && (
        /* Contador de puntos: centrado abajo, un punto por diapositiva real.
           Se alza sobre el degradado para mantener contraste. `HomeCard`
           solapa el borde inferior del hero (-mt-20 md:-mt-26 sobre el
           contenedor), así que los puntos se suben lo suficiente para que la
           tarjeta nunca los tape. */
        <div
          aria-label="Ir a una diapositiva"
          className="absolute bottom-14 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 md:bottom-20"
        >
          {slides.map((slide, slideIndex) => (
            <button
              key={`${slideIndex}-${slide.eyebrow}`}
              type="button"
              onClick={() => goToSlide(slideIndex)}
              aria-label={`Ir a la diapositiva ${slideIndex + 1} de ${count}`}
              aria-current={slideIndex === activeSlide}
              className={
                slideIndex === activeSlide
                  ? "h-2 w-8 bg-(--bg-primary) transition-all"
                  : "h-2 w-2 bg-(--bg-primary)/40 transition-all hover:bg-(--bg-primary)/70"
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
