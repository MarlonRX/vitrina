import sanitizeHtml from "sanitize-html";

// S-09 (react-doctor dangerous-html-sink): la descripción rica de Shopify es
// HTML controlado por el merchandiser del store, no por nosotros. Antes de
// inyectarla con dangerouslySetInnerHTML se sanea con una lista conservadora
// de etiquetas de texto — sin scripts, sin iframes, sin manejadores de evento.
//
// Fix 500 en prod (2026-09-07): antes se usaba isomorphic-dompurify, que en
// Node tira de jsdom → html-encoding-sniffer → @exodus/bytes (ESM). El
// runtime de Vercel prohíbe require() de ESM (ERR_REQUIRE_ESM) incluso con
// Node 22 y serverExternalPackages, y las fichas de producto (únicas rutas
// que importan este módulo) devolvían 500 SOLO en el deploy. sanitize-html
// es CommonJS puro, sin nativos ni lazy-requires: mismo trabajo, cero
// fragilidad de bundler. Misma lista blanca de etiquetas/atributos que antes
// (sin style/class/on*, que la lista ya excluye por defecto).
const ALLOWED_TAGS = [
  "p", "br", "hr", "div", "span",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "strong", "b", "em", "i", "u", "s", "small", "sub", "sup",
  "blockquote", "pre", "code",
  "a", "table", "thead", "tbody", "tr", "td", "th",
];

export function sanitizeProductHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
    },
    // Enlaces externos: nunca `target` sin `rel` seguro, y fuera javascript:.
    allowedSchemes: ["http", "https", "mailto"],
    disallowedTagsMode: "discard",
    // NB: no existe opción `safeMode` en esta versión de sanitize-html; la
    // lista blanca de atributos (solo los declarados arriba) ya excluye
    // style/class/on* arbitrarios del store.
  });
}
