import Link from "next/link";
import Aurora from "@/components/reactbits/Aurora";
import SplitText from "@/components/reactbits/SplitText";
import StarBorder from "@/components/reactbits/StarBorder";
import ShinyText from "@/components/reactbits/ShinyText";

// S-17 (rework React Bits): el 404 deja de ser un texto pelado - aurora de
// fondo en colores de marca, titular revelado letra a letra y CTA con borde
// de cometas.
export default function NotFound() {
  return (
    <main className="relative flex min-h-[70vh] w-full flex-col items-center justify-center gap-6 overflow-hidden px-4 py-24 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
      >
        <Aurora
          colorStops={["#8c2f3a", "#c08a2e", "#8c2f3a"]}
          amplitude={1.1}
          blend={0.6}
          speed={0.5}
        />
      </div>
      <ShinyText
        text="404 — pieza perdida"
        speed={3}
        color="var(--text-tertiary)"
        shineColor="var(--accent-primary)"
        className="relative text-xs font-semibold uppercase tracking-[0.35em] md:text-sm"
      />
      <h1 className="relative max-w-3xl text-4xl font-bold md:text-6xl">
        <SplitText text="Esto ya no está en la vitrina" delay={28} />
      </h1>
      <p className="relative max-w-md text-(--text-secondary)">
        La página que buscas se movió, se vendió o nunca existió. El catálogo
        sigue vivo al otro lado del cristal.
      </p>
      <StarBorder
        as={Link}
        href="/"
        color="var(--accent-primary)"
        speed="5s"
        backgroundColor="var(--bg-surface)"
        className="relative rounded-md"
      >
        Volver al inicio
      </StarBorder>
    </main>
  );
}
