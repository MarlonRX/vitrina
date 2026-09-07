import type { Money } from "@/lib/shopify/types";

// S-14o: locale FIJO en "es". Con `undefined` el navegador resolvía su
// propio idioma (Chrome en inglés → "US$ 45,00") mientras el servidor Node
// renderizaba "45,00 US$" — esa diferencia rompía la hidratación de React
// en cada ficha de producto. Locale explícito + misma ICU = mismo string
// en SSR y en cliente.
export function formatMoney(money: Money): string {
  return new Intl.NumberFormat("es", {
    style: "currency",
    currency: money.currencyCode,
  }).format(Number(money.amount));
}
