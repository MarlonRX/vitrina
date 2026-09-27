"use client";

// React Bits - SplitText (reactbits.dev/components/split-text), adaptado de
// nodovec: revelado letra a letra con blur. Con prefers-reduced-motion
// renderiza texto plano (sin animación).
import { LazyMotion, domMax, m, useReducedMotion } from "motion/react";

interface SplitTextProps {
  text: string;
  className?: string;
  charClassName?: string;
  delay?: number;
  duration?: number;
}

export default function SplitText({
  text = "",
  className = "",
  charClassName = "",
  delay = 40,
  duration = 0.5,
}: SplitTextProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <span className={className}>{text}</span>;
  }

  let charIndex = 0;
  return (
    <LazyMotion features={domMax}>
      <span className={className} aria-label={text}>
        {text.split(" ").map((word, wordIdx) => (
          <span key={wordIdx} className="inline-block whitespace-pre">
            {word.split("").map((char, i) => {
              const current = charIndex++;
              return (
                <m.span
                  key={i}
                  className={`inline-block will-change-transform ${charClassName}`}
                  aria-hidden="true"
                  initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{
                    delay: (current * delay) / 1000,
                    duration,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {char}
                </m.span>
              );
            })}
            {wordIdx < text.split(" ").length - 1 ? "\u00A0" : ""}
          </span>
        ))}
      </span>
    </LazyMotion>
  );
}
