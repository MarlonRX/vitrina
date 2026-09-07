"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavLink {
  label: string;
  href: string;
}

const defaultLinks: NavLink[] = [
  { label: "INICIO", href: "/" },
  { label: "PRODUCTOS", href: "/products" },
  { label: "COLECCIONES", href: "/collections" },
];

interface NavLinksProps {
  links?: NavLink[];
  className?: string;
  /** S-10: el menú móvil cierra el panel al navegar. */
  onNavigate?: () => void;
}

export default function NavLinks({
  links = defaultLinks,
  className = "flex items-center gap-6",
  onNavigate,
}: NavLinksProps) {
  const pathname = usePathname();
  return (
    <ul className={className}>
      {links.map((link) => {
        // S-10: aria-current="page" marca la sección activa para lectores de
        // pantalla (y el estilo reutiliza el color de acento).
        const isActive =
          link.href === "/"
            ? pathname === "/"
            : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              onClick={onNavigate}
              className={
                isActive
                  ? "text-sm font-medium text-(--accent-primary)"
                  : "text-sm font-medium text-(--text-primary) hover:text-(--accent-primary)"
              }
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
