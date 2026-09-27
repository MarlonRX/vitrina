"use client";

// S-17 (rework React Bits): banda "manifiesto" full-bleed sobre burdeos con
// aurora WebGL de fondo, cifras en CountUp, titular en SplitText, chispas al
// clic (ClickSpark) y CTA con borde de cometas (StarBorder).
import Link from "next/link";
import Aurora from "@/components/reactbits/Aurora";
import ClickSpark from "@/components/reactbits/ClickSpark";
import CountUp from "@/components/reactbits/CountUp";
import ShinyText from "@/components/reactbits/ShinyText";
import SplitText from "@/components/reactbits/SplitText";
import StarBorder from "@/components/reactbits/StarBorder";

const STATS = [
  { to: 150, suffix: "+", label: "piezas en el catálogo" },
  { to: 12, suffix: "", label: "talleres colaboradores" },
  { to: 48, suffix: " h", label: "despacho a todo el país" },
];

export default function AuroraBand() {
  return (
    <section
      aria-label="Vitrina en cifras"
      className="relative ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] overflow-hidden bg-(--accent-hover)"
    >
      {/* Aurora sobre el burdeos: crema → burdeos → oro, lenta y ancha. */}
      <div aria-hidden className="absolute inset-0 opacity-70">
        <Aurora
          colorStops={["#efe7db", "#8c2f3a", "#c08a2e"]}
          amplitude={1.15}
          blend={0.55}
          speed={0.55}
        />
      </div>
      {/* Scrim para que el texto crema lea sobre la aurora. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_10%,rgba(23,12,14,0.15)_0%,rgba(23,12,14,0.55)_100%)]"
      />
      <ClickSpark
        sparkColor="#efe7db"
        sparkSize={9}
        sparkRadius={18}
        className="relative z-1 mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-6 py-20 text-center md:w-[80%] md:py-28"
      >
        <ShinyText
          text="La casa Vitrina"
          speed={4}
          color="rgba(239,231,219,0.6)"
          shineColor="#efe7db"
          className="text-xs font-semibold uppercase tracking-[0.35em] md:text-sm"
        />
        <h2 className="max-w-3xl text-3xl font-bold text-(--bg-primary) md:text-5xl">
          <SplitText
            text="Selección viva de diseño y artesanía"
            delay={24}
            duration={0.55}
          />
        </h2>
        <dl className="grid w-full grid-cols-1 gap-8 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <dt className="text-sm text-(--bg-primary)/70">{stat.label}</dt>
              <dd className="font-financial text-4xl font-bold text-(--bg-primary) md:text-5xl">
                <CountUp to={stat.to} duration={1.4} />
                {stat.suffix}
              </dd>
            </div>
          ))}
        </dl>
        <StarBorder
          as={Link}
          href="/products"
          color="#efe7db"
          speed="5s"
          backgroundColor="rgba(23,12,14,0.35)"
          textColor="#efe7db"
          borderColor="rgba(239,231,219,0.4)"
          className="rounded-md"
        >
          Ver el catálogo
        </StarBorder>
      </ClickSpark>
    </section>
  );
}
