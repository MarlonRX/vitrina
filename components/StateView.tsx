"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Inbox, PackageX } from "lucide-react";
import MyButton from "@/components/UIComponents/MyButton";
import { cn } from "@/lib/utils";

// S-03 dentro de S-02a06: pantalla reutilizable para vacío, error de API y
// sin stock. Uso obligatorio en /search, catálogo, colecciones, detalle de
// producto y errores de /api/checkout en el carrito.
export type StateViewVariant = "empty" | "error" | "out-of-stock";

interface StateViewAction {
  label: string;
  href: string;
}

interface StateViewProps {
  variant: StateViewVariant;
  title: string;
  description?: string;
  /** Enlace de navegación (p. ej. "Ver catálogo"). */
  action?: StateViewAction;
  /** Muestra un botón "Reintentar" (router.refresh) para fallos de API. */
  retry?: boolean;
  /** Si se pasa, el botón "Reintentar" ejecuta este callback en su lugar. */
  onRetry?: () => void;
  className?: string;
}

const variantStyles: Record<
  StateViewVariant,
  { icon: string; border: string }
> = {
  empty: {
    icon: "text-(--text-tertiary)",
    border: "border-(--border-primary)",
  },
  error: {
    icon: "text-(--semantic-error)",
    border: "border-(--semantic-error)/40",
  },
  "out-of-stock": {
    icon: "text-(--text-tertiary)",
    border: "border-(--border-primary)",
  },
};

function VariantIcon({ variant, className }: { variant: StateViewVariant; className?: string }) {
  if (variant === "error") return <AlertTriangle className={className} aria-hidden />;
  if (variant === "out-of-stock") return <PackageX className={className} aria-hidden />;
  return <Inbox className={className} aria-hidden />;
}

export default function StateView({
  variant,
  title,
  description,
  action,
  retry = false,
  onRetry,
  className,
}: StateViewProps) {
  const router = useRouter();
  const styles = variantStyles[variant];

  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center gap-3 border bg-(--bg-surface) px-6 py-12 text-center",
        styles.border,
        className,
      )}
    >
      <VariantIcon variant={variant} className={cn("h-8 w-8", styles.icon)} />
      <h2 className="text-lg font-semibold text-(--text-primary)">{title}</h2>
      {description ? (
        <p className="max-w-prose text-sm text-(--text-secondary)">
          {description}
        </p>
      ) : null}
      <div className="mt-1 flex items-center gap-3">
        {action ? (
          <Link href={action.href} className="text-sm underline">
            {action.label}
          </Link>
        ) : null}
        {retry || onRetry ? (
          <MyButton
            variant="outline"
            size="sm"
            onClick={onRetry ?? (() => router.refresh())}
          >
            Reintentar
          </MyButton>
        ) : null}
      </div>
    </div>
  );
}
