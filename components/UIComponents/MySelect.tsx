"use client";
import React, { useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MySelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  labelEnd?: React.ReactNode;
  options: Array<{ value: string | number; label: string }>;
  placeholder?: string;
}

export const MySelect = React.forwardRef<HTMLSelectElement, MySelectProps>(
  ({ label, error, labelEnd, options, placeholder, className, id, ...props }, ref) => {
    const autoId = useId();
    const selectId = id || autoId;

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={selectId} className="flex items-center gap-1 text-sm font-medium text-(--text-primary)">
            {label}
            {labelEnd}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "w-full appearance-none px-3 py-2 pr-8 rounded-lg border text-sm",
              "bg-(--bg-surface) text-(--text-primary)",
              "border-(--border-primary) focus:border-(--accent-primary) focus:ring-2 focus:ring-(--accent-primary)/30",
              "outline-none transition-colors duration-200 cursor-pointer",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/30",
              className
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
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-secondary) pointer-events-none" />
        </div>
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

MySelect.displayName = "MySelect";