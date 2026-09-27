"use client";

// S-17 (rework React Bits): colecciones de la home en bento mágico -
// spotlight global, glow que sigue al cursor y partículas en hover
// (MagicBento), con revelado escalonado al hacer scroll (Reveal).
import Image from "next/image";
import Link from "next/link";
import { BentoCard, BentoGrid } from "@/components/reactbits/MagicBento";
import ShinyText from "@/components/reactbits/ShinyText";
import StarBorder from "@/components/reactbits/StarBorder";
import { Reveal } from "@/components/ui/Reveal";
import type { Collection } from "@/lib/shopify/types";

export default function CollectionsBento({
  collections,
}: {
  collections: Collection[];
}) {
  if (collections.length === 0) return null;

  return (
    <section aria-labelledby="colecciones-home" className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <ShinyText
          text="Explora por colección"
          speed={4}
          className="text-xs font-semibold uppercase tracking-[0.35em] md:text-sm"
        />
        <h2 id="colecciones-home" className="text-2xl md:text-3xl">
          Cada oficio, su vitrina
        </h2>
      </div>
      <BentoGrid className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {collections.map((collection, index) => (
          <Reveal key={collection.id} delay={index * 80} className="h-full">
            <BentoCard
              enableStars
              clickEffect
              className="h-full rounded-md border border-(--border-primary) bg-(--bg-surface)"
            >
              <Link
                href={`/collections/${collection.handle}`}
                className="group/col flex h-full flex-col gap-1"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-(--bg-secondary)">
                  {collection.image ? (
                    <Image
                      src={collection.image.url}
                      alt={collection.image.altText ?? collection.title}
                      fill
                      sizes="(min-width: 768px) 20vw, 45vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover/col:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center border border-dashed border-(--border-primary) text-sm text-(--text-tertiary)">
                      Sin imagen
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1 p-3">
                  <h3 className="text-base">{collection.title}</h3>
                  <p className="line-clamp-2 text-sm text-(--text-secondary)">
                    {collection.description}
                  </p>
                </div>
              </Link>
            </BentoCard>
          </Reveal>
        ))}
      </BentoGrid>
      <div className="flex justify-center">
        <StarBorder
          as={Link}
          href="/collections"
          color="var(--accent-primary)"
          speed="6s"
          className="rounded-md"
        >
          Ver todas las colecciones
        </StarBorder>
      </div>
    </section>
  );
}
