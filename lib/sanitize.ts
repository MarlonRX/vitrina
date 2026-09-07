import DOMPurify from "isomorphic-dompurify";

// S-09 (react-doctor dangerous-html-sink): la descripción rica de Shopify es
// HTML controlado por el merchandiser del store, no por nosotros. Antes de
// inyectarla con dangerouslySetInnerHTML se sanea con una lista conservadora
// de etiquetas de texto — sin scripts, sin iframes, sin manejadores de evento.
const ALLOWED_TAGS = [
  "p", "br", "hr", "div", "span",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "strong", "b", "em", "i", "u", "s", "small", "sub", "sup",
  "blockquote", "pre", "code",
  "a", "table", "thead", "tbody", "tr", "td", "th",
];

export function sanitizeProductHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ["href", "title", "target", "rel", "colspan", "rowspan"],
  });
}
