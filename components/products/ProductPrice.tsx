import type { Money } from "@/lib/shopify/types";
import { formatMoney } from "@/lib/format";

type ProductPriceProps = {
  price: Money;
  maxPrice?: Money | null;
  compareAtPrice?: Money | null;
};

export default function ProductPrice({
  price,
  maxPrice,
  compareAtPrice,
}: ProductPriceProps) {
  const showFrom =
    maxPrice !== null &&
    maxPrice !== undefined &&
    maxPrice.amount !== price.amount;

  const showCompareAt =
    compareAtPrice !== null &&
    compareAtPrice !== undefined &&
    compareAtPrice.amount !== price.amount;

  return (
    <p className="flex items-baseline gap-2">
      <span>
        {showFrom ? `Desde ${formatMoney(price)}` : formatMoney(price)}
      </span>
      {showCompareAt && (
        <s className="text-(--text-tertiary)">{formatMoney(compareAtPrice)}</s>
      )}
    </p>
  );
}
