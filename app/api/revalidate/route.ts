import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

/**
 * S-13 — Purga programática del Data Cache de Shopify.
 *
 * El catálogo demo se regenera por API Admin; sin esto hay que esperar a que
 * venza cada `revalidate` (60 s catálogo, 1 h producto/colección). Llamar:
 *   curl -X POST "http://localhost:3000/api/revalidate?secret=$REVALIDATE_SECRET"
 * En producción real esto lo dispararía un webhook `products/update` de Shopify.
 */
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const given = new URL(req.url).searchParams.get("secret");
  if (!secret || given !== secret) {
    return NextResponse.json({ ok: false, error: "secret inválido" }, { status: 401 });
  }

  // Next 16 exige el segundo argumento: expiración inmediata del tag.
  revalidateTag("shopify", { expire: 0 });
  return NextResponse.json({ ok: true, purgado: "shopify", at: new Date().toISOString() });
}
