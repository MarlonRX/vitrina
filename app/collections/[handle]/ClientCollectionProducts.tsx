import type { CollectionWithProducts } from "@/lib/shopify/types";
import Link from "next/link";
import ProductGrid from "@/components/products/ProductGrid";

export default function ClientCollectionProducts({
  collection,
  loadMoreHref,
}: {
  collection: CollectionWithProducts;
  loadMoreHref?: string;
}) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-1">
        <h1>{collection.title}</h1>
        <p className="text-sm text-(--text-secondary)">
          {collection.description}
        </p>
      </div>

      <ProductGrid
        products={collection.products.edges.map((edge) => edge.node)}
      />

      {loadMoreHref && (
        <Link href={loadMoreHref} className="text-sm underline">
          Cargar más
        </Link>
      )}
    </main>
  );
}
