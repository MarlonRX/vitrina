import { NextResponse } from "next/server";

// DIAGNÓSTICO TEMPORAL (2026-09-07): reproduce por pasos la ruta de ficha de
// producto (carga Shopify → saneo DOMPurify) y dice DÓNDE revienta en el
// runtime de Vercel, porque los logs no están accesibles desde aquí.
// BORRAR junto con app/products/[handle]/error.tsx en cuanto se resuelva.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const steps: Record<string, string> = {};
  try {
    steps["0-node"] = process.version;
    steps["1-módulo-sanitize"] = "importando…";
    const { sanitizeProductHtml } = await import("@/lib/sanitize");
    steps["1-módulo-sanitize"] = "ok";

    steps["2-sanitize-simple"] = "probando…";
    steps["2-sanitize-simple"] = sanitizeProductHtml("<p>hola</p>");

    steps["3-carga-producto"] = "consultando…";
    const { loadProduct } = await import("@/lib/shopify/loaders");
    const { product } = await loadProduct("cuenco-ambar-3");
    steps["3-carga-producto"] = product ? `ok: ${product.title}` : "null (notFound)";

    if (product) {
      steps["4-sanitize-real"] = "probando…";
      steps["4-sanitize-real"] = `ok (${sanitizeProductHtml(product.description).length} chars)`;
    }
    return NextResponse.json({ ok: true, steps });
  } catch (e) {
    const err = e as Error & { digest?: string; cause?: unknown };
    return NextResponse.json(
      {
        ok: false,
        steps,
        name: err.name,
        message: err.message,
        stack: (err.stack ?? "").split("\n").slice(0, 8).join("\n"),
        cause: err.cause ? String(err.cause) : undefined,
      },
      { status: 200 },
    );
  }
}
