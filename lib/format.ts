import type { Money } from "@/lib/shopify/types";

export function formatMoney(money: Money): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: money.currencyCode,
  }).format(Number(money.amount));
}
