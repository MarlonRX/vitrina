// Utilidades SEO base (S-04 dentro de S-02a06): URL de sitio para
// metadataBase/canonicals/JSON-LD y limpieza de descripciones de Shopify.

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}

// Shopify devuelve `description` como texto rico (HTML): para meta tags y
// open graph se reduce a texto plano con longitud acotada.
export function plainDescription(html: string, maxLength = 160): string {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

// S-09 (react-doctor unsafe-json-in-html): JSON.stringify no escapa HTML, así
// que un `</script>` dentro de un título de producto rompería el bloque JSON-LD
// y se convertiría en XSS. Se escapan <, > y & como secuencias unicode: el JSON
// sigue siendo idéntico para el parser de Google, pero ya no puede cerrar el tag.
export function jsonLdHtml(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
