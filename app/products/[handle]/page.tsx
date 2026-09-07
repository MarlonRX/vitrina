import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadProduct } from "@/lib/shopify/loaders";
import { absoluteUrl, plainDescription } from "@/lib/seo";
import ClientProductDetail from "./ClientProductDetail";

export const dynamic = "force-dynamic";

type ProductPageProps = PageProps<"/products/[handle]">;

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const { product } = await loadProduct(handle);

  if (!product) {
    return { title: "Producto no encontrado" };
  }

  const description = plainDescription(
    product.description || `${product.title} de ${product.vendor} en Vitrina.`,
  );
  const image = product.featuredImage?.url;

  return {
    title: product.title,
    description,
    alternates: { canonical: absoluteUrl(`/products/${product.handle}`) },
    openGraph: {
      type: "website",
      title: product.title,
      description,
      url: absoluteUrl(`/products/${product.handle}`),
      images: image
        ? [
            {
              url: image,
              alt: product.featuredImage?.altText ?? product.title,
              width: product.featuredImage?.width ?? undefined,
              height: product.featuredImage?.height ?? undefined,
            },
          ]
        : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const { product } = await loadProduct(handle);

  if (!product) {
    notFound();
  }

  return <ClientProductDetail product={product} />;
}
