"""
S-17d - Muestras v3 de material visual (APROBACIN PREVIA, no toca Shopify).

Tres direcciones de estilo sobre las siluetas fieles de presets_v2:
  A estudio - escena de estudio: luz radial, arco de marca, sombra suave
              difuminada, brillo superior y grano fino.
  B poster  - pster duotono: fondo profundo de la variante, pieza en crema,
              arco delineado y crculo desplazado.
  C linen   - lino editorial: fondo papel con trama, sombra "desregistrada"
              estilo risograph en el tono de la variante.

Genera public/muestras-v3/{estudio,poster,linen}.png (rejilla 3x3:
filas = cuenco / lmpara de mesa / maceta, columnas = terracota / burdeos /
salvia). Con el visto bueno, presets_v3 pasa a ser el render del pool y
apply_visuals.py lo sube a Shopify sin ms cambios.

Uso:  uv run --with pillow python scripts/presets_v3.py
"""
import os
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageChops

sys.path.insert(0, os.path.dirname(__file__))
import presets_v2 as p2  # noqa: E402

S = p2.S
TILE = 460
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "muestras-v3")

MUESTRAS = [("cuenco", "lampara_mesa", "maceta"), ("terracota", "burdeos", "salvia")]


# ---------- utilidades de escena ----------
def piece_layer(shape, m, k, o):
    """Silueta de v2 sobre capa transparente, sin su sombra dura interna."""
    original = p2.shadow
    p2.shadow = lambda *a, **kw: None  # la sombra la aporta cada estilo
    try:
        img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
        p2.FORMAS[shape](ImageDraw.Draw(img, "RGBA"), m, k, o)
    finally:
        p2.shadow = original
    return img


