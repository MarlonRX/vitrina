import { GridSkeleton } from "@/components/products/Skeletons";

// S-14p: espejo del detalle de colección (main sin tope + encabezado
// centrado + filtros 300px + grilla full de 14).
export default function CollectionLoading() {
  return (
    <main className="mx-auto flex w-full flex-col gap-6 py-2">
      <GridSkeleton centered />
    </main>
  );
}
