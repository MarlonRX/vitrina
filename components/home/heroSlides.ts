/**
 * Datos de las diapositivas del hero.
 *
 * Viven aparte del componente para poder cargarlos como arreglo desde
 * cualquier fuente (constante local, CMS, fetch, etc.) y pasarlos al
 * carrusel vía prop `slides`. Se mantienen sin JSX (`titleLines` en vez de
 * ReactNode) para que el arreglo sea serializable.
 */

export interface HeroSlide {
  /** Kicker en versalitas sobre el título. */
  eyebrow: string;
  /** Título partido por líneas: cada elemento se pinta en su propia línea. */
  titleLines: string[];
  description: string;
  /**
   * Imagen de fondo que cubre toda la diapositiva (se recorta con
   * `object-cover` y se oscurece con un scrim para que el texto se lea).
   *
   * Formato recomendado:
   * - Tamaño: 1920x1080 px (16:9). Mínimo aceptable: 1440x810 px.
   * - Extensión: WebP o AVIF (JPG/PNG también funciona; `next/image` la
   *   re-optimize). Peso objetivo: < 300 KB en la variante de escritorio.
   * - Composición: mantén el punto de interés centrado. El tercio izquierdo
   *   queda cubierto por el texto y el scrim oscuro, y el borde inferior se
   *   desvanece hacia el fondo de la página.
   * - URL: absoluta (`https://…`) o de `/public` (`/hero.webp`). Si es un
   *   dominio remoto, debe estar listado en `images.remotePatterns` de
   *   `next.config.ts`, o `next/image` lo rechazará con error 400.
   */
  image: string;
  /**
   * Destino al que navega la diapositiva entera al hacer clic. No hay
   * botones internos: toda la superficie es el enlace.
   */
  href: string;
}

/**
 * Placeholders: fotos de producto del CDN de la tienda (dominio ya
 * permitido en `remotePatterns`). Sustituir por imágenes reales de hero
 * cuando estén disponibles.
 */
/**
 * Placeholders: ilustraciones del propio catálogo demo, alojadas en el CDN de
 * la tienda (dominio ya permitido en `remotePatterns`). Composición vertical
 * 1200x1500 — el carrusel las recorta con `object-cover`.
 */
export const heroSlides: HeroSlide[] = [
  {
    eyebrow: "Taller de barro",
    titleLines: ["Hecho a mano,", "pieza sobre pieza."],
    description:
      "Cerámica de torno y pasta, vidriada en pequeños lotes para la mesa diaria.",
    image:
      "https://cdn.shopify.com/s/files/1/0604/6344/8110/files/vit-hero-ceramica.jpg?v=1788752337",
    href: "/products?collection=ceramica",
  },
  {
    eyebrow: "Luz cálida",
    titleLines: ["La casa se enciende", "de a poco."],
    description:
      "Lámparas y difusores que filtran la tarde antes de que caiga el sol.",
    image:
      "https://cdn.shopify.com/s/files/1/0604/6344/8110/files/vit-hero-luz.jpg?v=1788752345",
    href: "/products?collection=iluminacion",
  },
  {
    eyebrow: "Hilo y telar",
    titleLines: ["Textiles que", "abrigan el piso."],
    description:
      "Mantas, cojines y alfombras tejidos con lana de origen trazable.",
    image:
      "https://cdn.shopify.com/s/files/1/0604/6344/8110/files/vit-hero-textil.jpg?v=1788752341",
    href: "/products?collection=textil",
  },
];
