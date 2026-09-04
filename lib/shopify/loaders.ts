import { cache } from "react";
import { shopify } from "./index";

export const loadProduct = cache((handle: string) =>
  shopify.getProduct(handle),
);
