import { shopify } from "@/lib/shopify";
import ClientCollections from "./ClientCollections";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  let collections: Awaited<ReturnType<typeof shopify.getCollections>> | null =
    null;
  let apiError = false;
  try {
    collections = await shopify.getCollections();
  } catch (error) {
    apiError = true;
    console.error("[collections] Shopify query failed:", error);
  }

  return (
    <ClientCollections
      collections={collections?.collections.edges.map((edge) => edge.node) ?? []}
      apiError={apiError}
    />
  );
}
