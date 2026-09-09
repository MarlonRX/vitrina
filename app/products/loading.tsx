import { GridSkeleton } from "@/components/products/skeletons/Grid";

// S-14p: espejo del layout real de /products (ClientProducts usa div, no
// main, dentro del contenedor del ochenta por ciento del layout raíz).
export default function ProductsLoading() {
  return <GridSkeleton />;
}
