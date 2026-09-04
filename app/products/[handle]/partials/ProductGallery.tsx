"use client";

import { useState } from "react";
import Image from "next/image";
import type { Image as ShopifyImage } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: ShopifyImage[];
  alt: string;
};

export default function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center border border-dashed border-(--border-primary) text-sm text-(--text-tertiary)">
        Sin imágenes
      </div>
    );
  }

  const active = images[activeIndex];

  return (
    <div className="flex flex-col gap-2">
      <Image
        key={active.url}
        src={active.url}
        alt={active.altText ?? alt}
        width={600}
        height={600}
        sizes="(max-width: 768px) 100vw, 50vw"
        loading="eager"
        fetchPriority="high"
      />
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Ver imagen ${index + 1} de ${alt}`}
              className={cn(
                "border border-(--border-primary)",
                index === activeIndex && "border-(--accent-primary)",
              )}
            >
              <Image src={image.url} alt="" width={64} height={64} sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
