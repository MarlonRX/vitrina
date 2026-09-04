"use client";
import React, { useId } from "react";
import { cn } from "@/lib/utils";

interface MyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  labelEnd?: React.ReactNode;
}

export const MyInput = React.forwardRef<HTMLInputElement, MyInputProps>(
  ({ label, error, labelEnd, className, id, ...props }, ref) => {
    const autoId = useId();
    const inputId = id || autoId;

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
          className={cn(
            "w-full px-3 py-2 rounded-lg border text-sm",
            "bg-(--bg-surface) text-(--text-primary) placeholder:text-(--text-secondary)",
            "border-(--border-primary) focus:border-(--accent-primary) focus:ring-2 focus:ring-(--accent-primary)/30",
            "outline-none transition-colors duration-200",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/30",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

MyInput.displayName = "MyInput";