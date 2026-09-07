"use client";
import React, { useId } from "react";
import { cn } from "@/lib/utils";
import {
  FIELD_CONTROL_BASE,
  FIELD_CONTROL_ERROR,
  FIELD_ERROR_TEXT,
  FIELD_LABEL,
} from "./field-styles";

// S-11 (sistema de diseño): área de texto sobre field-styles.ts.

interface MyTextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  labelEnd?: React.ReactNode;
}

export const MyTextArea = React.forwardRef<HTMLTextAreaElement, MyTextAreaProps>(
  ({ label, error, labelEnd, className, id, ...props }, ref) => {
    const autoId = useId();
    const textareaId = id || autoId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className={FIELD_LABEL}>
            <span>{label}</span>
            {labelEnd}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          className={cn(
            FIELD_CONTROL_BASE,
            "min-h-24 resize-none py-2 leading-relaxed",
            error && FIELD_CONTROL_ERROR,
            className,
          )}
          {...props}
        />
        {error && (
          <p className={FIELD_ERROR_TEXT} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

MyTextArea.displayName = "MyTextArea";
