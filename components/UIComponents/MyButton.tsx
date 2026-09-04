"use client";

import React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface MyButtonProps extends ButtonProps {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  tooltip?: string;
}

export const MyButton = React.forwardRef<HTMLButtonElement, MyButtonProps>(
  (
    {
      children,
      className,
      disabled,
      loading = false,
      leftIcon,
      rightIcon,
      tooltip = "",
      ...props
    },
    ref,
  ) => {
    const button = (
      <Button
        ref={ref}
        disabled={disabled || loading}
        className={cn("shrink-0", className)}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </Button>
    );

    if (tooltip.length === 0) {
      return button;
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);

MyButton.displayName = "MyButton";

export default MyButton;
