"use client";
import React, { useId, useMemo } from "react";
import Decimal from "decimal.js";
import { cn } from "@/lib/utils";

interface MyCurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  labelEnd?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function formatCurrency(val: string): string {
  if (!val) return "";
  const parts = val.split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const decimalPart = parts[1] || "";
  return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
}

export const MyCurrencyInput = React.forwardRef<HTMLInputElement, MyCurrencyInputProps>(
  ({ label, error, labelEnd, className, onChange, value, id, ...props }, ref) => {
    const autoId = useId();
    const inputId = id || autoId;

    const displayValue = useMemo(() => {
      if (value === undefined || value === null || value === "") {
        return "";
      }
      try {
        const decimal = new Decimal(String(value));
        return formatCurrency(decimal.toString());
      } catch {
        return "";
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value;
      inputValue = inputValue.replace(/[^\d.]/g, "");

      const parts = inputValue.split(".");
      if (parts.length > 2) {
        inputValue = parts[0] + "." + parts.slice(1).join("");
      }

      if (parts.length === 2) {
        parts[1] = parts[1].substring(0, 2);
        inputValue = parts.join(".");
      }

      let cleanValue = inputValue;
      if (inputValue && inputValue !== ".") {
        try {
          const decimal = new Decimal(inputValue);
          cleanValue = decimal.toString();
        } catch {
          // Keep inputValue as is if parsing fails
        }
      }

      const cleanEvent = {
        ...e,
        target: { ...e.target, value: cleanValue },
      } as React.ChangeEvent<HTMLInputElement>;

      if (onChange) onChange(cleanEvent);
    };

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="flex items-center gap-1 text-sm font-medium text-(--text-primary)">
            {label}
            {labelEnd}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          autoComplete="off"
          type="text"
          inputMode="decimal"
          className={cn(
            "w-full px-3 py-2 rounded-lg border text-sm",
            "bg-(--bg-surface) text-(--text-primary) placeholder:text-(--text-secondary)",
            "border-(--border-primary) focus:border-(--accent-primary) focus:ring-2 focus:ring-(--accent-primary)/30",
            "outline-none transition-colors duration-200",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/30",
            className
          )}
          value={displayValue}
          onChange={handleChange}
          placeholder="0.00"
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

MyCurrencyInput.displayName = "MyCurrencyInput";