"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import NavLinks from "./NavLinks";

// S-01.5: el menú móvil ya no aloja su propio SearchInput — la búsqueda vive
// en la paleta global (SearchPaletteHost). Queda solo la navegación.
export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  // S-10: el botón de menú ahora comunica su estado (aria-expanded), apunta al
  // panel (aria-controls), cierra con Escape y devuelve el foco al botón.
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-(--border-primary) text-(--text-primary) transition-colors hover:border-(--accent-primary) hover:text-(--accent-primary)"
      >
        {/* S-14c: disparador solo icono (hamburguesa / cruz) en móvil; el
            texto vive en aria-label para los lectores de pantalla. */}
        {isOpen ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
      </button>

      {isOpen && (
        <div
          id={menuId}
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-md border border-(--border-primary) bg-(--bg-surface) p-4 shadow-md"
        >
          <NavLinks className="flex flex-col items-start gap-4" onNavigate={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}
