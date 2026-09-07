"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import type { CartItem } from "@/interface/cart";
import { cartItemTotal } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { useCartStore } from "@/stores/cart";
import MyButton from "@/components/UIComponents/MyButton";
import { MyQuantityStepper } from "@/components/UIComponents/MyQuantityStepper";

export default function CartItemRow({ item }: { item: CartItem }) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  return (
    <li className="flex items-center gap-4 rounded-lg border border-(--border-primary) bg-(--bg-surface) p-3 transition-[border-color,box-shadow] duration-300 hover:border-(--border-secondary) hover:shadow-sm">
      {item.image ? (
        <Image
          src={item.image.url}
          alt={item.image.altText ?? item.title}
          width={64}
          height={64}
          sizes="64px"
          className="rounded-md object-cover"
        />
      ) : (
        <div className="h-16 w-16 rounded-md border border-dashed border-(--border-primary)" />
      )}
      <div className="flex flex-1 flex-col">
        <Link
          href={`/products/${item.productHandle}`}
          className="font-medium hover:text-(--accent-primary)"
        >
          {item.title}
        </Link>
        {item.variantTitle !== "Default Title" && (
          <span className="text-sm text-(--text-secondary)">
            {item.variantTitle}
          </span>
        )}
        <span className="text-sm tabular-nums">
          {formatMoney(cartItemTotal(item))}
        </span>
      </div>

      {/* S-11: stepper del sistema (min=0: en cero se elimina la línea). */}
      <MyQuantityStepper
        size="sm"
        min={0}
        value={item.quantity}
        ariaLabelSuffix={` ${item.title}`}
        onChange={(next) =>
          next <= 0 ? removeItem(item.variantId) : updateQuantity(item.variantId, next)
        }
      />

      <MyButton
        variant="ghost"
        size="icon"
        aria-label={`Eliminar ${item.title} del carrito`}
        onClick={() => removeItem(item.variantId)}
        className="text-(--text-secondary) hover:text-[rgb(var(--semantic-error-rgb))]"
      >
        <Trash2 size={16} aria-hidden />
      </MyButton>
    </li>
  );
}
