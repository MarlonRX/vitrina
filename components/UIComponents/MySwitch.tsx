"use client";
import { cn } from "@/lib/utils";

interface MySwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  id?: string;
  disabled?: boolean;
}

/** Interruptor (toggle) reutilizable, accesible vía role="switch". */
export function MySwitch({ checked, onCheckedChange, label, id, disabled = false }: MySwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      id={id}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-primary) focus-visible:ring-offset-2",
        "shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
      )}
      style={{ backgroundColor: checked ? 'var(--accent-primary)' : 'var(--border-primary)' }}
    >
      <span
        className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm"
        style={{ transform: checked ? 'translateX(24px)' : 'translateX(4px)' }}
      />
    </button>
  );
}