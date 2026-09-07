"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Check, Plus } from "lucide-react";
import type { Product } from "@/lib/shopify/types";
import { useCartStore } from "@/stores/cart";
import { useToastStore } from "@/stores/toast";
import { cn } from "@/lib/utils";
import ProductPrice from "./ProductPrice";

export default function ProductCard({
  product,
  eager = false,
}: {
  product: Product;
  eager?: boolean;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const showToast = useToastStore((state) => state.show);
  const [added, setAdded] = useState(false);

  // S-14: agrega rápido — primer variante disponible (cada color es su
  // variante; el detalle permite elegir el exacto).
  const variant =
    product.variants.edges.map((edge) => edge.node).find((v) => v.availableForSale) ?? null;

  function handleAdd(event: React.MouseEvent) {
    // S-14o: el botón vive DENTRO del <Link> de la ficha; sin cortar el
    // evento, el clic también navigaba al detalle del producto.
    event.preventDefault();
    event.stopPropagation();
    if (!variant) return;
    addItem(
      {
        variantId: variant.id,
        productId: product.id,
        productHandle: product.handle,
        title: product.title,
        variantTitle: variant.title,
        price: variant.price,
        image: variant.image ?? product.featuredImage,
      },
      1,
    );
    setAdded(true);
    // S-14o: aviso flotante en lugar de abrir el drawer/detalle.
    showToast(`${product.title} fue agregado al carrito`);
    window.setTimeout(() => setAdded(false), 1400);
  }

  // Todas las fichas miden igual "sin importar qué": el alto queda totalmente
  // determinado por el ancho del contenedor (imagen cuadrada + título de dos
  // líneas exactas + precio de una línea) y `overflow-hidden` garantiza que
  // ningún contenido largo pueda estirar la caja.
  return (
    <article className="group/card flex w-full flex-col gap-3 overflow-hidden border border-(--border-primary) bg-(--bg-surface) p-3 rounded-xs transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-(--accent-primary)/40 hover:shadow-lg">
      <Link
        href={`/products/${product.handle}`}
        aria-label={product.title}
        className="flex shrink-0 flex-col gap-3"
      >
        <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-(--bg-secondary)">
          {product.featuredImage ? (
            <Image
              src={product.featuredImage.url}
              alt={product.featuredImage.altText ?? product.title}
              fill
              sizes="(min-width: 1280px) 14vw, (min-width: 1024px) 16vw, (min-width: 768px) 20vw, (min-width: 640px) 25vw, 33vw"
              loading={eager ? "eager" : "lazy"}
              fetchPriority={eager ? "high" : undefined}
              // S-01.5 (hover reactivo): zoom lento de la foto dentro de la
              // caja recortada; la ficha se eleva (arriba, en el article).
              className="object-cover transition-transform duration-500 ease-out group-hover/card:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center border border-dashed border-(--border-primary) text-sm text-(--text-tertiary)">
              Sin imagen
            </div>
          )}

          {/* S-14c: agregado rápido como botón icono flotante. Solo aparece al
              pasar el cursor (o al recibir foco por teclado, manteniendo la
              accesibilidad); en móvil queda oculto — la ficha ya enlaza al
              detalle, donde vive el botón completo. */}
          {variant && (
            <button
              type="button"
              onClick={handleAdd}
              title={added ? "Agregado al carrito" : "Agregar al carrito"}
              aria-label={`Agregar ${product.title} al carrito`}
              className={cn(
                "absolute right-2 bottom-2 z-10 flex h-9 w-9 items-center justify-center rounded-full",
                "border border-(--border-primary) bg-(--bg-surface) text-(--text-primary)",
                "shadow-md transition-all duration-200",
                "opacity-0 translate-y-1 pointer-events-none",
                "group-hover/card:opacity-100 group-hover/card:translate-y-0 group-hover/card:pointer-events-auto",
                "focus-visible:opacity-100 focus-visible:translate-y-0 focus-visible:pointer-events-auto",
                "hover:border-(--accent-primary) hover:bg-(--accent-primary) hover:text-(--text-inverted)",
                added &&
                  "opacity-100 translate-y-0 pointer-events-auto border-(--accent-primary) bg-(--accent-primary) text-(--text-inverted)",
              )}
            >
              {added ? (
                <Check size={16} aria-hidden />
              ) : (
                <Plus size={16} aria-hidden />
              )}
            </button>
          )}
        </div>
        <h3 className="line-clamp-2 min-h-[2lh] shrink-0">
          {product.title}
          {!product.availableForSale && (
            <span className="ml-1 text-xs text-(--text-tertiary)">
              Agotado
            </span>
          )}
        </h3>
      </Link>
      <div className="mt-auto flex min-h-[1.6em] shrink-0 items-center justify-between gap-2 [&_p]:mb-0 [&_p]:whitespace-nowrap [&_p]:overflow-hidden">
        <ProductPrice
          price={product.priceRange.minVariantPrice}
          maxPrice={product.priceRange.maxVariantPrice}
        />
      </div>
    </article>
  );
}
