// S-11 (sistema de diseño): las clases de campo viven AQUÍ y solo aquí.
// MyInput, MyTextArea y MySelect las componen; ningún componente de vista
// debe volver a escribir un borde de campo a mano. Archivo no-componente a
// propósito (regla only-export-components de react-doctor del S-09: los
// estilos desacoplados del .tsx mantienen Fast Refresh intacto).
//
// Personalidad: boutique editorial — hairline, halo de foco suave, radio
// uniforme `rounded-md`, error con token semántico (jamás red-500 suelto).
// Los tokens rgb del repo ya vienen separados por comas (--accent-primary-rgb:
// 140, 47, 58), así que rgba(var(--x), a) funciona directo.

export const FIELD_CONTROL_BASE = [
  "w-full rounded-md border border-(--border-primary) bg-(--bg-surface)",
  "px-3 text-sm text-(--text-primary) placeholder:text-(--text-tertiary)",
  "outline-none transition-[border-color,box-shadow] duration-200",
  "hover:border-(--border-secondary)",
  "focus:border-(--accent-primary) focus:shadow-[0_0_0_3px_rgba(var(--accent-primary-rgb),0.14)]",
  "disabled:cursor-not-allowed disabled:opacity-50",
].join(" ");

export const FIELD_CONTROL_ERROR = [
  "border-[rgb(var(--semantic-error-rgb))]",
  "hover:border-[rgb(var(--semantic-error-rgb))]",
  "focus:border-[rgb(var(--semantic-error-rgb))]",
  "focus:shadow-[0_0_0_3px_rgba(var(--semantic-error-rgb),0.16)]",
].join(" ");

export const FIELD_LABEL =
  "flex items-center justify-between gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-(--text-secondary)";

export const FIELD_ERROR_TEXT =
  "text-xs font-medium text-[rgb(var(--semantic-error-rgb))]";

export const FIELD_HELP_TEXT = "text-xs text-(--text-tertiary)";
