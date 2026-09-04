export default function ProductsLoading() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-10">
      <h1>Productos</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="skeleton aspect-3/4 border border-(--border-primary)"
          />
        ))}
      </div>
    </main>
  );
}
