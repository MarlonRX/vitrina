"use client";
import React, { useId } from "react";
import { cn } from "@/lib/utils";
import {
  FIELD_CONTROL_BASE,
  FIELD_CONTROL_ERROR,
  FIELD_ERROR_TEXT,
  FIELD_LABEL,
} from "./field-styles";

// S-11 (sistema de diseño): el campo de texto del sitio. Las clases salen de
// field-styles.ts — si mañana cambia la identidad, cambia en un solo lugar.

interface MyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  labelEnd?: React.ReactNode;
  hint?: string;
}

export const MyInput = React.forwardRef<HTMLInputElement, MyInputProps>(
  ({ label, error, labelEnd, hint, className, id, type = "text", ...props }, ref) => {
    const autoId = useId();
    const inputId = id || autoId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className={FIELD_LABEL}>
            <span>{label}</span>
            {labelEnd}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(FIELD_CONTROL_BASE, "h-10", error && FIELD_CONTROL_ERROR, className)}
          {...props}
        />
        {error ? (
          <p id={`${inputId}-error`} className={FIELD_ERROR_TEXT} role="alert">
            {error}
          </p>
        ) : (
          hint && <p className="text-xs text-(--text-tertiary)">{hint}</p>
        )}
      </div>
    );
  },
);

MyInput.displayName = "MyInput";
