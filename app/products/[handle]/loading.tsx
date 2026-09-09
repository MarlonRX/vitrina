import { ProductDetailSkeleton } from "@/components/products/skeletons/Detail";

// S-14p: espejo de ClientProductDetail — mismo `main` sin tope del ochenta
// por ciento con el detalle de VariantViewer.
export default function ProductDetailLoading() {
  return (
    <main className="mx-auto flex w-full flex-col gap-8">
      <ProductDetailSkeleton />
    </main>
  );
}
