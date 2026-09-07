import { NextResponse } from "next/server";
import { shopify } from "@/lib/shopify";
import type { CartLineInput } from "@/lib/shopify/types";

export const runtime = "nodejs";

type CheckoutRequestBody = {
  items?: { variantId?: unknown; quantity?: unknown }[];
};

function buildReturnUrls(origin: string) {
  const successUrl = `${origin}/cart?checkout=success`;
  // Shopify no tiene "cancelUrl" formal en la URL /cart/c/…: el parámetro
  // `checkout_url` se propaga al checkout y es al que el cliente vuelve si
  // abandona el flujo (verificado con introspección + redirecciones 302).
  const cancelUrl = `${origin}/cart?checkout=cancel`;
  return { successUrl, cancelUrl };
}

export async function POST(request: Request) {
  let body: CheckoutRequestBody;
  try {
    body = (await request.json()) as CheckoutRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de la petición inválido." },
      { status: 400 },
    );
  }

  const items = Array.isArray(body.items) ? body.items : [];
  const lines: CartLineInput[] = [];
  for (const item of items) {
    const variantId = item?.variantId;
    const quantity = item?.quantity;
    if (typeof variantId !== "string" || variantId.length === 0) {
      return NextResponse.json(
        { error: "Línea de carrito sin variantId." },
        { status: 400 },
      );
    }
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 999) {
      return NextResponse.json(
        { error: `Cantidad inválida para ${variantId}.` },
        { status: 400 },
      );
    }
    lines.push({ merchandiseId: variantId, quantity: qty });
  }

  if (lines.length === 0) {
    return NextResponse.json(
      { error: "El carrito está vacío." },
      { status: 400 },
    );
  }

  const origin = new URL(request.url).origin;
  const buyerIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;

  let result;
  try {
    result = await shopify.createCartCheckout(lines, buyerIp);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido de Shopify.";
    return NextResponse.json(
      { error: `No se pudo crear el checkout: ${message}` },
      { status: 502 },
    );
  }

  if (result.mock) {
    return NextResponse.json({
      mock: true,
      checkoutUrl: null,
      message:
        "Modo mock activo: configura credenciales reales de Shopify para habilitar el checkout.",
    });
  }

  if (result.userErrors.length > 0 || !result.checkoutUrl) {
    return NextResponse.json(
      {
        error:
          result.userErrors.map((e) => e.message).join("; ") ||
          "Shopify no devolvió una URL de checkout.",
      },
      { status: 422 },
    );
  }

  const { successUrl, cancelUrl } = buildReturnUrls(origin);
  const url = new URL(result.checkoutUrl);
  url.searchParams.set("return_url", successUrl);
  url.searchParams.set("checkout_url", cancelUrl);

  return NextResponse.json({
    mock: false,
    checkoutUrl: url.toString(),
  });
}
