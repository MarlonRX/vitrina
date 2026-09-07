"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/stores/cart";

// S-01: mensaje al volver de Shopify por cancelUrl (checkout_url) o
// successUrl (return_url): /cart?checkout=cancel|success.
export default function CheckoutStatusBanner() {
  const searchParams = useSearchParams();
  const status = searchParams.get("checkout");
  const clear = useCartStore((state) => state.clear);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (status === "success") {
      // El pedido se pagó en Shopify: el carrito local ya no aplica.
      clear();
    }
  }, [status, clear]);

  if (!status || dismissed) {
    return null;
  }

  if (status === "success") {
    return (
      // S-10: role=status hace que el lector de pantalla anuncie el resultado
      // al llegar de Shopify (WCAG 4.1.3); antes era texto mudo.
      <div
        role="status"
        className="flex items-center justify-between gap-3 border border-(--border-primary) bg-(--bg-surface) p-3 text-sm"
      >
        <span>¡Gracias por tu compra! El pedido se completó en Shopify.</span>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-(--text-secondary) underline"
        >
          Cerrar
        </button>
      </div>
    );
  }

  if (status === "cancel") {
    return (
      <div
        role="status"
        className="flex items-center justify-between gap-3 border border-(--border-primary) bg-(--bg-surface) p-3 text-sm"
      >
        <span>
          Volviste de Shopify sin completar el pago; tu carrito sigue intacto.
        </span>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-(--text-secondary) underline"
        >
          Cerrar
        </button>
      </div>
    );
  }

  return null;
}
