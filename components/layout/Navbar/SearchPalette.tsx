"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

// S-01.5 (factor wow): la barra de búsqueda inline del navbar desaparece.
// Queda un botón-icono (SearchPaletteButton) que abre esta paleta de comandos
// overlay: escribes, Enter navega a /products?q=... (panel de filtros incluido) (misma ruta y filtros que
// antes, sin lógica nueva). Ctrl/Cmd+K también la abre desde cualquier foco.
//
// Implementation notes (react-doctor-safe): solo componentes exportados;
// <dialog> nativo = trampa de foco + Escape gratis (mismo patrón del drawer
// de S-09); formulario GET con action=/products como fallback sin JS; el resto
// del sitio sigue intacto.

const OPEN_EVENT = "vitrina:open-search";

/** Disparador: botón con solo el icono. Varios en el DOM (desktop/móvil)
 *  están permitidos porque la paleta real es un singleton montado en Navbar. */
export function SearchPaletteButton() {
  return (
    <button
      type="button"
      aria-label="Buscar productos"
      aria-haspopup="dialog"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-(--border-primary) text-(--text-primary) hover:border-(--accent-primary)/60"
    >
      <Search size={16} aria-hidden />
    </button>
  );
}

/** Paleta en sí. Montar UNA sola vez (singleton) en el navbar. */
export function SearchPaletteHost() {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const show = useCallback(() => {
    dialogRef.current?.showModal();
    // focus tras el paint del top-layer
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const hide = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  useEffect(() => {
    function onOpenRequest() {
      if (!dialogRef.current?.open) show();
    }
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (!dialogRef.current?.open) show();
        else hide();
      }
    }
    window.addEventListener(OPEN_EVENT, onOpenRequest);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener(OPEN_EVENT, onOpenRequest);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [show, hide]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = new FormData(event.currentTarget).get("q");
    const trimmed = typeof query === "string" ? query.trim() : "";
    if (!trimmed) return;
    hide();
    router.push(`/products?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label="Buscar productos"
      // El dialog se estira a pantalla completa y es transparente; el cierre
      // por clic fuera vive en un <button> backdrop dedicado (react-doctor
      // no-noninteractive-element-interactions: el handler no va en el dialog).
      className="fixed inset-0 z-50 m-0 h-full w-full max-h-full max-w-none border-0 bg-transparent p-0 backdrop:bg-black/50"
    >
      <button
        type="button"
        aria-label="Cerrar búsqueda"
        tabIndex={-1}
        onClick={hide}
        className="absolute inset-0 h-full w-full cursor-default"
      />
      <form
        method="get"
        action="/products"
        onSubmit={handleSubmit}
        className="relative z-10 mx-auto mt-[14vh] w-[min(92vw,560px)] border border-(--border-primary) bg-(--bg-surface) shadow-2xl"
      >
        <div className="flex items-center gap-3 px-4 py-3.5">
          <Search size={18} aria-hidden className="shrink-0 text-(--text-tertiary)" />
          {/* S-10/4.1.2 (react-doctor no-placeholder-only-field): el campo
              necesita nombre accesible real, no solo el placeholder. */}
          <label htmlFor="search-palette-input" className="sr-only">
            Término de búsqueda
          </label>
          <input
            id="search-palette-input"
            ref={inputRef}
            type="search"
            name="q"
            placeholder="Buscar productos… cerámica, lámparas, ediciones limitadas"
            className="h-9 flex-1 border-0 bg-transparent text-base text-(--text-primary) placeholder:text-(--text-tertiary) focus:outline-none"
          />
          <kbd className="hidden shrink-0 rounded border border-(--border-primary) px-1.5 py-0.5 text-[10px] text-(--text-tertiary) sm:block">
            esc para cerrar
          </kbd>
          <button
            type="button"
            aria-label="Cerrar búsqueda"
            onClick={hide}
            className="shrink-0 p-1 text-(--text-secondary) hover:text-(--text-primary)"
          >
            <X size={16} aria-hidden />
          </button>
        </div>
        <div className="border-t border-(--border-primary) px-4 py-2 text-xs text-(--text-secondary)">
          Enter abre la página de resultados con filtros completos.
        </div>
      </form>
    </dialog>
  );
}
