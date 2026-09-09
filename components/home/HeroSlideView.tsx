import Image from "next/image";
import Link from "next/link";
import type { HeroSlide } from "./heroSlides";

/**
 * S-14q (react-doctor no-giant-component): cada diapositiva del hero, extraída
 * del carrusel. La lógica de bucle/índices sigue en el padre; acá solo se pinta
 * el slide (imagen con parallax, scrim, enlace y bloque de texto).
 */
export default function HeroSlideView({
  slide,
  isActive,
  isFirstReal,
  position,
  count,
  hasLoop,
  activeSlide,
}: {
  slide: HeroSlide;
  isActive: boolean;
  /** La primera diapositiva real (no clon): la que manda el LCP. */
  isFirstReal: boolean;
  position: number;
  count: number;
  hasLoop: boolean;
  activeSlide: number;
}) {
  // La diapositiva visible aporta el h1 de la home; las demás bajan de
  // nivel para no dejar varios encabezados de primer nivel en el DOM.
  const Heading: "h1" | "h2" = isActive ? "h1" : "h2";

  return (
    <div
      role="group"
      aria-roledescription="diapositiva"
      // S-10: el rótulo de cada diapositiva usa su propia posición, no
      // la activa (antes todas decían "Diapositiva N" con N común).
      aria-label={`Diapositiva ${
        hasLoop && position > 0 && position <= count ? position : activeSlide + 1
      } de ${count}`}
      aria-hidden={!isActive}
      inert={!isActive}
      className="group/slide relative flex min-h-[70vh] basis-full shrink-0 flex-col justify-center overflow-hidden bg-(--accent-hover) px-8 py-20 md:min-h-[82vh] md:px-[calc(6vw+1rem)]"
    >
      <Image
        src={slide.image}
        alt=""
        fill
        sizes="100vw"
        loading={isFirstReal ? "eager" : "lazy"}
        fetchPriority={isFirstReal ? "high" : "auto"}
        // S-01.5: `translate` (propiedad CSS separada de `transform`)
        // lleva el parallax y no interfiere con el `scale` del hover.
        // Se extiende 40px por debajo (`!h`) para que el desplazamiento
        // hacia arriba (máx. ~26px) nunca deje borde descubierto;
        // `overflow-hidden` de la diapositiva recorta el sobrante.
        className="object-cover !h-[calc(100%+40px)] duration-900 ease-out translate-y-[var(--hero-shift,0px)] transition-transform group-hover/slide:scale-[1.03]"
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
      <div className="pointer-events-none relative z-3 flex max-w-4xl flex-col gap-5">
        <span className="text-sm font-semibold uppercase tracking-[0.35em] text-(--bg-primary)/70 md:text-base">
          {slide.eyebrow}
        </span>
        {/* S-12b: en display grande, el peso 600 global se ve liviano;
            el hero recupera 700 solo a este tamaño. S-14d: escalada
            a 7xl — el lienzo de 65vh pedía más presencia. */}
        <Heading className="text-5xl font-bold leading-[1.02] text-(--bg-primary) md:text-7xl">
          {slide.titleLines.map((line, lineIndex) => (
            <span key={`${lineIndex}-${line}`}>
              {lineIndex > 0 && <br />}
              {/* S-12: el "momento tipográfico" — la última línea en
                  cursiva Fraunces con tinte crema, firma editorial. */}
              <span
                className={
                  lineIndex === slide.titleLines.length - 1
                    ? "italic text-(--accent-secondary)"
                    : "text-(--bg-primary)"
                }
              >
                {line}
              </span>
            </span>
          ))}
        </Heading>
        <p className="max-w-2xl text-base leading-relaxed text-(--bg-primary)/80 md:text-xl">
          {slide.description}
        </p>
      </div>
    </div>
  );
}
