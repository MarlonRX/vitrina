"use client";

// React Bits - CountUp (reactbits.dev/components/count-up): contador animado
// que arranca al entrar en viewport. Escribe textContent directo (cero
// re-renders), adaptado de nodovec.
import { useEffect, useRef, useCallback } from "react";
import { useInView, animate, type AnimationPlaybackControls } from "motion/react";

interface CountUpProps {
  to: number;
  from?: number;
  delay?: number;
  duration?: number;
  className?: string;
  separator?: string;
  format?: (value: number) => string;
}

export default function CountUp({
  to,
  from = 0,
  delay = 0,
  duration = 0.8,
  className = "",
  separator = "",
  format,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px" });

  const formatValue = useCallback(
    (latest: number) => {
      if (format) return format(latest);
      const options: Intl.NumberFormatOptions = {
        useGrouping: !!separator,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      };
      const formatted = Intl.NumberFormat("es-ES", options).format(latest);
      return separator ? formatted.replace(/\./g, separator) : formatted;
    },
    [format, separator],
  );

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = formatValue(from);
    }
  }, [from, to, formatValue]);

  useEffect(() => {
    if (!isInView) return;
    let controls: AnimationPlaybackControls | undefined;
    const timeout = setTimeout(() => {
      controls = animate(from, to, {
        duration,
        ease: [0.22, 1, 0.36, 1],
        onUpdate: (latest: number) => {
          if (ref.current) {
            ref.current.textContent = formatValue(latest);
          }
        },
      });
    }, delay * 1000);
    return () => {
      clearTimeout(timeout);
      controls?.stop();
    };
  }, [isInView, from, to, duration, delay, formatValue]);

  return <span className={className} ref={ref} />;
}
