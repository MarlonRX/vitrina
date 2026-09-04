"use client";

import { useState } from "react";
import NavLinks from "./NavLinks";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="rounded-md border border-(--border-primary) px-3 py-1.5 text-sm font-medium text-(--text-primary)"
      >
        {isOpen ? "Cerrar" : "Menú"}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-md border border-(--border-primary) bg-(--bg-surface) p-4 shadow-md">
          <NavLinks className="flex flex-col items-start gap-4" />
        </div>
      )}
    </div>
  );
}
