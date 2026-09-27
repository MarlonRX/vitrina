import Image from "next/image";
import Link from "next/link";
import type { Collection } from "@/lib/shopify/types";
import Breadcrumbs from "@/components/Breadcrumbs";
import StateView from "@/components/StateView";
import { BentoCard, BentoGrid } from "@/components/reactbits/MagicBento";
import ShinyText from "@/components/reactbits/ShinyText";
import { Reveal } from "@/components/ui/Reveal";

export default function ClientCollections({
  collections,
  apiError = false,
}: {
  collections: Collection[];
  apiError?: boolean;
}) {
  return (
    // S-14d: sin max-w propio — aprovecha el contenedor del layout — y
    // encabezado centrado sobre la grilla para que la página se lea balanceada.
    <main className="mx-auto flex w-full flex-col gap-6 py-2">
      <div className="flex flex-col items-center gap-2 text-center">
        <Breadcrumbs
          items={[{ label: "Inicio", href: "/" }, { label: "Colecciones" }]}
        />
        <ShinyText
          text="La vitrina por dentro"
          speed={4}
          className="text-xs font-semibold uppercase tracking-[0.35em] md:text-sm"
        />
        <h1 className="text-3xl md:text-4xl">Colecciones</h1>
        <p className="max-w-md text-sm text-(--text-secondary)">
          Categorías de la vitrina, cada una con su propio carácter artesanal.
        </p>
      </div>
      {apiError ? (
        <StateView
          variant="error"
          title="No pudimos cargar las colecciones"
          description="La tienda no respondió correctamente. Puede ser temporal; inténtalo otra vez."
          retry
        />
      ) : collections.length === 0 ? (
        <StateView
          variant="empty"
          title="Todavía no hay colecciones"
          description="Estamos preparando las categorías de la tienda. Mientras tanto puedes ver todos los productos."
          action={{ label: "Ver catálogo", href: "/products" }}
        />
      ) : (
        // S-14q: grilla por consultas de contenedor (igual que el catálogo):
        // 2 columnas en teléfono, 3 desde 640px de ancho útil. El `@container`
        // va en el envoltorio: un elemento no se consulta a sí mismo.
        // S-17 (React Bits): el envoltorio es el BentoGrid - spotlight global
        // y glow por tarjeta que siguen al cursor; cada ficha es BentoCard
        // (partículas + ripple al clic) con revelado escalonado.
        <BentoGrid className="@container mx-auto w-full max-w-5xl">
        <ul className="grid grid-cols-2 gap-4 @min-[640px]:grid-cols-3">
          {collections.map((collection, index) => (
            <li key={collection.id} className="h-full">
              <Reveal delay={index * 70} className="h-full">
                <BentoCard
                  enableStars
                  clickEffect
                  className="h-full rounded-md border border-(--border-primary) bg-(--bg-surface) transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-(--accent-primary)/40 hover:shadow-lg"
                >
              <Link
                href={`/collections/${collection.handle}`}
                className="group/col flex h-full flex-col gap-1 overflow-hidden"
              >
                {/* S-14c: cada colección luce su foto aprobada (CDN de la
                    tienda); sin imagen, caja punteada como en las fichas. */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-(--bg-secondary)">
                  {collection.image ? (
                    <Image
                      src={collection.image.url}
                      alt={collection.image.altText ?? collection.title}
                      fill
                      sizes="(min-width: 768px) 25vw, 50vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover/col:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center border border-dashed border-(--border-primary) text-sm text-(--text-tertiary)">
                      Sin imagen
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1 p-3">
                  <h2 className="text-base">{collection.title}</h2>
                  <p className="line-clamp-2 text-sm text-(--text-secondary)">
                    {collection.description}
                  </p>
                </div>
              </Link>
                </BentoCard>
              </Reveal>
            </li>
          ))}
        </ul>
        </BentoGrid>
      )}
    </main>
  );
}
