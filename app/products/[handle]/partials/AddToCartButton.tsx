"use client";

import { useState } from "react";
import MyButton from "@/components/UIComponents/MyButton";
import { MyQuantityStepper } from "@/components/UIComponents/MyQuantityStepper";
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
      {/* S-11: stepper artesanal reemplazado por el componente del sistema. */}
      <MyQuantityStepper value={quantity} onChange={setQuantity} min={1} />

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
