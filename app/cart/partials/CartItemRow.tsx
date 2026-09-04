"use client";

import Image from "next/image";
import Link from "next/link";
import type { CartItem } from "@/interface/cart";
import { cartItemTotal } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { useCartStore } from "@/stores/cart";

export default function CartItemRow({ item }: { item: CartItem }) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  return (
    <li className="flex items-center gap-4 border border-(--border-primary) bg-(--bg-surface) p-3">
      {item.image ? (
        <Image
          src={item.image.url}
          alt={item.image.altText ?? item.title}
          width={64}
          height={64}
          sizes="64px"
        />
      ) : (
        <div className="h-16 w-16 border border-dashed border-(--border-primary)" />
      )}
      <div className="flex flex-1 flex-col">
        <Link href={`/products/${item.productHandle}`}>{item.title}</Link>
        {item.variantTitle !== "Default Title" && (
          <span className="text-sm text-(--text-secondary)">
            {item.variantTitle}
          </span>
        )}
        <span className="text-sm">{formatMoney(cartItemTotal(item))}</span>
      </div>

      <div className="flex items-center border border-(--border-primary)">
        <button
          type="button"
          aria-label={`Restar cantidad a ${item.title}`}
          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
          className="p-2"
        >
          −
        </button>
        <span className="w-8 text-center tabular-nums">{item.quantity}</span>
        <button
          type="button"
          aria-label={`Sumar cantidad a ${item.title}`}
          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
          className="p-2"
        >
          +
        </button>
      </div>

      <button
        type="button"
        aria-label={`Eliminar ${item.title} del carrito`}
        onClick={() => removeItem(item.variantId)}
        className="p-2 text-(--text-secondary) hover:text-(--semantic-error)"
      >
        Eliminar
      </button>
    </li>
  );
}
