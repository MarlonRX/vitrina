"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import MyButton from "@/components/UIComponents/MyButton";
import { cartCount, cartItemTotal, cartSubtotal } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import type { CartItem } from "@/interface/cart";
import { useCartStore } from "@/stores/cart";

// S-16 (`specs/13-s16-checkout-demo.md`): confirmación de pedido SINTÉTICA.
// Se muestra en lugar del redirect a Shopify cuando NEXT_PUBLIC_DEMO_CHECKOUT
// está activo: la tienda de demo está protegida con storefront password
// ("not ready for sales") y el visitante anónimo caería en /password en
// pleno paso final. Aquí no se cobra nada: CheckoutSummary congela el
// snapshot del carrito ANTES de vaciarlo; este recibo solo pinta.
//
// NB hidratación: `orderId` nace en el inicializador perezoso de useState y
// Math.random corre solo tras el click del usuario, nunca en un render de
// servidor → cero mismatch posible.

function syntheticOrderId(): string {
  const n = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .toUpperCase()
    .padStart(6, "0");
  return `DEMO-${n}`;
}

export default function CheckoutDemoReceipt({
  order,
  onDone,
}: {
  /** Snapshot del carrito en el momento de "finalizar compra". */
  order: CartItem[];
  /** Volver al estado normal del resumen (y vaciar el carrito store). */
  onDone: () => void;
}) {
  const [orderId] = useState(syntheticOrderId);
  const [note, setNote] = useState("");
  const clear = useCartStore((state) => state.clear);

  function handleDone() {
    clear();
    onDone();
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col gap-4 border border-(--semantic-success)/40 bg-(--bg-surface) p-4"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-(--semantic-success)/50 text-(--semantic-success)">
          <Check className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-(--text-primary)">
            ¡Gracias por tu compra!
          </h2>
          <p className="text-sm text-(--text-secondary)">
            Pedido <span className="font-medium">{orderId}</span> ·{" "}
            {cartCount(order)} artículo{cartCount(order) === 1 ? "" : "s"} ·{" "}
            {formatMoney(cartSubtotal(order))}
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-2 border-t border-(--border-primary) pt-3">
        {order.map((item) => (
          <li
            key={item.variantId}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="min-w-0 truncate text-(--text-primary)">
              {item.quantity} × {item.title}
            </span>
            <span className="shrink-0 tabular-nums text-(--text-secondary)">
              {formatMoney(cartItemTotal(item))}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2">
        <label htmlFor="demo-note" className="text-xs text-(--text-tertiary)">
          Notas para el pedido (opcional)
        </label>
        <textarea
          id="demo-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={2}
          placeholder="Ej.: envolver para regalo"
          className="resize-y border border-(--border-primary) bg-(--bg-base) px-2 py-1.5 text-sm text-(--text-primary)"
        />
      </div>

      <p className="text-xs text-(--text-tertiary)">
        Demo: no se realizó ningún cargo ni se guardó ningún pedido.
      </p>

      <MyButton variant="outline" className="w-full" onClick={handleDone}>
        Seguir explorando
      </MyButton>
    </div>
  );
}
