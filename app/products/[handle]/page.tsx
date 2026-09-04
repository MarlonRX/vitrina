import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadProduct } from "@/lib/shopify/loaders";
import ClientProductDetail from "./ClientProductDetail";

export const dynamic = "force-dynamic";

type ProductPageProps = PageProps<"/products/[handle]">;

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const { product } = await loadProduct(handle);
  return { title: product ? product.title : "Producto no encontrado" };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const { product } = await loadProduct(handle);

  console.log(product)
  if (!product) {
    notFound();
  }

  return <ClientProductDetail product={product} />;
}
