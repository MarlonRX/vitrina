import Decimal from "decimal.js";
import type { CartItem } from "@/interface/cart";
import type { Money } from "@/lib/shopify/types";

export function cartCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function cartSubtotal(items: CartItem[]): Money {
  const currencyCode = items[0]?.price.currencyCode ?? "USD";
  const amount = items.reduce(
    (total, item) =>
      total.plus(new Decimal(item.price.amount).times(item.quantity)),
    new Decimal(0),
  );
  return { amount: amount.toFixed(2), currencyCode };
}

export function cartItemTotal(item: CartItem): Money {
  return {
    amount: new Decimal(item.price.amount).times(item.quantity).toFixed(2),
    currencyCode: item.price.currencyCode,
  };
}
