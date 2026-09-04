import Link from "next/link";

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
}

export default function NavLinks({
  links = defaultLinks,
  className = "flex items-center gap-6",
}: NavLinksProps) {
  return (
    <ul className={className}>
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="text-sm font-medium text-(--text-primary) hover:text-(--accent-primary)"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
