import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/shopify/types";
import ProductPrice from "./ProductPrice";

export default function ProductCard({
  product,
  eager = false,
}: {
  product: Product;
  eager?: boolean;
}) {
  // Todas las fichas miden igual "sin importar qué": el alto queda totalmente
  // determinado por el ancho del contenedor (imagen cuadrada + título de dos
  // líneas exactas + precio de una línea) y `overflow-hidden` garantiza que
  // ningún contenido largo pueda estirar la caja.
  return (
    <article className="flex w-full flex-col gap-3 overflow-hidden border border-(--border-primary) bg-(--bg-surface) p-3 rounded-xs">
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
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center border border-dashed border-(--border-primary) text-sm text-(--text-tertiary)">
              Sin imagen
            </div>
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
      <div className="mt-auto flex min-h-[1.6em] shrink-0 flex-col gap-1 [&_p]:mb-0 [&_p]:whitespace-nowrap [&_p]:overflow-hidden">
        <ProductPrice
          price={product.priceRange.minVariantPrice}
          maxPrice={product.priceRange.maxVariantPrice}
        />
      </div>
    </article>
  );
}
