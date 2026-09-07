"use client";
import React, { useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FIELD_CONTROL_BASE,
  FIELD_CONTROL_ERROR,
  FIELD_ERROR_TEXT,
  FIELD_LABEL,
} from "./field-styles";

// S-11 (sistema de diseño): el selector nativo del sitio. Mantiene <select>
// de verdad (funciona con GET sin JS y es accesible gratis); la flecha es
// puramente decorativa.

interface MySelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  labelEnd?: React.ReactNode;
  options: Array<{ value: string | number; label: string }>;
  placeholder?: string;
}

export const MySelect = React.forwardRef<HTMLSelectElement, MySelectProps>(
  (
    { label, error, labelEnd, options, placeholder, className, id, ...props },
    ref,
  ) => {
    const autoId = useId();
    const selectId = id || autoId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className={FIELD_LABEL}>
            <span>{label}</span>
            {labelEnd}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={error ? true : undefined}
            className={cn(
              FIELD_CONTROL_BASE,
              "h-10 cursor-pointer appearance-none pr-9",
              error && FIELD_CONTROL_ERROR,
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden
            className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-(--text-secondary)"
          />
        </div>
        {error && (
          <p className={FIELD_ERROR_TEXT} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

MySelect.displayName = "MySelect";
