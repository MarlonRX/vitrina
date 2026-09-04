"use client";
import React, { useId } from "react";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "../ui/calendar";
import type { Matcher } from "react-day-picker";

interface MyDatePickerProps {
  label?: string;
  name?: string;
  value?: string;
  onChange?: (event: { target: { name: string; value: string } }) => void;
  error?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
  min?: string;
  max?: string;
}

export const MyDatePicker = React.forwardRef<HTMLButtonElement, MyDatePickerProps>(
  ({ label, name = "", value, onChange, error, required, className, placeholder, min, max }, ref) => {
    const [open, setOpen] = React.useState(false);
    const autoId = useId();
    const buttonId = `datepicker-${autoId}`;

    const selectedDate = React.useMemo(() => {
      if (!value) return undefined;
      const d = new Date(value + "T00:00:00");
      return isNaN(d.getTime()) ? undefined : d;
    }, [value]);

    const handleSelect = (date: Date | undefined) => {
      if (date && name && onChange) {
        // Always pass ISO string "YYYY-MM-DD" via e.target.value
        const iso = date.toISOString().slice(0, 10);
        onChange({ target: { name, value: iso } });
        setOpen(false);
      }
    };

    const disabledDays = React.useMemo(() => {
      const matchers: Matcher[] = [];

      if (min) {
        const minDate = new Date(min + "T00:00:00");
        if (!isNaN(minDate.getTime())) {
          matchers.push({ before: minDate });
        }
      }

      if (max) {
        const maxDate = new Date(max + "T00:00:00");
        if (!isNaN(maxDate.getTime())) {
          matchers.push({ after: maxDate });
        }
      }

      return matchers.length > 0 ? matchers : undefined;
    }, [min, max]);

    const formattedDate = React.useMemo(() => {
      if (!selectedDate) return null;
      return selectedDate.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }, [selectedDate]);

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={buttonId} className="block text-sm font-medium text-(--text-primary)">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              ref={ref}
              id={buttonId}
              type="button"
              data-empty={!value}
              className={cn(
                "w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm outline-none transition-colors",
                "border border-(--border-primary) bg-(--bg-secondary) text-(--text-primary)",
                "hover:border-(--accent-primary)/50 focus:ring-2 focus:ring-(--accent-primary)/30 focus:border-(--accent-primary)",
                "data-[empty=true]:text-(--text-tertiary)",
                error && "border-red-500 focus:ring-red-500/30",
                className
              )}
            >
              <span className="flex items-center gap-2 truncate">
                <CalendarIcon className="h-4 w-4 opacity-50 shrink-0" />
                {formattedDate || placeholder || "Seleccionar fecha"}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              defaultMonth={selectedDate}
              disabled={disabledDays}
              autoFocus
            />
          </PopoverContent>
        </Popover>
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

MyDatePicker.displayName = "MyDatePicker";