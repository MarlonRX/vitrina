import Link from "next/link";
import { absoluteUrl, jsonLdHtml } from "@/lib/seo";

// S-05 dentro de S-02a06: migas de pan accesibles + JSON-LD BreadcrumbList
// para SEO. Se integra en detalle de producto, colección y catálogo.
export interface BreadcrumbItem {
  label: string;
  /** Ausente = nodo actual (no enlazable). */
  href?: string;
}

const style = {
  nav: "text-sm text-(--text-secondary)",
  list: "flex flex-wrap items-center gap-1.5",
  link: "hover:text-(--accent-primary)",
  separator: "text-(--text-tertiary)",
  current: "text-(--text-primary)",
};

function jsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  };
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;

  return (
    <>
      <nav aria-label="Migas de pan" className={style.nav}>
        <ol className={style.list}>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={`${item.label}|${item.href ?? ""}`} className="flex items-center gap-1.5">
                {index > 0 && (
                  <span aria-hidden className={style.separator}>
                    ›
                  </span>
                )}
                {item.href && !isLast ? (
                  <Link href={item.href} className={style.link}>
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current={isLast ? "page" : undefined} className={isLast ? style.current : undefined}>
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd(items)) }}
      />
    </>
  );
}
