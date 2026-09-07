import { CollectionsSkeleton } from "@/components/products/Skeletons";

// S-14p: espejo de ClientCollections — main sin tope + encabezado centrado +
// grilla max-w-5xl de tarjetas 4:3.
export default function CollectionsLoading() {
  return (
    <main className="mx-auto flex w-full flex-col gap-6 py-2">
      <CollectionsSkeleton />
    </main>
  );
}
