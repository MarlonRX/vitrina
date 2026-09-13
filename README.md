# Vitrina

<img src='docs/assets/vitrina-hero.webp' width='800'>

<video src='docs/assets/vitrina-promo.webm' controls width='800' loop>
  Tu navegador no soporta el vídeo.
</video>

Storefront headless de e-commerce sobre **Shopify Storefront API**, construida con Next.js (App Router) + TypeScript + Tailwind CSS 4. Incluye un **modo mock** para desarrollar sin credenciales: con `SHOPIFY_MOCK=true` (o si faltan las credenciales) toda la tienda funciona con datos locales.

## Características

- **Home** con carrusel hero y productos destacados (ISR, `revalidate=60`).
- **Catálogo** con grid de fichas, filtros, detalle de producto con carrito de opciones.
- **Colecciones**: listado y página de productos por colección.
- **Búsqueda** `/search?q=` paginada, con input en la navbar (escritorio y móvil).
- **Carrito** con estado global en Zustand (persistente) y resumen de compra.
- **Checkout real con Shopify** vía `cartCreate` (`/api/checkout`) con redirección a la web de Shopify y banner de estado al volver; modo **checkout demo** para presentaciones (`NEXT_PUBLIC_DEMO_CHECKOUT`).
- **Descubrimiento y SEO**: `generateMetadata` + Open Graph por página, `sitemap.ts`, `robots.ts`, canonical por `?page=N`, breadcrumbs con JSON-LD `BreadcrumbList`.
- **Paginación** compartible `?page=N` sobre cursores de la Storefront API.
- **Rendimiento**: Data Cache de `fetch` por operación (catálogo 60 s, producto/colecciones 1 h, facetas 10 min) y purga programática vía `/api/revalidate`.
- **Librería UI propia** (botones, inputs, drawer, popover, tooltip, tabla, calendario…) sobre Tailwind + Radix + HeroUI.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · HeroUI · Radix UI · Zustand · Shopify Storefront API (GraphQL) · `@shopify/hydrogen-react` · Zod · Bun como gestor de paquetes.

## Requisitos

- **Node.js 22.x** (fijado en `engines`: necesario para `require(esm)` en el runtime de Vercel).
- **Bun 1.3+** (packageManager declarado en `package.json`).
- Opcional para datos reales: una tienda Shopify con **Storefront API** (dominio + private access token).

## Instalación

```bash
bun install
# crea .env con las variables de abajo (o arranca sin ellas en modo mock)
bun run dev            # http://localhost:3000
```

Sin credenciales, la app arranca en modo mock automáticamente.

### Variables de entorno

| Variable | Descripción |
| --- | --- |
| `SHOPIFY_STORE_DOMAIN` | Dominio de la tienda (ej. `mi-tienda.myshopify.com`). |
| `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` | Token privado de la Storefront API. |
| `SHOPIFY_STOREFRONT_VERSION` | Versión de la API (ej. `2026-01`). |
| `SHOPIFY_MOCK` | `"true"` fuerza datos simulados. |
| `NEXT_PUBLIC_DEMO_CHECKOUT` | Checkout simulado para demos; pon `"0"` para el flujo real de Shopify. |
| `REVALIDATE_SECRET` | Secreto para purgar el caché vía `/api/revalidate`. |

## Scripts

```bash
bun run dev     # next dev — servidor de desarrollo
bun run build   # next build — build de producción
bun run start   # next start — servir el build
bun run lint    # eslint — único check obligatorio del repo
```

## Estructura del proyecto

```
app/               # rutas (App Router): home, products, collections, cart, search, api/
components/        # UI: layout, home, products, cart, checkout + librería (ui/, UIComponents/)
lib/               # helpers y capa Shopify (client, queries, mock, search, pagination, seo)
stores/            # estado global Zustand (cart, toast)
schemas/           # esquemas de datos (Zod)
interface/         # tipos compartidos
styles/            # CSS adicional
scripts/           # utilidades de desarrollo (Python)
specs/             # fuente de verdad del proyecto (estado actual + roadmap)
docs/              # materiales de documentación (assets del README)
```
