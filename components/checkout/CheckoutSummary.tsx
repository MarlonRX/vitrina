"use client";

import { useState } from "react";
import MyButton from "@/components/UIComponents/MyButton";
import StateView from "@/components/StateView";
import CheckoutDemoReceipt from "@/components/checkout/CheckoutDemoReceipt";
import { cartCount, cartSubtotal } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { useHydrated } from "@/lib/hooks";
import type { CartItem } from "@/interface/cart";
import { useCartStore } from "@/stores/cart";

// S-16: modo demo → "Finalizar compra" muestra un recibo sintético en lugar
// de redirigir al checkout de Shopify, que en esta tienda está cerrado con
// storefront password ("not ready for sales"). Activo POR DEFECTO (la demo
// pública no puede depender de una variable que vive en el panel de cada
// deploy): poner NEXT_PUBLIC_DEMO_CHECKOUT=0 para volver al flujo real de
// S-01 cuando la tienda se publique con plan de pago.
const DEMO_CHECKOUT = process.env.NEXT_PUBLIC_DEMO_CHECKOUT !== "0";

type CheckoutApiResponse = {
  checkoutUrl: string | null;
  mock: boolean;
  message?: string;
  error?: string;
};

export default function CheckoutSummary() {
  const hydrated = useHydrated();
  const items = useCartStore((state) => state.items);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // S-16: en modo demo, el "pedido" confirmado se guarda aquí (snapshot del
  // carrito ANTES de vaciarlo) para que el recibo no dependa del store vivo.
  const [demoOrder, setDemoOrder] = useState<CartItem[] | null>(null);

  if (!hydrated) {
    return <p>Cargando resumen...</p>;
  }

  const subtotal = cartSubtotal(items);
  const empty = items.length === 0;

  async function handleCheckout() {
    if (empty || loading) return;

    // S-16 (modo demo): no se toca Shopify ni la pasarela. Se congela el
    // carrito actual y se muestra el recibo sintético de inmediato.
    if (DEMO_CHECKOUT) {
      setDemoOrder(items);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      });
      const data = (await response.json()) as CheckoutApiResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo iniciar el checkout.");
      }
      if (data.mock) {
        throw new Error(
          data.message ?? "Checkout no disponible en modo mock.",
        );
      }
      if (!data.checkoutUrl) {
        throw new Error("Shopify no devolvió una URL de checkout.");
      }
      // S-01: redirige al checkout real de Shopify (con return_url/checkout_url).
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
      setLoading(false);
    }
  }

  return (
    <section className="flex flex-col gap-3 border border-(--border-primary) bg-(--bg-surface) p-4">
      {demoOrder ? (
        // S-16: recibo sintético del modo demo (el store se vacía aquí al
        // aceptar; el snapshot `demoOrder` queda intacto para el recibo).
        <CheckoutDemoReceipt order={demoOrder} onDone={() => setDemoOrder(null)} />
      ) : (
        <>
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
          <MyButton
            disabled={empty || loading}
            loading={loading}
            onClick={handleCheckout}
            className="w-full"
          >
            {loading ? "Preparando checkout..." : "Finalizar compra"}
          </MyButton>
          {DEMO_CHECKOUT ? (
            <p className="text-xs text-(--text-tertiary)">
              Versión de demostración: sin pasarela de pagos.
            </p>
          ) : null}
          {error ? (
            <StateView
              variant="error"
              title="No pudimos iniciar el checkout"
              description={error}
              onRetry={handleCheckout}
            />
          ) : null}
        </>
      )}
    </section>
  );
}
