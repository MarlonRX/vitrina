import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar/Navbar";
import Toaster from "@/components/ui/Toaster";
import { SITE_URL } from "@/lib/seo";

const fontSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

// S-12 (identidad): los @theme inline de globals.css YA referenciaban estas
// variables (display→h1–h6 en serif Fraunces) pero nadie las cargaba, así
// que todo caía al sans. Fraunces: serif variable con eje óptico, carácter
// editorial cálido (referencia: Claude/Anthropic vía popular-web-designs).
const fontDisplay = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  // eje SOFT/WONK en cero = curvas limpias sin excentricidad; peso óptico
  // (opsz) se resuelve solo por tamaño de fuente (variable).
  axes: ["SOFT", "WONK"],
});

// mono = Space Grotesk (tablas/skeletos ya la usan vía --font-mono).
const fontMono = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

// S-14q (CAÍDA MADRE del responsive): hasta aquí el layout NUNCA exportó
// `viewport` (en Next ≥14 es un export separado de `metadata`). Sin la meta
// width=device-width, el navegador móvil/tableta simulaba un viewport de
// ~980px y ENCOGÍA la página entera: por eso el catálogo mostraba 5 columnas
// ilegibles, el header de escritorio con INICIO/PRODUCTOS/COLECCIONES y el
// botón hamburguesa quedaba invisible (los `md:` se activaban contra los
// 980px simulados, no contra los ~390 reales). Con esta meta los breakpoints
// vuelven a ver el ancho físico del aparato.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // El pinch-zoom sigue permitido: bloquearlo es falla de accesibilidad.
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Vitrina — Tienda de diseño y artesanía",
    template: "%s | Vitrina",
  },
  description:
    "Catálogo de productos de diseño y artesanía: cerámica, iluminación y decoración seleccionada por Vitrina.",
  openGraph: {
    siteName: "Vitrina",
    type: "website",
    locale: "es_ES",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        {/* S-14q: en móvil el contenedor es casi todo el ancho (el 80% de un
            teléfono dejaba ~300px y aplastaba grilla y filtros); el tope del
            80% solo aplica desde md. `py-10` se conserva: el hero compensa ese
            padding con su -mt-30. */}
        <div className="mx-auto w-full px-4 py-10 md:w-[80%]">
          {children}
        </div>
        {/* S-14o: aviso global de "producto agregado" (fixed, fuera del
            contenedor para poder pegarse al borde inferior de la pantalla). */}
        <Toaster />
      </body>
    </html>
  );
}
