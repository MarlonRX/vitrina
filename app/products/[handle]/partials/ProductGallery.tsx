"use client";

import { useState } from "react";
import Image from "next/image";
import type { Image as ShopifyImage } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: ShopifyImage[];
  alt: string;
  /** S-14: URL de la imagen de la variante seleccionada (cambia el color). */
  activeUrl?: string | null;
};

// S-14: Shopify sirve la imagen de cada variante con su propia firma de
// versión (?v=…) distinta a la del listado; se comparan solo las rutas.
function norm(u: string) {
  try {
    return new URL(u).pathname;
  } catch {
    return u;
  }
}

export default function ProductGallery({ images, alt, activeUrl }: ProductGalleryProps) {
  const variantUrl = activeUrl ?? null;

  // Índice elegido a mano, junto con el color que estaba activo al elegirlo.
  // Si el color CAMBIA desde ese clic, el selector manda y el visor salta al
  // swatch del color nuevo; mientras el color sea el mismo, el usuario navega
  // libremente con las miniaturas (sin bucles de estado ni efectos).
  const [manual, setManual] = useState<{ forUrl: string | null; index: number }>({
    forUrl: null,
    index: 0,
  });

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center border border-dashed border-(--border-primary) text-sm text-(--text-tertiary)">
        Sin imágenes
      </div>
    );
  }

  let activeIndex: number;
  if (manual.forUrl === variantUrl) {
    activeIndex = manual.index;
  } else {
    const idx = variantUrl
      ? images.findIndex((image) => norm(image.url) === norm(variantUrl))
      : -1;
    activeIndex = idx >= 0 ? idx : 0;
  }
  const active = images[activeIndex] ?? images[0];

  const activeSrc = active.url;

  return (
    <div className="flex flex-col gap-2">
      <Image
        key={activeSrc}
        src={activeSrc}
        alt={active.altText ?? alt}
        width={1200}
        height={1200}
        // S-14o: la ficha ahora usa todo el contenedor; 600px se veía pixelado
        // en pantallas grandes.
        sizes="(min-width: 768px) 42vw, 100vw"
        loading="eager"
        fetchPriority="high"
      />
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setManual({ forUrl: variantUrl, index })}
              aria-label={`Ver imagen ${index + 1} de ${alt}`}
              className={cn(
                // S-11: miniaturas con el radio del sistema; la activa se
                // marca con anillo de acento en vez de doble borde.
                "overflow-hidden rounded-md transition-[box-shadow,transform]",
                "hover:-translate-y-0.5 hover:shadow-md",
                index === activeIndex
                  ? "shadow-[0_0_0_2px_var(--accent-primary)]"
                  : "opacity-70 hover:opacity-100",
              )}
            >
              <Image src={image.url} alt="" width={64} height={64} sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
