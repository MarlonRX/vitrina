"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

// S-11 (sistema de diseño): UN solo stepper de cantidad para todo el sitio
// (estaba triplicado: detalle de producto, /cart y el preview del carrito).
// `min` controla el sentido del botón menos: min=1 (detalle) solo baja; min=0
// (carrito) en cero el padre decide (normalmente eliminar la línea).

interface MyQuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  /** Texto accesible, p. ej. "a Cerámica Aria". */
  ariaLabelSuffix?: string;
  size?: "sm" | "md";
  className?: string;
}

export function MyQuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  ariaLabelSuffix = "",
  size = "md",
  className,
}: MyQuantityStepperProps) {
  const iconSize = size === "sm" ? 13 : 15;
  const pad = size === "sm" ? "p-1.5" : "p-2";
  const width = size === "sm" ? "w-7" : "w-9";

  const canDecrease = value > min;
  const canIncrease = max === undefined || value < max;

  return (
    <div
      className={cn(
        "flex items-center overflow-hidden rounded-md border border-(--border-primary) bg-(--bg-surface)",
        "transition-colors hover:border-(--border-secondary)",
        className,
      )}
    >
      <button
        type="button"
        aria-label={`Restar cantidad${ariaLabelSuffix ? ` ${ariaLabelSuffix}` : ""}`}
        disabled={!canDecrease}
        onClick={() => canDecrease && onChange(value - 1)}
        className={cn(
          "text-(--text-secondary) transition-colors hover:bg-(--bg-secondary) hover:text-(--text-primary)",
          "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent",
          pad,
        )}
      >
        <Minus size={iconSize} aria-hidden />
      </button>
      <span
        className={cn(
          "text-center text-sm tabular-nums text-(--text-primary)",
          width,
        )}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label={`Sumar cantidad${ariaLabelSuffix ? ` ${ariaLabelSuffix}` : ""}`}
        disabled={!canIncrease}
        onClick={() => canIncrease && onChange(value + 1)}
        className={cn(
          "text-(--text-secondary) transition-colors hover:bg-(--bg-secondary) hover:text-(--text-primary)",
          "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent",
          pad,
        )}
      >
        <Plus size={iconSize} aria-hidden />
      </button>
    </div>
  );
}

export default MyQuantityStepper;
