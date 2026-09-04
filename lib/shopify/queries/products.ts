const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    title
    handle
    description
    vendor
    tags
    availableForSale
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      url
      altText
      width
      height
    }
    images(first: 10) {
      edges {
        node {
          url
          altText
          width
          height
        }
      }
    }
    options {
      name
      values
    }
    variants(first: 100) {
      edges {
        node {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
          image {
            url
            altText
            width
            height
          }
        }
      }
    }
  }
`;

export function buildProductsQuery(
  after?: string,
  sortKey?: string,
  reverse?: boolean,
): string {
  const afterArg = after ? " after: $after" : "";
  const afterVar = after ? ", $after: String" : "";
  const sortKeyArg = sortKey ? ", sortKey: $sortKey" : "";
  const sortKeyVar = sortKey ? ", $sortKey: ProductSortKeys" : "";
  const reverseArg = sortKey && reverse !== undefined ? ", reverse: $reverse" : "";
  const reverseVar = sortKey && reverse !== undefined ? ", $reverse: Boolean" : "";
  return /* GraphQL */ `
    query Products($first: Int = 12, $query: String = ""${afterVar}${sortKeyVar}${reverseVar}) {
      products(first: $first, query: $query${afterArg}${sortKeyArg}${reverseArg}) {
        edges {
          node {
            ...ProductFields
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
    ${PRODUCT_FRAGMENT}
  `;
}

export const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductFields
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const COLLECTIONS_QUERY = /* GraphQL */ `
  query Collections($first: Int = 12, $after: String) {
    collections(first: $first, after: $after) {
      edges {
        node {
          id
          title
          handle
          description
          image {
            url
            altText
            width
            height
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export function buildProductsFacetsQuery(after?: string): string {
  const afterArg = after ? ", after: $after" : "";
  const afterVar = after ? ", $after: String" : "";
  return /* GraphQL */ `
    query ProductsFacets($first: Int = 250${afterVar}) {
      products(first: $first${afterArg}) {
        edges {
          node {
            id
            tags
            priceRange {
              minVariantPrice {
                amount
              }
              maxVariantPrice {
                amount
              }
            }
            options {
              name
              values
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;
}

export function buildCollectionByHandleQuery(after?: string): string {
  const afterArg = after ? ", after: $after" : "";
  const afterVar = after ? ", $after: String" : "";
  return /* GraphQL */ `
    query CollectionByHandle($handle: String!, $first: Int = 12${afterVar}) {
      collection(handle: $handle) {
        id
        title
        handle
        description
        products(first: $first${afterArg}) {
          edges {
            node {
              ...ProductFields
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
    ${PRODUCT_FRAGMENT}
  `;
}
