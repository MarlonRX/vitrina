// S-01: checkout real de Shopify.
// En la Storefront API 2026-07 no existe `cartCheckoutCreate` (ni el tipo
// `Checkout`); el equivalente es `cartCreate`, cuyo `cart.checkoutUrl` lleva
// directamente al checkout de Shopify con las líneas del carrito.
export const CART_CREATE_MUTATION = /* GraphQL */ `
  mutation CartCheckoutCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;
