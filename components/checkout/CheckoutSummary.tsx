"use client";

import { useState } from "react";
import MyButton from "@/components/UIComponents/MyButton";
import StateView from "@/components/StateView";
import { cartCount, cartSubtotal } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { useHydrated } from "@/lib/hooks";
import { useCartStore } from "@/stores/cart";

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

  if (!hydrated) {
    return <p>Cargando resumen...</p>;
  }

  const subtotal = cartSubtotal(items);
  const empty = items.length === 0;

  async function handleCheckout() {
    if (empty || loading) return;
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
      {error ? (
        <StateView
          variant="error"
          title="No pudimos iniciar el checkout"
          description={error}
          onRetry={handleCheckout}
        />
      ) : null}
    </section>
  );
}
