"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// S-01.5 (factor wow): revelado suave al entrar en viewport con
// IntersectionObserver. NO usa estado de React: el efecto añade una clase al
// nodo (`revealed`), así hay cero re-renders y el lint (set-state-in-effect) y
// react-doctor quedan contentos. La animación es solo transform/opacity
// (clases en globals.css), y con prefers-reduced-motion el nodo nace revelado
// — el CSS global de S-10 además mata cualquier transición residual.
//
// Reglas react-doctor: único export = componente.

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Desfase escalonado en ms para listas (p. ej. índice × 60). */
  delay?: number;
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("revealed");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -40px 0px", threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={cn("reveal", className)} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}
