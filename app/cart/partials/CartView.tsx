"use client";

import Link from "next/link";
import { useHydrated } from "@/lib/hooks";
import { useCartStore } from "@/stores/cart";
import CartItemRow from "./CartItemRow";
import CartSummary from "./CartSummary";

export default function CartView() {
  const hydrated = useHydrated();
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);

  if (!hydrated) {
    return <p>Cargando carrito...</p>;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-2">
        <p>Tu carrito está vacío.</p>
        <Link href="/products" className="underline">
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <CartItemRow key={item.variantId} item={item} />
        ))}
      </ul>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={clear}
          className="text-sm text-(--text-secondary) underline"
        >
          Vaciar carrito
        </button>
      </div>
      <CartSummary />
    </div>
  );
}
