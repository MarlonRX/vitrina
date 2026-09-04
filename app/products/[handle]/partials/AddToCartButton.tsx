"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import MyButton from "@/components/UIComponents/MyButton";
import type { Product, ProductVariant } from "@/lib/shopify/types";
import { useCartStore } from "@/stores/cart";

type AddToCartButtonProps = {
  product: Product;
  variant: ProductVariant | null;
};

export default function AddToCartButton({
  product,
  variant,
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);

  const disabled = !variant?.availableForSale || !product.availableForSale;

  function handleAdd() {
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
      quantity,
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center border border-(--border-primary)">
        <button
          type="button"
          aria-label="Restar cantidad"
          disabled={quantity <= 1}
          onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
          className="p-2 disabled:opacity-50"
        >
          <Minus size={16} />
        </button>
        <span className="w-8 text-center tabular-nums">{quantity}</span>
        <button
          type="button"
          aria-label="Sumar cantidad"
          onClick={() => setQuantity((prev) => prev + 1)}
          className="p-2"
        >
          <Plus size={16} />
        </button>
      </div>

      <MyButton
        onClick={handleAdd}
        disabled={disabled}
        className="flex-1"
      >
        {disabled ? "Agotado" : "Agregar al carrito"}
      </MyButton>
    </div>
  );
}
