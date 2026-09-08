"use client";

// DIAGNÓSTICO TEMPORAL (2026-09-07): superficie el mensaje del error en el
// HTML para poder leerlo con curl desde prod (los logs de Vercel no están
// accesibles). BORRAR en cuanto se identifique y arregle la causa raíz.
export default function ProductRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main>
      <h1>DIAG-S14Q</h1>
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {error.message}
        {"\n"}
        {error.stack}
      </pre>
      <button type="button" onClick={() => reset()}>
        Reintentar
      </button>
    </main>
  );
}
