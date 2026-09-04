"use client";

import Link from "next/link";
import { ShoppingBasket } from "lucide-react";
import MyButton from "@/components/UIComponents/MyButton";
import { cartCount } from "@/lib/cart";
import { useHydrated } from "@/lib/hooks";
import { useCartStore } from "@/stores/cart";

export default function CartButton() {
  const hydrated = useHydrated();
  const items = useCartStore((state) => state.items);
  const count = hydrated ? cartCount(items) : 0;

  return (
    <Link href="/cart" aria-label="Ver carrito" className="relative">
      <MyButton
        type="button"
        variant="outline"
        leftIcon={<ShoppingBasket />}
        className="ml-1"
        tooltip="Ver carrito"
      />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-(--accent-primary) px-1 text-xs text-(--text-inverted)">
          {count}
        </span>
      )}
    </Link>
  );
}
