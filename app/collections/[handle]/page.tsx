import { notFound } from "next/navigation";
import { shopify } from "@/lib/shopify";
import ClientCollectionProducts from "./ClientCollectionProducts";

export const dynamic = "force-dynamic";

export default async function CollectionPage({
  params,
  searchParams,
}: PageProps<"/collections/[handle]">) {
  const { handle } = await params;
  const { cursor } = await searchParams;
  const after = typeof cursor === "string" ? cursor : undefined;
  const { collection } = await shopify.getCollectionProducts(handle, after);

  if (!collection) {
    notFound();
  }

  const loadMoreHref =
    collection.products.pageInfo.hasNextPage &&
    collection.products.pageInfo.endCursor
      ? `/collections/${handle}?cursor=${encodeURIComponent(
          collection.products.pageInfo.endCursor,
        )}`
      : undefined;

  return (
    <ClientCollectionProducts collection={collection} loadMoreHref={loadMoreHref} />
  );
}
