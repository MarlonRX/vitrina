"use client";

import React, { useEffect, useId, useRef } from "react";
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

// S-09 (react-doctor prefer-html-dialog + prefer-use-effect-event +
// no-noninteractive-element-interactions): el drawer era un div
// role="dialog" con foco manual, listener de Escape que se resuscribía en
// cada render del padre y bloqueo de scroll del body a mano. Ahora es un
// <dialog> nativo showModaled: trampa de foco, Escape, backdrop y bloqueo de
// scroll vienen gratis. El dialog es una caja transparente que ocupa el
// viewport; el "overlay" es un botón real (primera capa), y el panel asoma
// por un lado encima de él.
const dialogBase = [
  // caja transparente a pantalla completa (el oscurecido lo pone ::backdrop)
  "fixed inset-0 m-0 h-full w-full max-h-full max-w-none box-border border-0 bg-transparent p-0 isolate",
  "backdrop:bg-black/40 backdrop:backdrop-blur-[1px]",
  "open:block",
];

const panelClasses: Record<NonNullable<MyDrawerProps["side"]>, string> = {
  right: "absolute inset-y-0 right-0 h-full w-full border-l",
  left: "absolute inset-y-0 left-0 h-full w-full border-r",
  bottom: "absolute inset-x-0 bottom-0 w-full max-h-[55vh] rounded-t-2xl border-t",
};

const sizeClasses = {
  right: {
    sm: "sm:w-[24rem]",
    md: "sm:w-[28rem]",
    lg: "sm:w-[32rem]",
    xl: "sm:w-[40rem]",
    full: "sm:w-full",
  },
  left: {
    sm: "sm:w-[24rem]",
    md: "sm:w-[28rem]",
    lg: "sm:w-[32rem]",
    xl: "sm:w-[40rem]",
    full: "sm:w-full",
  },
  bottom: {
    sm: "max-h-[40vh]",
    md: "",
    lg: "max-h-[70vh]",
    xl: "max-h-[85vh]",
    full: "!h-[100dvh] max-h-[100dvh] rounded-none",
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeOnEscapeRef = useRef(closeOnEscape);
  // El ref se sincroniza en un efecto (no durante el render, regla
  // react-hooks/refs): el listener de `cancel` lo lee en el momento del evento.
  useEffect(() => {
    closeOnEscapeRef.current = closeOnEscape;
  }, [closeOnEscape]);

  // El estado controlado (`open`) maneja el dialog nativo; el evento `close`
  // (Escape o close() programático) sincroniza hacia afuera.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Escape: el dialog nativo lo interpreta siempre; se cancela el evento
  // `cancel` si el consumidor pidió closeOnEscape=false. El listener se
  // registra una sola vez y lee el ref, así no se resuscribe al re-renderizar
  // el padre (regla prefer-use-effect-event de react-doctor).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleCancel = (event: Event) => {
      if (!closeOnEscapeRef.current) event.preventDefault();
    };
    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
      data-state={open ? "open" : "closed"}
      onClose={() => onOpenChange(false)}
      className={cn(dialogBase, className)}
    >
      {/* Overlay: botón real que cubre el viewport y captura el clic fuera del
          panel (regla no-noninteractive-element-interactions: sin manejadores
          sobre elementos no interactivos). */}
      <button
        type="button"
        aria-label="Cerrar panel"
        tabIndex={closeOnOverlayClick ? 0 : -1}
        onClick={() => onOpenChange(false)}
        className={cn(
          "absolute inset-0 h-full w-full",
          !closeOnOverlayClick && "pointer-events-none",
          overlayClassName,
        )}
      />
      <div
        className={cn(
          "z-10 flex flex-col overflow-hidden bg-(--bg-surface) text-(--text-primary) shadow-2xl border-(--border-primary)",
          panelClasses[side],
          sizeClasses[side][size],
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
                aria-label="Cerrar panel"
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
    </dialog>
  );
}

export default MyDrawer;
