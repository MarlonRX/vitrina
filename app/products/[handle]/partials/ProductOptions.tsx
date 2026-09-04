"use client";

import { useMemo, useState } from "react";
import type { Product, ProductVariant } from "@/lib/shopify/types";
import ProductPrice from "@/components/products/ProductPrice";
import AddToCartButton from "./AddToCartButton";

function buildInitialSelection(variant: ProductVariant | undefined) {
  const initial: Record<string, string> = {};
  variant?.selectedOptions.forEach((option) => {
    initial[option.name] = option.value;
  });
  return initial;
}

export default function ProductOptions({ product }: { product: Product }) {
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
    <div className="flex flex-col gap-4">
      {product.options.map((option) => (
        <label key={option.name} className="flex flex-col gap-1">
          <span className="text-sm text-(--text-secondary)">{option.name}</span>
          <select
            value={selected[option.name] ?? option.values[0]}
            onChange={(event) =>
              setSelected((prev) => ({
                ...prev,
                [option.name]: event.target.value,
              }))
            }
            className="h-10 border border-(--border-primary) bg-(--bg-surface) px-2"
          >
            {option.values.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      ))}

      {variant && (
        <ProductPrice
          price={variant.price}
          compareAtPrice={variant.compareAtPrice}
        />
      )}

      <AddToCartButton product={product} variant={variant} />
    </div>
  );
}
