"use client";

import { useHydrated } from "@/lib/hooks";
import { useCartStore } from "@/stores/cart";
import MyButton from "@/components/UIComponents/MyButton";
import StateView from "@/components/StateView";
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
      <StateView
        variant="empty"
        title="Tu carrito está vacío"
        description="Aún no has añadido productos. Explora el catálogo y encuentra algo que te guste."
        action={{ label: "Ver productos", href: "/products" }}
      />
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
        {/* S-11: "Vaciar carrito" pasa al botón link del sistema. */}
        <MyButton
          variant="link"
          color="danger"
          size="sm"
          type="button"
          onClick={clear}
          className="text-(--text-secondary)"
        >
          Vaciar carrito
        </MyButton>
      </div>
      <CartSummary />
    </div>
  );
}
