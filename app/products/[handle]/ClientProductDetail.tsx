import type { Product } from "@/lib/shopify/types";
import ProductOptions from "./partials/ProductOptions";
import ProductGallery from "./partials/ProductGallery";

export default function ClientProductDetail({
  product,
}: {
  product: Product;
}) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery
          images={product.images.edges.map((edge) => edge.node)}
          alt={product.title}
        />
        <div className="flex flex-col gap-4">
          <h1>{product.title}</h1>
          <p className="text-sm text-(--text-secondary)">{product.vendor}</p>
          <ProductOptions product={product} />
        </div>
      </div>

      <section className="max-w-prose">
        <h2>Descripción</h2>
        <div dangerouslySetInnerHTML={{ __html: product.description }} />
      </section>
    </main>
  );
}
