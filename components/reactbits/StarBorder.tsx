// React Bits - StarBorder (reactbits.dev/components/star-border): borde con
// dos cometas de luz que lo recorren. Puro CSS; `as` permite usarlo como
// enlace (Link) sin perder la animación.
import type React from "react";

type StarBorderProps<T extends React.ElementType> = React.ComponentPropsWithoutRef<T> & {
  as?: T;
  className?: string;
  children?: React.ReactNode;
  color?: string;
  speed?: React.CSSProperties["animationDuration"];
  thickness?: number;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
};

export default function StarBorder<T extends React.ElementType = "button">({
  as,
  className = "",
  color = "var(--accent-primary)",
  speed = "6s",
  thickness = 1,
  backgroundColor = "transparent",
  textColor = "var(--text-primary)",
  borderColor = "var(--border-secondary)",
  children,
  ...rest
}: StarBorderProps<T>) {
  const Component = (as || "button") as React.ElementType;

  return (
    <Component
      className={`relative inline-block overflow-hidden rounded-none ${className}`}
      {...rest}
      style={{
        padding: `${thickness}px 0`,
        ...(rest as { style?: React.CSSProperties }).style,
      }}
    >
      <div
        aria-hidden
        className="animate-star-movement-bottom absolute bottom-[-11px] right-[-250%] z-0 h-[50%] w-[300%] rounded-full opacity-70"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div
        aria-hidden
        className="animate-star-movement-top absolute top-[-10px] left-[-250%] z-0 h-[50%] w-[300%] rounded-full opacity-70"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div
        className="relative z-1 rounded-none px-5 py-2.5 text-center text-sm font-semibold"
        style={{
          background: backgroundColor,
          color: textColor,
          border: `1px solid ${borderColor}`,
        }}
      >
        {children}
      </div>
    </Component>
  );
}
