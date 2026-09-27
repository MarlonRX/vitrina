import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SplitText from "@/components/reactbits/SplitText";
import StarBorder from "@/components/reactbits/StarBorder";
import type { HeroSlide } from "./heroSlides";

/**
 * S-17 (rework del hero): columna de texto de la diapositiva activa sobre el
 * escenario oscuro. El padre la remonta con `key={index}` en cada avance, así
 * SplitText y los fade-up se re-disparan con la diapositiva entrante.
 */
export default function HeroSlideView({ slide }: { slide: HeroSlide }) {
  const lastLine = slide.titleLines.length - 1;

  return (
    <div className="flex max-w-xl flex-col items-start gap-6">
      <p className="flex animate-fade-up items-center gap-3 text-sm font-semibold uppercase tracking-[0.35em] text-(--bg-primary)/70 md:text-base">
        <span className="relative flex h-2 w-2" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--accent-secondary) opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-(--accent-secondary)" />
        </span>
        {slide.eyebrow}
      </p>

      <h1 className="text-5xl font-bold leading-[1.02] text-(--bg-primary) md:text-6xl xl:text-7xl">
        {slide.titleLines.map((line, lineIndex) => (
          <span key={line} className="block">
            {/* S-12: la última línea en cursiva Fraunces crema, firma
                editorial del sitio. */}
            <span
              className={
                lineIndex === lastLine
                  ? "italic text-(--accent-secondary)"
                  : undefined
              }
            >
              <SplitText text={line} delay={26} duration={0.55} />
            </span>
          </span>
        ))}
      </h1>

      <p
        className="max-w-md animate-fade-up text-base leading-relaxed text-(--bg-primary)/75 md:text-lg"
        style={{ animationDelay: "320ms" }}
      >
        {slide.description}
      </p>

      <div
        className="mt-2 flex animate-fade-up flex-wrap items-center gap-5"
        style={{ animationDelay: "460ms" }}
      >
        <StarBorder
          as={Link}
          href={slide.href}
          color="var(--accent-secondary)"
          speed="5s"
          backgroundColor="rgba(23,12,14,0.35)"
          textColor="#efe7db"
          borderColor="rgba(239,231,219,0.4)"
          className="rounded-md"
        >
          Ver colección
        </StarBorder>
        <Link
          href="/products"
          className="group inline-flex items-center gap-2 text-sm font-semibold text-(--bg-primary)/80 transition-colors hover:text-(--bg-primary)"
        >
          Todo el catálogo
          <ArrowRight
            size={15}
            aria-hidden
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>
    </div>
  );
}
