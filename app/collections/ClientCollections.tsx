import Link from "next/link";
import type { Collection } from "@/lib/shopify/types";

export default function ClientCollections({
  collections,
}: {
  collections: Collection[];
}) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <h1>Colecciones</h1>
      {collections.length === 0 ? (
        <p>No hay colecciones disponibles.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {collections.map((collection) => (
            <li key={collection.id}>
              <Link
                href={`/collections/${collection.handle}`}
                className="flex flex-col gap-1 border border-(--border-primary) bg-(--bg-surface) p-3"
              >
                <h2 className="text-base">{collection.title}</h2>
                <p className="text-sm text-(--text-secondary)">
                  {collection.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
