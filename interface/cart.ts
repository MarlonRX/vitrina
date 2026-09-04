import type { Image, Money } from "@/lib/shopify/types";

export type CartItem = {
  variantId: string;
  productId: string;
  productHandle: string;
  title: string;
  variantTitle: string;
  price: Money;
  image: Image | null;
  quantity: number;
};
