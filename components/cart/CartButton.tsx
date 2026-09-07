"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ShoppingBasket, Trash2 } from "lucide-react";
import MyButton from "@/components/UIComponents/MyButton";
import MyDrawer from "@/components/UIComponents/MyDrawer";
import { MyQuantityStepper } from "@/components/UIComponents/MyQuantityStepper";
import StateView from "@/components/StateView";
import { cartCount, cartItemTotal, cartSubtotal } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { useHydrated } from "@/lib/hooks";
import { useCartStore } from "@/stores/cart";
import type { CartItem } from "@/interface/cart";

// S-01.5 (factor wow): la canasta del navbar ya no navega directo a /cart;
// abre este drawer-preview reutilizando MyDrawer (dialog nativo de S-09:
// trampa de foco y Escape gratis). Edición COMPLETA de cantidades y borrado,
// pero el checkout vive solo en /cart — el pie del drawer enlaza allí.

function PreviewRow({ item }: { item: CartItem }) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  return (
    <li className="flex items-center gap-3 border-b border-(--border-primary) py-3 last:border-b-0">
      {item.image ? (
        <Image
          src={item.image.url}
          alt={item.image.altText ?? item.title}
          width={56}
          height={56}
          sizes="56px"
          className="shrink-0 object-cover"
        />
      ) : (
        <div className="h-14 w-14 shrink-0 border border-dashed border-(--border-primary)" />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <Link
          href={`/products/${item.productHandle}`}
          className="truncate text-sm font-medium text-(--text-primary) hover:text-(--accent-primary)"
        >
          {item.title}
        </Link>
        {item.variantTitle !== "Default Title" && (
          <span className="truncate text-xs text-(--text-secondary)">
            {item.variantTitle}
          </span>
        )}
        <span className="text-sm tabular-nums">
          {formatMoney(cartItemTotal(item))}
        </span>
      </div>
      <MyQuantityStepper
        size="sm"
        min={0}
        value={item.quantity}
        ariaLabelSuffix={` ${item.title}`}
        className="shrink-0"
        onChange={(next) =>
          next <= 0
            ? removeItem(item.variantId)
            : updateQuantity(item.variantId, next)
        }
      />

      <MyButton
        variant="ghost"
        size="icon"
        aria-label={`Eliminar ${item.title} del carrito`}
        onClick={() => removeItem(item.variantId)}
        className="shrink-0 text-(--text-secondary) hover:text-[rgb(var(--semantic-error-rgb))]"
      >
        <Trash2 size={15} aria-hidden />
      </MyButton>
    </li>
  );
}

export default function CartButton() {
  const hydrated = useHydrated();
  const items = useCartStore((state) => state.items);
  const [open, setOpen] = useState(false);
  const count = hydrated ? cartCount(items) : 0;
  const subtotal = cartSubtotal(items);
  const hasItems = items.length > 0;

  return (
    <>
      {/* S-10: el disparador conserva el conteo en el rótulo accesible y la
          región viva fuera del botón. S-01.5: ya no es un enlace, abre el
          drawer con aria-haspopup para que el lector anuncie el diálogo. */}
      {/* S-12b (bug cazado en el log dev): antes había un <button> nativo
          envolviendo a MyButton — botón anidado inválido que rompía la
          hidratación. Ahora el disparador ES el MyButton único: conserva
          haspopup/expanded/label accesible y el badge va posicionado
          respecto a él (span dentro de botón es HTML válido). */}
      <MyButton
        variant="outline"
        leftIcon={<ShoppingBasket />}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={
          count > 0
            ? `Ver carrito, ${count} ${count === 1 ? "artículo" : "artículos"}`
            : "Ver carrito vacío"
        }
        className="relative ml-1"
      >
        {count > 0 && (
          <span
            aria-hidden
            className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-(--accent-primary) px-1 text-xs text-(--text-inverted)"
          >
            {count}
          </span>
        )}
      </MyButton>
      <span aria-live="polite" className="sr-only">
        {hydrated && count > 0
          ? `${count} ${count === 1 ? "artículo" : "artículos"} en el carrito`
          : ""}
      </span>

      <MyDrawer
        open={open}
        onOpenChange={setOpen}
        title="Tu carrito"
        description="Revisa y ajusta tus productos. Para pagar, ve al carrito."
        side="right"
        size="sm"
        footer={
          // Checkout deliberadamente ausente: vive solo en /cart (decisión
          // del usuario, spec S-01.5).
          hasItems ? (
            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-(--accent-primary) text-sm font-medium text-(--text-inverted) transition-colors hover:bg-(--accent-hover)"
            >
              Ir al carrito
            </Link>
          ) : null
        }
      >
        {!hydrated ? (
          <p className="text-sm text-(--text-secondary)">Cargando carrito…</p>
        ) : !hasItems ? (
          <StateView
            variant="empty"
            title="Tu carrito está vacío"
            description="Explora el catálogo y encuentra algo que te guste."
            action={{ label: "Ver productos", href: "/products" }}
            className="border-0 py-8"
          />
        ) : (
          <>
            <ul className="flex flex-col">
              {items.map((item) => (
                <PreviewRow key={item.variantId} item={item} />
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-(--border-primary) pt-3 text-sm">
              <span className="text-(--text-secondary)">
                Subtotal ({count})
              </span>
              <span className="font-semibold tabular-nums">
                {formatMoney(subtotal)}
              </span>
            </div>
            <p className="mt-1 text-xs text-(--text-tertiary)">
              Impuestos y envío se calculan al finalizar la compra.
            </p>
          </>
        )}
      </MyDrawer>
    </>
  );
}
