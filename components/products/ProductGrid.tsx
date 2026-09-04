import type { Product } from "@/lib/shopify/types";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return <p>No hay productos para mostrar.</p>;
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          // La primera fila queda above-the-fold en cualquier breakpoint
          // (máx. 7 columnas en xl); eager evita el aviso de LCP.
          eager={index < 7}
        />
      ))}
    </div>
  );
}
