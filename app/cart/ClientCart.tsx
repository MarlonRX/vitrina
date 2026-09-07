import { Suspense } from "react";
import CheckoutStatusBanner from "@/components/checkout/CheckoutStatusBanner";
import CheckoutSummary from "@/components/checkout/CheckoutSummary";
import CartView from "./partials/CartView";

export default function ClientCart() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <h1>Carrito</h1>
      {/* useSearchParams exige un límite de Suspense en prerender (Next 16). */}
      <Suspense fallback={null}>
        <CheckoutStatusBanner />
      </Suspense>
      <div className="grid gap-8 md:grid-cols-[1fr_320px]">
        <CartView />
        <CheckoutSummary />
      </div>
    </main>
  );
}
