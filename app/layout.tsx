import type { Metadata } from "next";
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
        <div className="mx-auto w-[80%] px-4 py-10">
          {children}
        </div>
        {/* S-14o: aviso global de "producto agregado" (fixed, fuera del
            contenedor para poder pegarse al borde inferior de la pantalla). */}
        <Toaster />
      </body>
    </html>
  );
}
