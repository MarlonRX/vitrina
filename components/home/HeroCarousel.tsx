"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { heroSlides, type HeroSlide } from "./heroSlides";
import HeroSlideView from "./HeroSlideView";
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
  // S-09 (react-doctor no-transition-all): en vez de animar todas las
  // propiedades, solo las que realmente cambian en hover/active.
  "transition-[transform,background-color,border-color,box-shadow] duration-300",
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
 *
 * S-09 (LCP): el contenedor ya no usa `animate-fade-up` — el keyframe arranca
 * en opacidad 0 sobre la imagen del LCP y retrasa su paint.
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
  const sectionRef = useRef<HTMLElement>(null);

  // S-01.5 (factor wow): parallax sutil del fondo del hero. No usa estado de
  // React (cero re-renders por scroll): escribe `--hero-shift` directo en el
  // nodo, y las imágenes lo consumen vía `translate` (propiedad independiente
  // de `scale`, que sigue con el hover). Se desactiva con reduced-motion y
  // queda cubierto por el CSS global de S-10.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = sectionRef.current;
        if (!el) return;
        // Avanza hasta -26px a lo largo de los primeros ~220px de scroll.
        const shift = -Math.min(window.scrollY, 220) * 0.12;
        el.style.setProperty("--hero-shift", `${shift.toFixed(1)}px`);
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

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

  // S-14q (responsive): las flechas exigen hover y los puntos son diminutos,
  // así que en táctil no había forma de navegar. Deslizar la pista con el
  // dedo (o el puntero) avanza/retrocede una diapositiva.
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
      // Horizontal claro y suficientemente largo; ignora scroll vertical.
      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      if (dx < 0) goNext();
      else goPrev();
    },
    [goNext, goPrev],
  );

  if (count === 0) return null;

  const track = hasLoop ? [slides[count - 1], ...slides, slides[0]] : slides;

  return (
    <section
      ref={sectionRef}
      aria-roledescription="carrusel"
      aria-label="Destacados de la temporada"
      className="group relative -mt-30 ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] overflow-hidden"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
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
        className="flex"
        style={{
          transform: `translateX(-${display * 100}%)`,
          transition: animate ? TRANSITION : "none",
          // S-09 (react-doctor no-permanent-will-change): la pista GPU solo se
          // reserva mientras hay una transición en vuelo; en reposo se libera.
          willChange: animate ? "transform" : "auto",
        }}
      >
        {track.map((slide, position) => (
          <HeroSlideView
            key={`${position}-${slide.eyebrow}`}
            slide={slide}
            isActive={position === display}
            isFirstReal={position === offset}
            position={position}
            count={count}
            hasLoop={hasLoop}
            activeSlide={activeSlide}
          />
        ))}
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
        /* S-14j: el indicador vuelve a ser HORIZONTAL y se planta justo
           encima del carrusel de ítems: HomeCard solapa el hero 5rem en móvil
           y 14rem en md (ClientHome), así que el bottom suma ese solape más
           un respiro. Pastilla de cristal centrada; la diapositiva activa es
           una barra burdeos que se estira con resplandor, el resto puntos
           crema que se encienden al hover. */
        /* S-10: <nav> real con su nombre accesible. */
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
                aria-current={slideIndex === activeSlide}
                className={
                  // S-09 (react-doctor no-transition-all): solo animan lo
                  // que cambian: largo, fondo y sombra. S-14q: el área táctil
                  // se agranda con relleno invisible (la píldora visual sigue
                  // midiendo h-2; con p-2 -m-2 los hits se juntan justitos al
                  // gap-2 del contenedor, sin solaparse entre sí).
                  "touch-manipulation rounded-full p-2 -m-2 " +
                  (slideIndex === activeSlide
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
