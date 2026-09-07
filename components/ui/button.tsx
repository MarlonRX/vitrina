import * as React from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button-variants";

// S-09 (react-doctor only-export-components): `buttonVariants` se movió a
// ./button-variants.ts. Este archivo solo exporta componentes y tipos para
// que Fast Refresh preserve el estado.
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
          "inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap",
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
