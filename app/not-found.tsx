import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-10">
      <h1>Página no encontrada</h1>
      <p>Lo que buscabas no está aquí.</p>
      <Link href="/" className="underline">
        Volver al inicio
      </Link>
    </main>
  );
}
