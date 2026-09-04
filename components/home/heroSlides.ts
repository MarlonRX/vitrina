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
export const heroSlides: HeroSlide[] = [
  {
    eyebrow: "Nueva temporada",
    titleLines: ["La montaña", "empieza aquí."],
    description:
      "Tablas y equipo seleccionado para quienes suben por el placer de bajar.",
    image:
      "https://cdn.shopify.com/s/files/1/0604/6344/8110/files/Main.jpg?v=1787793614",
    href: "/products",
  },
  {
    eyebrow: "Colección altura",
    titleLines: ["Diseñado para", "la nieve polvo."],
    description:
      "Perfiles anchos, flotación real y geometría pensada para días largos fuera de pista.",
    image:
      "https://cdn.shopify.com/s/files/1/0604/6344/8110/files/Main_589fc064-24a2-4236-9eaf-13b2bd35d21d.jpg?v=1787793614",
    href: "/products",
  },
  {
    eyebrow: "Equipo completo",
    titleLines: ["Botas, fijaciones", "y capas base."],
    description:
      "Todo lo que cierra el círculo entre el primer remontaje y la última bajada del día.",
    image:
      "https://cdn.shopify.com/s/files/1/0604/6344/8110/files/snowboard_purple_hydrogen.jpg?v=1787793614",
    href: "/collections",
  },
];
