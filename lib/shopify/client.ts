import axios, { AxiosRequestConfig } from "axios";

const baseURL = `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/${process.env.SHOPIFY_STOREFRONT_VERSION}/graphql.json`;

export async function shopifyQueryRaw<T>(
  query: string,
  variables?: Record<string, unknown>,
  buyerIp?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    "Shopify-Storefront-Private-Token":
      process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN ?? "",
    "Content-Type": "application/json",
  };

  if (buyerIp) {
    headers["Shopify-Storefront-Buyer-IP"] = buyerIp;
  }

  const config: AxiosRequestConfig = { headers };

  try {
    const { data } = await axios.post(baseURL, { query, variables }, config);

    if (data.errors) {
      throw new Error(
        data.errors
          .map((e: { message: string }) => e.message)
          .join("; "),
      );
    }

    return data.data as T;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const detail = error.response?.data;
      throw new Error(
        `Shopify request failed (${error.response?.status ?? "no status"}): ${
          typeof detail === "string" ? detail : JSON.stringify(detail)
        }`,
      );
    }
    throw error;
  }
}
