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
   * Imagen de la diapositiva. S-17: ya no es fondo a sangre sino pieza
   * enmarcada del módulo visual (el fondo lo pone la aurora), así que la
   * composición puede ser vertical u horizontal sin romper el texto.
   *
   * Formato recomendado: WebP/JPG < 300 KB; URL absoluta o de `/public`
   * (los dominios remotos deben estar en `images.remotePatterns` de
   * `next.config.ts`).
   */
  image: string;
  /**
   * Destino del CTA y del enlace de la barra de info de la diapositiva.
   */
  href: string;
  /**
   * S-17: paleta de la aurora de fondo mientras esta diapositiva está
   * activa. El fondo viaja suave de una paleta a la siguiente (lerp en
   * `Aurora`), así el escenario cambia al compás del carrusel.
   */
  palette: [string, string, string];
}

/**
 * Placeholders: ilustraciones del propio catálogo demo, alojadas en el CDN de
 * la tienda (dominio ya permitido en `remotePatterns`).
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
    palette: ["#8c2f3a", "#b4653a", "#d9a066"],
  },
  {
    eyebrow: "Luz cálida",
    titleLines: ["La casa se enciende", "de a poco."],
    description:
      "Lámparas y difusores que filtran la tarde antes de que caiga el sol.",
    image:
      "https://cdn.shopify.com/s/files/1/0604/6344/8110/files/vit-hero-luz.jpg?v=1788752345",
    href: "/products?collection=iluminacion",
    palette: ["#c08a2e", "#e0b45c", "#8c2f3a"],
  },
  {
    eyebrow: "Hilo y telar",
    titleLines: ["Textiles que", "abrigan el piso."],
    description:
      "Mantas, cojines y alfombras tejidos con lana de origen trazable.",
    image:
      "https://cdn.shopify.com/s/files/1/0604/6344/8110/files/vit-hero-textil.jpg?v=1788752341",
    href: "/products?collection=textil",
    palette: ["#a2596a", "#8c2f3a", "#d9c6a8"],
  },
];
