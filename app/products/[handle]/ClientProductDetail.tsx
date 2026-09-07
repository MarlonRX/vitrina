import type { Product } from "@/lib/shopify/types";
import Breadcrumbs from "@/components/Breadcrumbs";
import { jsonLdHtml } from "@/lib/seo";
import { sanitizeProductHtml } from "@/lib/sanitize";
import VariantViewer from "./partials/VariantViewer";

// JSON-LD Product (S-03/S-04): precio mínimo + disponibilidad reales.
function productJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description.replace(/<[^>]*>/g, " ").trim(),
    sku: product.variants.edges[0]?.node.id ?? product.id,
    brand: { "@type": "Brand", name: product.vendor },
    ...(product.featuredImage ? { image: [product.featuredImage.url] } : {}),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      lowPrice: product.priceRange.minVariantPrice.amount,
      highPrice: product.priceRange.maxVariantPrice.amount,
      offerCount: product.variants.edges.length,
      availability: product.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };
}

export default function ClientProductDetail({
  product,
}: {
  product: Product;
}) {
  const collection = product.collections.edges[0]?.node;

  return (
    // S-14o: sin tope max-w-6xl ni relleno lateral propio — el layout raíz ya
    // da el contenedor del ochenta por ciento; aquí ese tope dejaba la ficha
    // ocupando la mitad de la pantalla.
    <main className="mx-auto flex w-full flex-col gap-8">
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Catálogo", href: "/products" },
          ...(collection
            ? [
                {
                  label: collection.title,
                  href: `/collections/${collection.handle}`,
                },
              ]
            : []),
          { label: product.title },
        ]}
      />

      {/* S-14: galería + opciones comparten estado dentro de VariantViewer. */}
      <VariantViewer product={product} />

      <section className="max-w-prose">
        <h2>Descripción</h2>
        <div dangerouslySetInnerHTML={{ __html: sanitizeProductHtml(product.description) }} />
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(productJsonLd(product)) }}
      />
    </main>
  );
}
