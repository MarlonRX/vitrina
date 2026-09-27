// React Bits - ShinyText (reactbits.dev/components/shiny-text): barrido de
// brillo periódico sobre el texto. Puro CSS (styles/reactbits.css), funciona
// en servidor y cliente.

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
  color?: string;
  shineColor?: string;
}

export default function ShinyText({
  text,
  disabled = false,
  speed = 3,
  className = "",
  color = "var(--text-secondary)",
  shineColor = "var(--text-primary)",
}: ShinyTextProps) {
  return (
    <span
      className={`shiny-text ${className}`}
      style={{
        backgroundImage: `linear-gradient(120deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
        animationDuration: disabled ? "0s" : `${speed}s`,
      }}
    >
      {text}
    </span>
  );
}
