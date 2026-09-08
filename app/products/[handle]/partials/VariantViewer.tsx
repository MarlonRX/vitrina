"use client";

// S-14: la selección de opciones y la galería comparten estado. Cada variante
// (cada Color) tiene su propia imagen anexada vía productVariantAppendMedia;
// al elegir un color, la imagen grande salta a la silueta de ese color.
import { useMemo, useState } from "react";
import type { Product, ProductVariant } from "@/lib/shopify/types";
import StateView from "@/components/StateView";
import { MySelect } from "@/components/UIComponents/MySelect";
import ProductPrice from "@/components/products/ProductPrice";
import AddToCartButton from "./AddToCartButton";
import ProductGallery from "./ProductGallery";

function buildInitialSelection(variant: ProductVariant | undefined) {
  const initial: Record<string, string> = {};
  variant?.selectedOptions.forEach((option) => {
    initial[option.name] = option.value;
  });
  return initial;
}

export default function VariantViewer({ product }: { product: Product }) {
  const variants = useMemo(
    () => product.variants.edges.map((edge) => edge.node),
    [product.variants.edges],
  );

  const [selected, setSelected] = useState<Record<string, string>>(() =>
    buildInitialSelection(variants[0]),
  );

  const variant = useMemo(
    () =>
      variants.find((candidate) =>
        candidate.selectedOptions.every(
          (option) => selected[option.name] === option.value,
        ),
      ) ?? null,
    [variants, selected],
  );

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <ProductGallery
        images={product.images.edges.map((edge) => edge.node)}
        alt={product.title}
        activeUrl={variant?.image?.url ?? null}
      />
      <div className="flex flex-col gap-4">
        <h1>{product.title}</h1>
        <p className="text-sm text-(--text-secondary)">{product.vendor}</p>
        {product.availableForSale ? (
          <div className="flex flex-col gap-4">
            {/* S-11: los <select> crudos de variantes ahora son MySelect. */}
            {product.options.map((option) => (
              <MySelect
                key={option.name}
                label={option.name}
                value={selected[option.name] ?? option.values[0]}
                onChange={(event) =>
                  setSelected((prev) => ({
                    ...prev,
                    [option.name]: event.target.value,
                  }))
                }
                options={option.values.map((value) => ({ value, label: value }))}
              />
            ))}
            {variant && (
              <ProductPrice
                price={variant.price}
                compareAtPrice={variant.compareAtPrice}
              />
            )}
            {/* S-14q: en móvil el CTA queda pegado al borde inferior (con
                precio siempre a mano) hasta que el usuario agrega; en md+
                vuelve a su flujo normal. */}
            <div className="sticky bottom-2 z-30 -mx-2 px-2 pt-2 md:static md:p-0">
              <div className="rounded-lg border border-(--border-primary) bg-(--bg-surface)/95 p-2 shadow-lg backdrop-blur-sm md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none">
                <AddToCartButton product={product} variant={variant} />
              </div>
            </div>
          </div>
        ) : (
          <StateView
            variant="out-of-stock"
            title="Producto agotado"
            description="No quedan unidades de este producto por ahora. Vuelve pronto o mira alternativas parecidas en el catálogo."
            action={{ label: "Ver catálogo", href: "/products" }}
          />
        )}
      </div>
    </div>
  );
}
