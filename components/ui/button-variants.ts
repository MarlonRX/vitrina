// S-09 (react-doctor only-export-components): las variantes de estilo dejaron
// de exportarse desde button.tsx — ese archivo ahora solo exporta componentes
// y tipos, así Fast Refresh preserva el estado de los componentes.
export const buttonVariants = {
  variant: {
    default: [
      "text-(--text-inverted) shadow-sm hover:shadow-lg",
      "hover:-translate-y-0.5 active:translate-y-0 active:shadow-md",
    ].join(" "),
    secondary: [
      "border border-(--border-primary) bg-(--bg-secondary)",
      "text-(--text-primary) hover:bg-(--bg-surface)",
    ].join(" "),
    outline: [
      "border border-(--border-primary) bg-transparent",
      "text-(--text-primary) hover:bg-(--bg-secondary)",
    ].join(" "),
    ghost: [
      "bg-transparent text-(--text-primary)",
      "hover:bg-(--bg-secondary)",
    ].join(" "),
    destructive: [
      "text-white shadow-sm hover:shadow-lg",
      "hover:-translate-y-0.5 active:translate-y-0 active:shadow-md",
    ].join(" "),
    link: "h-auto p-0 underline-offset-4 hover:underline",
  },
  color: {
    primary: {
      default: "bg-linear-to-r from-(--accent-primary) to-(--accent-hover)",
      secondary: "hover:border-(--accent-primary)/50",
      outline: "hover:border-(--accent-primary)/50",
      ghost: "hover:text-(--accent-primary)",
      destructive: "bg-red-500 hover:bg-red-600",
      link: "text-(--accent-primary)",
    },
    neutral: {
      default: "bg-linear-to-r from-(--accent-secondary) to-(--border-secondary)",
      secondary: "hover:border-(--border-secondary)",
      outline: "hover:border-(--border-secondary)",
      ghost: "hover:text-(--text-secondary)",
      destructive: "bg-red-500 hover:bg-red-600",
      link: "text-(--text-primary)",
    },
    success: {
      default: "bg-[rgb(var(--semantic-success-rgb))] hover:bg-[rgba(var(--semantic-success-rgb),0.92)]",
      secondary: "hover:border-[rgba(var(--semantic-success-rgb),0.45)] hover:text-[rgb(var(--semantic-success-rgb))]",
      outline: "hover:border-[rgba(var(--semantic-success-rgb),0.45)] hover:text-[rgb(var(--semantic-success-rgb))]",
      ghost: "hover:text-[rgb(var(--semantic-success-rgb))] hover:bg-[rgba(var(--semantic-success-rgb),0.12)]",
      destructive: "bg-red-500 hover:bg-red-600",
      link: "text-[rgb(var(--semantic-success-rgb))]",
    },
    danger: {
      default: "bg-[rgb(var(--semantic-error-rgb))] hover:bg-[rgba(var(--semantic-error-rgb),0.92)]",
      secondary: "hover:border-[rgba(var(--semantic-error-rgb),0.45)] hover:text-[rgb(var(--semantic-error-rgb))]",
      outline: "hover:border-[rgba(var(--semantic-error-rgb),0.45)] hover:text-[rgb(var(--semantic-error-rgb))]",
      ghost: "hover:text-[rgb(var(--semantic-error-rgb))] hover:bg-[rgba(var(--semantic-error-rgb),0.12)]",
      destructive: "bg-[rgb(var(--semantic-error-rgb))] hover:bg-[rgba(var(--semantic-error-rgb),0.92)]",
      link: "text-[rgb(var(--semantic-error-rgb))]",
    },
  },
  size: {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 py-2 text-sm",
    lg: "h-11 px-6 text-base",
    icon: "h-10 w-10 p-0",
  },
} as const;
