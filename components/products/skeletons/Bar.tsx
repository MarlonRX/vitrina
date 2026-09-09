// S-14p: barra base de los esqueletos (renglón shimmer redondeado).
// Compartida por las familias de esqueletos (Grid, Detail, Collections).

const bar = "skeleton-shimmer rounded-full";

export function Bar({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return <div aria-hidden className={`${bar} ${className}`} style={style} />;
}
