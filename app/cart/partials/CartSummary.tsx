"use client";

import { cartCount, cartSubtotal } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { useCartStore } from "@/stores/cart";

export default function CartSummary() {
  const items = useCartStore((state) => state.items);
  const count = cartCount(items);

  return (
    <div className="flex items-center justify-between border-t border-(--border-primary) pt-4">
      <span className="text-(--text-secondary)">
        {count} artículo{count === 1 ? "" : "s"}
      </span>
      <span>Subtotal: {formatMoney(cartSubtotal(items))}</span>
    </div>
  );
}
