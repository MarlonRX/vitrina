import Link from "next/link";
import { cn } from "@/lib/utils";

// S-12 (identidad): la marca. SVG inline = vector nítido a cualquier DPR,
// colores con currentColor/token para adaptarse solo. La figura es el arco
// de una vitrina (medio punto sobre una línea base) con una "pieza
// expuesta" flotando dentro. El wordmark va en Fraunces (display del sitio).

type LogoProps = {
  href?: string;
  className?: string;
  /** "full" = isotipo + palabra; "mark" = solo la figura. */
  variant?: "full" | "mark";
  size?: "sm" | "md";
};

function VitrineMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* S-14p (limpieza): una ÚNICA línea continua — arco superior que
          desemboca en la V del pedestal — sin destello ni seams. La silueta
          lee como una gema/vidrio liso. */}
      <path d="M4.5 12.5a7.5 7.5 0 0 1 15 0L12 19.5Z" />
      {/* la pieza expuesta */}
      <circle cx="12" cy="12" r="1.9" fill="var(--accent-primary)" stroke="none" />
    </svg>
  );
}

export default function Logo({
  href = "/",
  className,
  variant = "full",
  size = "md",
}: LogoProps) {
  // S-14p: x2 sobre la escala anterior (mark h-5/h-6, text-lg/text-xl) por
  // pedido del usuario. El alto del navbar (h-20) lo sigue conteniendo.
  const wordSize = size === "sm" ? "text-3xl" : "text-4xl";
  const markSize = size === "sm" ? "h-10 w-10" : "h-12 w-12";

  return (
    <Link
      href={href}
      aria-label="Vitrina — ir al inicio"
      className={cn(
        "group flex shrink-0 items-center gap-2 text-(--text-primary) transition-colors hover:text-(--accent-primary)",
        className,
      )}
    >
      <VitrineMark
        className={cn(
          markSize,
          "text-(--accent-primary) transition-transform duration-300 group-hover:-translate-y-0.5",
        )}
      />
      {variant === "full" && (
        <span
          className={cn(
            wordSize,
            "font-display font-semibold tracking-[-0.02em] leading-none",
          )}
        >
          Vitrina
        </span>
      )}
    </Link>
  );
}