def soft_shadow(alpha, dx=26, dy=36, blur=42, opacity=110):
    mask = ImageChops.offset(alpha, dx, dy).filter(ImageFilter.GaussianBlur(blur))
    layer = Image.new("RGBA", (S, S), (24, 12, 10, 0))
    layer.putalpha(mask.point(lambda v: v * opacity // 255))
    return layer


def misprint_shadow(alpha, color, dx=16, dy=12, opacity=100):
    layer = Image.new("RGBA", (S, S), color + (0,))
    layer.putalpha(ImageChops.offset(alpha, dx, dy).point(lambda v: v * opacity // 255))
    return layer


def contact_shadow(alpha, rgb, opacity=110):
    """Elipse apretada y oscura bajo la base de la pieza: la asienta en el piso."""
    x0, y0, x1, y1 = alpha.getbbox() or (0, 0, S, S)
    cx = (x0 + x1) // 2
    w = (x1 - x0) * 62 // 100
    mask = Image.new("L", (S, S), 0)
    ImageDraw.Draw(mask).ellipse([cx - w // 2, y1 - 26, cx + w // 2, y1 + 30], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(14))
    layer = Image.new("RGBA", (S, S), rgb + (0,))
    layer.putalpha(mask.point(lambda v: v * opacity // 255))
    return layer


def top_light(alpha, strength=64):
    grad = Image.linear_gradient("L").transpose(Image.Transpose.FLIP_TOP_BOTTOM)
    grad = grad.crop((0, 0, S, S * 55 // 100)).resize((S, S))
    mask = ImageChops.multiply(alpha, grad).point(lambda v: v * strength // 255)
    layer = Image.new("RGBA", (S, S), (255, 252, 244, 0))
    layer.putalpha(mask)
    return layer


def glow_warm():
    halo = Image.new("L", (S, S), 0)
    ImageDraw.Draw(halo).ellipse([270, 340, 630, 700], fill=175)
    halo = halo.filter(ImageFilter.GaussianBlur(95))
    layer = Image.new("RGBA", (S, S), (255, 248, 232, 0))
    layer.putalpha(halo)
    return layer


def radial_light(base_rgb, center, radius, tone_rgb, strength):
    mask = Image.new("L", (S, S), 0)
    x, y = center
    ImageDraw.Draw(mask).ellipse([x - radius, y - radius, x + radius, y + radius], fill=strength)
    mask = mask.filter(ImageFilter.GaussianBlur(radius // 2))
    return Image.composite(Image.new("RGB", (S, S), tone_rgb), base_rgb, mask)


def vignette(img, strength=46):
    mask = Image.new("L", (S, S), 0)
    d = ImageDraw.Draw(mask)
    d.rectangle([0, 0, S, S], fill=strength)
    d.ellipse([-S // 4, -S // 4, S + S // 4, S + S // 4], fill=0)
    mask = mask.filter(ImageFilter.GaussianBlur(140))
    return Image.composite(Image.new("RGB", (S, S), (26, 16, 14)), img, mask)


def grain(img, amount=0.05):
    noise = Image.effect_noise((S, S), 26).convert("RGB")
    return Image.blend(img, noise, amount)


def arch_mask(box):
    x0, y0, x1, y1 = box
    h = x1 - x0
    mask = Image.new("L", (S, S), 0)
    d = ImageDraw.Draw(mask)
    d.pieslice([x0, y0, x1, y0 + h], 180, 360, fill=255)
    d.rectangle([x0, y0 + h // 2, x1, y1], fill=255)
    return mask


def tint_layer(mask, rgb, opacity):
    layer = Image.new("RGBA", (S, S), rgb + (0,))
    layer.putalpha(mask.point(lambda v: v * opacity // 255))
    return layer


def detail_pass(piece):
    """Pase de detalle universal sobre la silueta: volumen vertical, bisel
    (luz de borde arriba-izquierda y sombra interna abajo-derecha), brillo
    especular y lneas de torno sutiles. Todo va enmascarado por el alfa de
    la pieza, as cualquier forma lo hereda sin conocer su geometra."""
    alpha = piece.split()[3]
    box = alpha.getbbox() or (0, 0, S, S)
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    out = piece.copy()

    # volumen: se oscurece hacia la base (curva suave, no banda plana)
    grad = Image.linear_gradient("L").resize((S, S))
    vol = ImageChops.multiply(alpha, grad).point(lambda v: int((v / 255) ** 1.6 * 88))
    layer = Image.new("RGBA", (S, S), (28, 15, 12, 0))
    layer.putalpha(vol)
    out.alpha_composite(layer)

    # sombra interna del lado opuesto a la luz
    inner = ImageChops.subtract(alpha, ImageChops.offset(alpha, -5, -6))
    inner = inner.filter(ImageFilter.GaussianBlur(2.2)).point(lambda v: v * 64 // 255)
    layer = Image.new("RGBA", (S, S), (22, 11, 9, 0))
    layer.putalpha(inner)
    out.alpha_composite(layer)

    # luz de borde biselada arriba-izquierda
    rim = ImageChops.subtract(alpha, ImageChops.offset(alpha, 4, 5))
    rim = rim.filter(ImageFilter.GaussianBlur(1.6)).point(lambda v: v * 92 // 255)
    layer = Image.new("RGBA", (S, S), (255, 250, 240, 0))
    layer.putalpha(rim)
    out.alpha_composite(layer)

    # brillo especular difuso sobre el hombro de la pieza
    spec = Image.new("L", (S, S), 0)
    ImageDraw.Draw(spec).ellipse(
        [x0 + w * 0.22, y0 + h * 0.13, x0 + w * 0.54, y0 + h * 0.34], fill=150
    )
    spec = spec.filter(ImageFilter.GaussianBlur(26))
    spec = ImageChops.multiply(spec, alpha).point(lambda v: v * 74 // 255)
    layer = Image.new("RGBA", (S, S), (255, 253, 246, 0))
    layer.putalpha(spec)
    out.alpha_composite(layer)

    return out


# ---------- estilos ----------
def estudio(shape, color):
    m, k, bg = p2.COLORS[color]
    base = Image.new("RGB", (S, S), bg)
    base = radial_light(base, (S * 32 // 100, S * 24 // 100), S * 75 // 100, (255, 252, 246), 120)
    base = radial_light(base, (S * 78 // 100, S * 88 // 100), S * 60 // 100, (214, 199, 178), 70)
    img = base.convert("RGBA")
    # nicho de marca: tinte + hairline que delinean el arco de la vitrina
    niche = arch_mask((250, 150, 650, 700))
    img.alpha_composite(tint_layer(niche, hex_rgb(m), 26))
    ring = ImageChops.subtract(niche, arch_mask((256, 156, 644, 700)))
    img.alpha_composite(tint_layer(ring, hex_rgb(m), 42))
    piece = piece_layer(shape, m, k, outline_for(color))
    piece = detail_pass(piece)
    if shape in p2.LUCES:
        img.alpha_composite(glow_warm())
    img.alpha_composite(soft_shadow(piece.split()[3]))
    # sombra de contacto: asienta la pieza sobre el piso del estudio
    img.alpha_composite(contact_shadow(piece.split()[3], hex_rgb(k)))
    img.alpha_composite(piece)
    img.alpha_composite(top_light(piece.split()[3]))
    out = grain(img.convert("RGB"))
    return vignette(out, 34)


def poster(shape, color):
    m, k, _bg = p2.COLORS[color]
    img = Image.new("RGB", (S, S), k).convert("RGBA")
    # crculo desplazado + arco delineado en crema
    halo = Image.new("L", (S, S), 0)
    ImageDraw.Draw(halo).ellipse([430, 120, 830, 520], fill=255)
    img.alpha_composite(tint_layer(halo.filter(ImageFilter.GaussianBlur(2)), hex_rgb(m), 60))
    outer = arch_mask((230, 140, 670, 720))
    inner = arch_mask((230 + 14, 140 + 14, 670 - 14, 720))
    ring = ImageChops.subtract(outer, inner)
    img.alpha_composite(tint_layer(ring, (239, 231, 219), 90))
    piece = piece_layer(shape, "#EFE7DB", "#C9B79E", k)
    if shape in p2.LUCES:
        img.alpha_composite(glow_warm())
    img.alpha_composite(soft_shadow(piece.split()[3], opacity=150))
    img.alpha_composite(piece)
    img.alpha_composite(top_light(piece.split()[3], 46))
    return grain(img.convert("RGB"), 0.06)


def linen(shape, color):
    m, k, _bg = p2.COLORS[color]
    img = Image.new("RGB", (S, S), (244, 238, 227)).convert("RGBA")
    trama = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(trama)
    for y in range(0, S, 4):
        d.line([(0, y), (S, y)], fill=(120, 104, 82, 14), width=1)
    for x in range(0, S, 4):
        d.line([(x, 0), (x, S)], fill=(120, 104, 82, 10), width=1)
    img.alpha_composite(trama)
    piece = piece_layer(shape, m, k, outline_for(color))
    img.alpha_composite(misprint_shadow(piece.split()[3], hex_rgb(m)))
    img.alpha_composite(piece)
    img.alpha_composite(top_light(piece.split()[3], 40))
    return grain(img.convert("RGB"), 0.045)


def hex_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def outline_for(color):
    return "#EDE6DA" if color in ("carbon", "indigo", "burdeos") else "#2E2A25"


ESTILOS = {"estudio": estudio, "poster": poster, "linen": linen}


def render(shape, color):
    """API de render para el pool (apply_visuals): estilo aprobado estudio."""
    return estudio(shape, color)


def pool():
    """Lote completo: todas las siluetas x colores, en WebP (pesa ~4x menos
    que PNG en estas ilustraciones y el CDN de Shopify lo sirve tal cual)."""
    out = os.path.join(os.path.dirname(__file__), "..", "public", "presets")
    os.makedirs(out, exist_ok=True)
    n = 0
    for shape in p2.FORMAS:
        for color in p2.COLORS:
            render(shape, color).save(
                f"{out}/{shape}-{color}.webp", "WEBP", quality=90, method=6
            )
            n += 1
    print(f"pool: {n} webp en public/presets")


def sheet(fn):
    shapes, colors = MUESTRAS
    grid = Image.new("RGB", (TILE * 3, TILE * 3), (250, 248, 244))
    for row, shape in enumerate(shapes):
        for col, color in enumerate(colors):
            tile = fn(shape, color).resize((TILE, TILE), Image.Resampling.LANCZOS)
            grid.paste(tile, (col * TILE, row * TILE))
    return grid


def main():
    os.makedirs(OUT, exist_ok=True)
    for name, fn in ESTILOS.items():
        sheet(fn).save(os.path.join(OUT, f"{name}.png"))
        print("hoja:", os.path.join(OUT, f"{name}.png"))


if __name__ == "__main__":
    if sys.argv[1:] == ["pool"]:
        pool()
    else:
        main()
