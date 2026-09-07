import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";
import ClientCart from "./ClientCart";

export const metadata: Metadata = {
  title: "Carrito de compras",
  description:
    "Revisa los productos de tu carrito y finaliza tu compra en la tienda Vitrina.",
  alternates: { canonical: absoluteUrl("/cart") },
  // Superficie transaccional: no indexable.
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <ClientCart />;
}
