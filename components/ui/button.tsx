import * as React from "react";
import { cn } from "@/lib/utils";

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

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants.variant;
  color?: keyof typeof buttonVariants.color;
  size?: keyof typeof buttonVariants.size;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", color = "primary", size = "md", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap",
          "transition-all duration-200 outline-none",
          "focus-visible:ring-2 focus-visible:ring-(--accent-primary)/30",
          "disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:translate-y-0",
          buttonVariants.variant[variant],
          buttonVariants.color[color][variant],
          buttonVariants.size[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
