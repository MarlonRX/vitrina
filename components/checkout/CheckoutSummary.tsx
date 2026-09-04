"use client";

import MyButton from "@/components/UIComponents/MyButton";
import { cartCount, cartSubtotal } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { useHydrated } from "@/lib/hooks";
import { useCartStore } from "@/stores/cart";

export default function CheckoutSummary() {
  const hydrated = useHydrated();
  const items = useCartStore((state) => state.items);

  if (!hydrated) {
    return <p>Cargando resumen...</p>;
  }

  const subtotal = cartSubtotal(items);
  const empty = items.length === 0;

  return (
    <section className="flex flex-col gap-3 border border-(--border-primary) bg-(--bg-surface) p-4">
      <h2 className="text-lg">Resumen del pedido</h2>
      <div className="flex justify-between">
        <span className="text-(--text-secondary)">
          {cartCount(items)} artículo{cartCount(items) === 1 ? "" : "s"}
        </span>
        <span>{empty ? "—" : formatMoney(subtotal)}</span>
      </div>
      <p className="text-sm text-(--text-secondary)">
        Impuestos y gastos de envío se calculan al finalizar la compra.
      </p>
      <MyButton disabled={empty} className="w-full">
        Finalizar compra
      </MyButton>
    </section>
  );
}
