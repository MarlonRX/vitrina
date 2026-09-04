"use client";

import React, { useEffect, useId } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MyDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  side?: "left" | "right" | "bottom";
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footer?: React.ReactNode;
}

const sideClasses: Record<NonNullable<MyDrawerProps["side"]>, string> = {
  right:
    "right-0 top-0 h-full border-l data-[state=open]:translate-x-0 data-[state=closed]:translate-x-full",
  left: "left-0 top-0 h-full border-r data-[state=open]:translate-x-0 data-[state=closed]:-translate-x-full",
  bottom:
    "bottom-0 left-0 w-full border-t rounded-t-2xl data-[state=open]:translate-y-0 data-[state=closed]:translate-y-full",
};

const sizeClasses = {
  right: {
    sm: "w-full sm:w-[24rem]",
    md: "w-full sm:w-[28rem]",
    lg: "w-full sm:w-[32rem]",
    xl: "w-full sm:w-[40rem]",
    full: "w-full",
  },
  left: {
    sm: "w-full sm:w-[24rem]",
    md: "w-full sm:w-[28rem]",
    lg: "w-full sm:w-[32rem]",
    xl: "w-full sm:w-[40rem]",
    full: "w-full",
  },
  bottom: {
    sm: "max-h-[40vh]",
    md: "max-h-[55vh]",
    lg: "max-h-[70vh]",
    xl: "max-h-[85vh]",
    full: "h-[100dvh] max-h-[100dvh] rounded-none",
  },
} as const;

export function MyDrawer({
  open,
  onOpenChange,
  children,
  title,
  description,
  side = "right",
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
  overlayClassName,
  contentClassName,
  headerClassName,
  bodyClassName,
  footer,
}: MyDrawerProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, closeOnEscape, onOpenChange]);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className={cn("fixed inset-0 z-50", className)}>
      <button
        type="button"
        aria-label="Cerrar drawer"
        onClick={() => closeOnOverlayClick && onOpenChange(false)}
        className={cn(
          "absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity",
          overlayClassName,
          !closeOnOverlayClick && "cursor-default",
        )}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        data-state={open ? "open" : "closed"}
        className={cn(
          "absolute flex flex-col overflow-hidden border-(--border-primary) bg-(--bg-surface) text-(--text-primary) shadow-2xl transition-transform duration-300 ease-out",
          sideClasses[side],
          sizeClasses[side][size],
          side !== "bottom" && "h-full",
          contentClassName,
        )}
      >
        {(title || description || showCloseButton) && (
          <div
            className={cn(
              "flex items-start justify-between gap-4 border-b border-(--border-primary) px-4 py-4 sm:px-5",
              headerClassName,
            )}
          >
            <div className="min-w-0 flex-1">
              {title && (
                <h2
                  id={titleId}
                  className="text-base font-semibold text-(--text-primary)"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id={descriptionId}
                  className="mt-1 text-sm text-(--text-secondary)"
                >
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className={cn(
                  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-(--border-primary)",
                  "bg-(--bg-secondary) text-(--text-secondary) transition-colors",
                  "hover:border-(--accent-primary)/50 hover:text-(--text-primary)",
                  "focus:outline-none focus:ring-2 focus:ring-(--accent-primary)/30",
                )}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        <div
          className={cn(
            "flex-1 overflow-y-auto px-4 py-4 sm:px-5",
            bodyClassName,
          )}
        >
          {children}
        </div>

        {footer && (
          <div className="border-t border-(--border-primary) px-4 py-4 sm:px-5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyDrawer;
