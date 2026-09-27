"use client";

// S-17 (rework del hero, planteamiento del portfolio): escenario oscuro
// full-bleed con aurora WebGL cuya paleta viaja al compás de la diapositiva
// activa, y módulo visual enmarcado a la derecha (crossfade de imágenes,
// contador 01/03 y barra de info con enlace sincronizado). El texto vive
// sobre el escenario oscuro, nunca sobre la foto: contraste garantizado.
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Aurora from "@/components/reactbits/Aurora";
import MyButton from "../UIComponents/MyButton";
import HeroSlideView from "./HeroSlideView";
import { heroSlides, type HeroSlide } from "./heroSlides";

interface HeroCarouselProps {
  slides?: HeroSlide[];
  /** Milisegundos entre avanzadas automáticas. */
  intervalMs?: number;
}

const ARROW_BUTTON_CLASS = [
  "absolute top-1/2 z-10 h-11 w-11 -translate-y-1/2 rounded-full",
  "border border-(--bg-primary)/30 bg-black/35 text-(--bg-primary)",
  "shadow-lg backdrop-blur-md",
  "transition-[transform,background-color,border-color,box-shadow,opacity] duration-300",
  "hover:scale-110 hover:border-(--bg-primary)/70 hover:bg-black/55",
  "active:scale-95",
  // Solo visibles con el puntero sobre el marco (o foco por teclado).
  "opacity-0 group-hover/frame:opacity-100 focus-visible:opacity-100",
].join(" ");

export default function HeroCarousel({
  slides = heroSlides,
  intervalMs = 6000,
}: HeroCarouselProps) {
  const count = slides.length;
  const hasLoop = count > 1;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const active = slides[Math.min(index, count - 1)] as HeroSlide;

  const goNext = useCallback(
    () => setIndex((value) => (value + 1) % count),
    [count],
  );
  const goPrev = useCallback(
    () => setIndex((value) => (value - 1 + count) % count),
    [count],
  );
  const goToSlide = useCallback(
    (slide: number) => setIndex(((slide % count) + count) % count),
    [count],
  );

  // Autoplay: se pausa al interactuar y se omite con movimiento reducido.
  useEffect(() => {
    if (paused || !hasLoop) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(goNext, intervalMs);
    return () => clearInterval(id);
  }, [paused, hasLoop, intervalMs, goNext]);

  // Deslizar el marco con el dedo o el puntero avanza/retrocede.
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = useCallback((event: React.PointerEvent) => {
    pointerStart.current = { x: event.clientX, y: event.clientY };
  }, []);
  const onPointerUp = useCallback(
    (event: React.PointerEvent) => {
      const start = pointerStart.current;
      pointerStart.current = null;
      if (!start) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      if (dx < 0) goNext();
      else goPrev();
    },
    [goNext, goPrev],
  );

  if (count === 0) return null;

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Destacados de la temporada"
      className="group relative -mt-30 ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] overflow-hidden bg-[#1c0f12]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") goNext();
        if (event.key === "ArrowLeft") goPrev();
      }}
    >
      {/* Fondo al compás: la aurora interpola su paleta hacia la del slide
          activo (lerp dentro de Aurora), así el escenario respira con el
          carrusel en vez de quedar estático bajo él. */}
      <div aria-hidden className="absolute inset-0">
        <Aurora
          colorStops={active.palette}
          amplitude={1.15}
          blend={0.62}
          speed={0.5}
        />
      </div>
      {/* Viñeta: asienta el texto crema y encuadra el módulo. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(95%_85%_at_50%_15%,transparent_0%,rgba(20,10,12,0.62)_100%)]"
      />

      <div className="relative z-1 mx-auto flex min-h-[70vh] w-full max-w-6xl flex-col justify-center gap-12 px-6 pt-28 pb-44 md:min-h-[82vh] md:grid md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-16 md:px-8 md:pt-32 md:pb-72">
        {/* Columna de texto: se remonta por índice para re-disparar el
            revelado de SplitText y los fade-up en cada diapositiva. */}
        <HeroSlideView key={index} slide={active} />

        {/* Módulo visual enmarcado, como en el portfolio: cabecera con
            contador, marco con crossfade y barra de info sincronizada. */}
        <div className="flex flex-col gap-4" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-(--bg-primary)/60">
              Pieza destacada
            </p>
            <span className="font-mono text-[11px] tracking-[0.2em] text-(--bg-primary)/60">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(count).padStart(2, "0")}
            </span>
          </div>

          <div className="group/frame relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-(--bg-primary)/15 shadow-2xl shadow-black/50 sm:aspect-[4/3] md:aspect-[4/5]">
            {slides.map((slide, slideIndex) => (
              <Image
                key={slide.eyebrow}
                src={slide.image}
                alt={slide.titleLines.join(" ")}
                fill
                sizes="(min-width: 768px) 42vw, 92vw"
                loading={slideIndex === 0 ? "eager" : "lazy"}
                fetchPriority={slideIndex === 0 ? "high" : "auto"}
                aria-hidden={slideIndex !== index}
                className={`object-cover transition-[opacity,transform] duration-700 ease-out group-hover/frame:scale-[1.03] ${
                  slideIndex === index
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-[1.05]"
                }`}
              />
            ))}
            {hasLoop && (
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
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-(--bg-primary)/15 pt-4">
            <p className="truncate text-sm text-(--bg-primary)/70">
              {active.eyebrow} — {active.titleLines.join(" ")}
            </p>
            <Link
              href={active.href}
              className="group/cta inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-(--accent-secondary) transition-colors hover:text-(--bg-primary)"
            >
              Ver colección
              <ChevronRight
                size={16}
                aria-hidden
                className="transition-transform group-hover/cta:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Degradado final: funde el escenario con el fondo de la página. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-4 h-24 bg-[linear-gradient(to_top,var(--bg-primary)_0%,color-mix(in_srgb,var(--bg-primary)_75%,transparent)_25%,transparent_50%)] md:h-28"
      />

      {hasLoop && (
        /* Indicador: pastilla de cristal centrada sobre el solape de
           HomeCard (7rem en móvil, 16rem en md, más un respiro). */
        <nav
          aria-label="Ir a una diapositiva"
          className="absolute bottom-[7.75rem] left-1/2 z-30 -translate-x-1/2 md:bottom-[16.75rem]"
        >
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-(--bg-primary)/15 bg-black/25 px-3.5 py-2.5 shadow-lg backdrop-blur-md">
            {slides.map((slide, slideIndex) => (
              <button
                key={`${slideIndex}-${slide.eyebrow}`}
                type="button"
                onClick={() => goToSlide(slideIndex)}
                aria-label={`Ir a la diapositiva ${slideIndex + 1} de ${count}`}
                aria-current={slideIndex === index}
                className={
                  /* S-17c: el truco anterior de agrandar el hit con `p-2 -m-2`
                     inflaba el fondo del botón (el padding se pinta) y los
                     puntos se solapaban. El área táctil ahora crece con un
                     pseudo-elemento invisible: cero efecto en el layout. */
                  "relative touch-manipulation rounded-full after:absolute after:-inset-2 after:content-[''] " +
                  (slideIndex === index
                    ? "h-2 w-10 bg-(--accent-primary) shadow-[0_0_12px_rgb(var(--accent-primary-rgb),0.7)] transition-[width,background-color]"
                    : "h-2 w-2 bg-(--bg-primary)/50 transition-[width,background-color] hover:w-5 hover:bg-(--bg-primary)/90")
                }
              />
            ))}
          </div>
        </nav>
      )}
    </section>
  );
}
