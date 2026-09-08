"use client";

import { useEffect, useRef } from "react";
import { Check } from "lucide-react";
import { useToastStore } from "@/stores/toast";

// S-14o: aviso inferior centrado ("tal producto fue agregado"), estilo de la
// marca: pastilla oscura con tilde de confirmación. `role=status` +
// aria-live para que los lectores de pantalla lo anuncien sin robar foco.
// La animación de entrada/salida se aplica por clases sobre el nodo (ref),
// no por setState dentro del effect: así cada aviso son dos tiempos de
// pintura y cero renders encadenados (react-doctor set-state-in-effect).
const VISIBLE_MS = 2400;

export default function Toaster() {
  const toast = useToastStore((state) => state.toast);
  const dismiss = useToastStore((state) => state.dismiss);
  const pillRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!toast) return;
    const pill = pillRef.current;
    if (pill) {
      // 0 = oculto/abajo, 1 = visible. Dos pinturas: montar y luego subir.
      pill.dataset.state = "0";
      const raf = window.requestAnimationFrame(() => {
        pill.dataset.state = "1";
      });
      const timers = [
        window.setTimeout(() => {
          if (pillRef.current) pillRef.current.dataset.state = "0";
        }, VISIBLE_MS - 250),
        window.setTimeout(() => dismiss(toast.id), VISIBLE_MS),
      ];
      return () => {
        window.cancelAnimationFrame(raf);
        for (const t of timers) window.clearTimeout(t);
      };
    }
    const timer = window.setTimeout(() => dismiss(toast.id), VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [toast, dismiss]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
    >
      <p
        ref={pillRef}
        data-state="0"
        className="flex max-w-full items-center gap-2 rounded-full border border-(--accent-primary)/40 bg-(--accent-hover) px-4 py-2.5 text-sm font-medium text-(--text-inverted) shadow-xl transition-all duration-250 data-[state='0']:translate-y-3 data-[state='0']:opacity-0"
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-(--text-inverted)/15">
          <Check size={13} aria-hidden />
        </span>
        {toast.message}
      </p>
    </div>
  );
}
