import { cache } from "react";
import { shopify } from "./index";
import { getCollectionPage } from "./pagination";

export const loadProduct = cache((handle: string) =>
  shopify.getProduct(handle),
);

// S-02a06: deduplica la carga de la página de colección entre
// generateMetadata y el componente de página en la misma request.
export const loadCollectionPage = cache(
  (handle: string, page: number) => getCollectionPage(handle, page),
);
