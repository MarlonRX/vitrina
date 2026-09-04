import { shopify } from "@/lib/shopify";
import ClientCollections from "./ClientCollections";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const { collections } = await shopify.getCollections();

  return <ClientCollections collections={collections.edges.map((edge) => edge.node)} />;
}
