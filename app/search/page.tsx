import { redirect } from "next/navigation";

type SearchPageProps = PageProps<"/search">;

/**
 * S-13: la búsqueda vive ahora en el catálogo (/products?q=…), donde el
 * panel de filtros permite combinar términos con facetas. Esta ruta se
 * conserva como redirección permanente para enlaces/bookmarks antiguos.
 */
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  for (const k of Object.keys(params)) {
    const v = params[k];
    const one = Array.isArray(v) ? v[0] : v;
    if (one) qs.set(k, one);
  }
  redirect(`/products${qs.size ? `?${qs.toString()}` : ""}`);
}
