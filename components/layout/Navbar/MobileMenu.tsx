"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import MyDrawer from "@/components/UIComponents/MyDrawer";
import NavLinks from "./NavLinks";

// S-14q: el menú móvil era un dropdown `absolute w-56` anclado al botón: en
// pantallas chicas se salía del borde derecho, tapaba la canasta y no tenía
// trampa de foco. Ahora usa el MyDrawer del sistema (dialog nativo <modal>),
// que aporta overlay, Escape, foco y scroll bloqueado gratis. El disparador
// conserva aria-expanded/aria-controls sobre el panel.
export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="menu-movil"
        aria-label="Abrir menú"
        className="flex h-10 w-10 items-center justify-center rounded-md border border-(--border-primary) text-(--text-primary) transition-colors hover:border-(--accent-primary) hover:text-(--accent-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-primary)"
      >
        <Menu size={20} aria-hidden />
      </button>

      <MyDrawer
        open={isOpen}
        onOpenChange={setIsOpen}
        side="right"
        size="sm"
        title="Navegación"
        contentClassName="w-[min(85vw,20rem)]"
      >
        <div id="menu-movil">
          <NavLinks
            className="flex flex-col items-start gap-5 text-lg"
            onNavigate={() => setIsOpen(false)}
          />
        </div>
      </MyDrawer>
    </>
  );
}
