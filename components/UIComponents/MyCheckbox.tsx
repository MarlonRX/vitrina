"use client";

import React, { useId } from "react";
import { cn } from "@/lib/utils";

// S-11 (sistema de diseño): checkbox de marca. Internamente sigue siendo un
// <input type="checkbox"> nativo — se viste con la clase .my-checkbox de
// globals.css — para conservar gratis el valor en formularios GET, teclado y
// semántica para lectores de pantalla (lección S-10: no reinventar el control).

interface MyCheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  /** checkbox (default) o radio — mismo vestido de marca, semántica nativa. */
  type?: "checkbox" | "radio";
}

export const MyCheckbox = React.forwardRef<HTMLInputElement, MyCheckboxProps>(
  ({ label, className, id, type = "checkbox", ...props }, ref) => {
    const autoId = useId();
    const inputId = id || autoId;

    const input = (
      <input
        ref={ref}
        id={inputId}
        type={type}
        className={cn(type === "radio" ? "my-checkbox my-radio" : "my-checkbox", className)}
        {...props}
      />
    );

    if (!label) return input;

    return (
      <label htmlFor={inputId} className="group flex cursor-pointer items-center gap-2.5 text-sm text-(--text-primary) select-none">
        {input}
        <span className="transition-colors group-hover:text-(--accent-primary)">
          {label}
        </span>
      </label>
    );
  },
);

MyCheckbox.displayName = "MyCheckbox";

export default MyCheckbox;
