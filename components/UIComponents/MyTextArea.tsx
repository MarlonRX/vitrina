"use client";
import React, { useId } from "react";
import { cn } from "@/lib/utils";

interface MyTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  labelEnd?: React.ReactNode;
}

export const MyTextArea = React.forwardRef<HTMLTextAreaElement, MyTextAreaProps>(
  ({ label, error, labelEnd, className, id, ...props }, ref) => {
    const autoId = useId();
    const textareaId = id || autoId;

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={textareaId} className="flex items-center gap-1 text-sm font-medium text-(--text-primary)">
            {label}
            {labelEnd}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          autoComplete="off"
          className={cn(
            "w-full px-3 py-2 rounded-lg border text-sm resize-none",
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

MyTextArea.displayName = "MyTextArea";