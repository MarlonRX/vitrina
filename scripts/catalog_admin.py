#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""S-13 — Catálogo demo para Vitrina (API Admin GraphQL, client-credentials).

Uso:
  python scripts/catalog_admin.py pilot      # 1 producto de prueba + verificación
  python scripts/catalog_admin.py run        # lote completo (~250 productos)
  python scripts/catalog_admin.py archive    # archiva los snowboards Hydrogen
Reanudable: guarda progreso en C:/Users/marlon/AppData/Local/Temp/vitrina-cat-progress.json
"""
import json
import os
import sys
import time
import urllib.error
import urllib.request

SHOP = "vitrina-639fkxkf.myshopify.com"
API = f"https://{SHOP}/admin/api/2026-01/graphql.json"
TOK_FILE = "C:/Users/marlon/AppData/Local/Temp/admtok.txt"
PROGRESS = "C:/Users/marlon/AppData/Local/Temp/vitrina-cat-progress.json"
PUB_ONLINE = "gid://shopify/Publication/111440855086"  # Online Store
PUB_HEADLESS = "gid://shopify/Publication/111441739822"  # Vitrina Headless
FRONTPAGE = "gid://shopify/Collection/287871238190"  # Home page (existente)


def token():
    global TOK
    TOK = open(TOK_FILE).read().strip()
    # ¿vivo? (dura 24 h; si murió, regenerar con client-credentials)
    d = gql("{ shop { name } }")
    if d.get("errors"):
        cid = os.environ["SHOPIFY_ADMIN_CLIENT_ID"]
        sec = os.environ["SHOPIFY_ADMIN_CLIENT_SECRET"]
        body = (
            f"grant_type=client_credentials&client_id={cid}&client_secret={sec}"
        )
        req = urllib.request.Request(
            f"https://{SHOP}/admin/oauth/access_token",
            data=body.encode(),
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        TOK = json.load(urllib.request.urlopen(req))["access_token"]
        open(TOK_FILE, "w").write(TOK)
    return TOK


def gql(query, variables=None):
    req = urllib.request.Request(
        API,
        data=json.dumps({"query": query, "variables": variables or {}}).encode(),
        headers={
            "X-Shopify-Access-Token": TOK,
            "Content-Type": "application/json",
        },
    )
    return json.load(urllib.request.urlopen(req))


MUT_SET = """
mutation($input: ProductSetInput!) {
  productSet(input: $input) {
    product { id title handle }
    userErrors { field message }
  }
}"""

MUT_PUBLISH = """
mutation($input: ProductPublishInput!) {
  productPublish(input: $input) {
    product { id }
    userErrors { field message }
  }
}"""

PUBS = [{"publicationId": PUB_ONLINE}, {"publicationId": PUB_HEADLESS}]

MUT_ARCHIVE = """
mutation($product: ProductUpdateInput!) {
  productUpdate(product: $product) { product { id title } userErrors { field message } }
}"""

# ------------------------------------------------- material visual propio
import random
from PIL import Image, ImageDraw

SCRATCH = "C:/Users/marlon/AppData/Local/Temp/vitcat"
os.makedirs(SCRATCH, exist_ok=True)
_IMG_CACHE = {}


def material_image(fam, idx, seed):
    """Composición pictográfica flat-lay sobre papel crema, tono por familia.
    Determinista por seed; devuelve ruta jpg local."""
    key = (fam, idx % 8)
    if key in _IMG_CACHE:
        return _IMG_CACHE[key]
    rnd = random.Random(f"vitrina:{seed}:{fam}:{idx}")
    bg = (241, 236, 227)
    pal = {
        "Cerámica": (176, 106, 78),
        "Iluminación": (196, 160, 90),
        "Textil": (122, 138, 110),
        "Fragancia": (140, 47, 58),
        "Mesa": (94, 78, 62),
        "Escritorio": (58, 66, 84),
    }
    col = pal.get(fam, (140, 47, 58))
    im = Image.new("RGB", (1200, 1500), bg)
    d = ImageDraw.Draw(im)
    w, h = im.size
    dark = tuple(max(0, c - 45) for c in col)
    kind = ["bowls", "vase", "mug", "plates", "drape", "lamp", "tray", "candle"][key[1]]
    cx, cy = w * 0.5, h * 0.52
    s = w * 0.30
    if kind == "bowls":
        for i, (ox, sc) in enumerate([(-0.75, 0.6), (0, 1.0), (0.8, 0.7)]):
            bx = cx + ox * s
            d.ellipse(
                [bx - s * sc, cy - s * sc * 0.5, bx + s * sc, cy + s * sc * 0.5],
                fill=dark if i % 2 else col,
            )
    elif kind == "vase":
        d.rounded_rectangle([cx - s * 0.42, cy - s, cx + s * 0.42, cy + s * 0.9], radius=s * 0.4, fill=col)
        d.ellipse([cx - s * 0.24, cy - s * 1.14, cx + s * 0.24, cy - s * 0.86], fill=dark)
    elif kind == "mug":
        d.rounded_rectangle([cx - s * 0.6, cy - s * 0.65, cx + s * 0.4, cy + s * 0.7], radius=s * 0.12, fill=col)
        d.ellipse([cx + s * 0.3, cy - s * 0.25, cx + s * 0.9, cy + s * 0.4], outline=dark, width=int(s * 0.12))
    elif kind == "plates":
        for i in range(3):
            r = s * (1.05 - i * 0.24)
            d.ellipse([cx - r, cy - r * 0.5 - i * s * 0.1, cx + r, cy + r * 0.5 - i * s * 0.1],
                      outline=dark if i == 1 else col, width=int(s * 0.09))
    elif kind == "drape":
        pts = [(cx - s + 2 * s * i / 23, cy - s * 0.5 + (i % 3) * s * 0.3 + rnd.uniform(-6, 6)) for i in range(24)]
        d.line(pts, fill=col, width=int(s * 0.26), joint="curve")
        d.line([(p[0], p[1] + s * 0.32) for p in pts], fill=dark, width=int(s * 0.16))
    elif kind == "lamp":
        d.polygon([(cx - s * 0.8, cy - s * 0.1), (cx + s * 0.8, cy - s * 0.1), (cx + s * 0.32, cy - s * 0.95), (cx - s * 0.32, cy - s * 0.95)], fill=col)
        d.rectangle([cx - s * 0.05, cy - s * 0.1, cx + s * 0.05, cy + s * 0.78], fill=dark)
        d.ellipse([cx - s * 0.45, cy + s * 0.74, cx + s * 0.45, cy + s * 0.92], fill=dark)
    elif kind == "tray":
        d.rounded_rectangle([cx - s, cy - s * 0.55, cx + s, cy + s * 0.55], radius=s * 0.16, outline=col, width=int(s * 0.1))
        d.ellipse([cx - s * 0.28, cy - s * 0.16, cx + s * 0.28, cy + s * 0.16], fill=dark)
    else:  # candle
        d.rounded_rectangle([cx - s * 0.32, cy - s * 0.7, cx + s * 0.32, cy + s * 0.7], radius=s * 0.1, fill=col)
        d.polygon([(cx, cy - s * 1.0), (cx - s * 0.1, cy - s * 0.76), (cx + s * 0.1, cy - s * 0.76)], fill=(240, 190, 90))
    for _ in range(1100):  # grano de papel
        d.point((rnd.uniform(0, w), rnd.uniform(0, h)), fill=tuple(max(0, c - 16) for c in bg))
    path = f"{SCRATCH}/mat_{slug(fam)}_{key[1]}.jpg"
    im.convert("RGB").save(path, "JPEG", quality=82)
    _IMG_CACHE[key] = path
    return path


def staged_upload(path):
    """stagedUploadsCreate -> PUT bytes -> fileCreate. Devuelve gid del archivo.
    (Firmado 2026-01: stagedTargets{ url resourceUrl parameters{name value} })"""
    size = os.path.getsize(path)
    fn = os.path.basename(path)
    d = gql(
        """mutation($i:[StagedUploadInput!]!){ stagedUploadsCreate(input:$i){
          stagedTargets{ url resourceUrl parameters{ name value } }
          userErrors{ field message } } }""",
        {"i": [{"resource": "IMAGE", "filename": fn, "mimeType": "image/jpeg",
                "fileSize": str(size), "httpMethod": "PUT"}]},
    )
    res = (d.get("data") or {}).get("stagedUploadsCreate")
    if not res or not res["stagedTargets"]:
        sys.stderr.write(f"staged err {fn}: {json.dumps(d.get('errors') or res)[:200]}\n")
        return None
    t = res["stagedTargets"][0]
    hdr = {"Content-Type": "image/jpeg"}
    for kv in t.get("parameters") or []:
        if kv["name"].lower().startswith("x-amz") or kv["name"].lower() in ("cache-control", "content-type"):
            hdr[kv["name"]] = kv["value"]
    put = urllib.request.Request(t["url"], data=open(path, "rb").read(), method="PUT", headers=hdr)
    try:
        urllib.request.urlopen(put).read()
    except urllib.error.HTTPError as e:
        sys.stderr.write(f"PUT {e.code} {fn}: {e.read()[:160]}\n")
        return None
    d2 = gql(
        """mutation($f:[FileCreateInput!]!){ fileCreate(files:$f){
          files{ id } userErrors{ field message } } }""",
        {"f": [{"originalSource": t["resourceUrl"], "contentType": "IMAGE",
                "filename": fn, "alt": fn}]},
    )
    res2 = (d2.get("data") or {}).get("fileCreate")
    if not res2 or res2["userErrors"] or not res2["files"]:
        sys.stderr.write(f"fileCreate err {fn}: {json.dumps(res2 or d2.get('errors'))[:200]}\n")
        return None
    return res2["files"][0]["id"]


def ensure_media_bank():
    """Sube (una sola vez) la batería de imágenes-material y devuelve lista de
    {fam, gid} de archivos ya alojados en Shopify."""
    bank_path = "C:/Users/marlon/AppData/Local/Temp/vitrina-media-bank.json"
    if os.path.exists(bank_path):
        bank = json.load(open(bank_path))
        if bank:
            return bank
    bank = []
    for fam in FAMILIAS:
        for idx in range(4):  # 4 composiciones por familia = 24 archivos
            path = material_image(fam, idx, f"bank-{fam}-{idx}")
            gid = staged_upload(path)
            if gid:
                bank.append({"fam": fam, "gid": gid})
                print(f"media bank {fam}#{idx} -> {gid}")
            time.sleep(0.3)
    json.dump(bank, open(bank_path, "w"))
    return bank


# --------------------------------------------------------------- catálogo
FAMILIAS = {
    "Cerámica": {
        "items": ["Vazo", "Taza", "Cuenco", "Plato hondo", "Jarra", "Maceta", "Set de té"],
        "cols": ["Burdeos", "Arena", "Verde salvia", "Azul petróleo", "Crema", "Carbón", "Terracota", "Rosa palo"],
        "extra": ("Vidriado", ["Mate", "Brillante", "Satinado"]),
        "coll": ("ceramica", "Taller de barro"),
    },
    "Iluminación": {
        "items": ["Lámpara de mesa", "Lámpara de pie", "Colgante", "Aplique", "Luz de velador"],
        "cols": ["Latón", "Niebla", "Burdeos", "Negro mate", "Crema", "Verde bosque"],
        "extra": ("Bombilla", ["Cálida 2700K", "Neutra 4000K", "Regulable"]),
        "coll": ("iluminacion", "Luz cálida"),
    },
    "Textil": {
        "items": ["Manta", "Cojín", "Mantel", "Cortina", "Esterilla", "Toalla de lavabo"],
        "cols": ["Crudo", "Burdeos", "Gris perla", "Mostaza", "Verde salvia", "Azul índigo", "Terracota"],
        "extra": ("Medida", ["S", "M", "L"]),
        "coll": ("textil", "Hilo y telar"),
    },
    "Fragancia": {
        "items": ["Vela aromática", "Difusor de varillas", "Incienso", "Perfume de ambiente"],
        "cols": ["Ámbar y higo", "Cedro ahumado", "Azahar", "Salvia marina", "Vainilla negra"],
        "extra": ("Tamaño", ["30 ml", "120 ml", "260 ml"]),
        "coll": ("fragancia", "Casa con aroma"),
    },
    "Mesa": {
        "items": ["Tabla de servir", "Mantel individual", "Set de postre", "Candelabro", "Bandeja"],
        "cols": ["Nogal", "Cerezo", "Hueso", "Grafito", "Olivo"],
        "extra": ("Formato", ["Individual", "Dúo", "Set de 4"]),
        "coll": ("mesa", "Mesa puesta"),
    },
    "Escritorio": {
        "items": ["Cuaderno de tapa dura", "Bolígrafo de latón", "Organizador", "Alfombrilla", "Sello de cera"],
        "cols": ["Burdeos", "Verde bosque", "Crema", "Pizarra", "Mostaza"],
        "extra": ("Papel", ["Punteado", "Rayas", "Liso"]),
        "coll": ("escritorio", "Papel y tinta"),
    },
}
ADJETIVOS = ["Onda", "Duna", "Ronda", "Bruma", "Ceniza", "Litoral", "Alba", "Sierra", "Vértice", "Marea", "Pórtico", "Solsticio", "Arcilla", "Cobalto", "Ámbar", "Lino", "Basalto", "Ánima", "Umbral", "Cénit", "Vera", "Torral", "Sotobosque", "Mirla", "Pizarra"]


def slug(s):
    return (
        s.lower()
        .replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u").replace("ñ", "n")
        .replace(" ", "-")
    )


def base_price(fam, i):
    floor = {"Cerámica": 24, "Iluminación": 58, "Textil": 32, "Fragancia": 18, "Mesa": 40, "Escritorio": 14}
    return floor[fam] + (i % 9) * 7 + (2 if i % 3 else 0)


def gen_products(bank):
    """Genera ~252 productos: 6 familias × ítem × adjetivos.
    `bank`: entradas {fam, gid, url} ya subidas a Shopify (se referencian por
    gid -> productSet enlaza archivos existentes sin re-transferencia)."""
    by_fam = {}
    for b in bank:
        by_fam.setdefault(b["fam"], []).append(b)
    out = []
    seen = set()
    for fam, cfg in FAMILIAS.items():
        n_per = max(1, 252 // (len(FAMILIAS) * len(cfg["items"])))
        for item in cfg["items"]:
            for j in range(n_per):
                adj = ADJETIVOS[(cfg["items"].index(item) * 5 + j * 7 + len(fam)) % len(ADJETIVOS)]
                title = f"{item} {adj}"
                if title in seen:
                    title = f"{item} {adj} {cfg['cols'][j % len(cfg['cols'])]}"
                if title in seen:
                    continue
                seen.add(title)
                color_opt, (extra_name, extra_vals) = "Color", cfg["extra"]
                colors = cfg["cols"] if j % 2 == 0 else cfg["cols"][::-1][: max(3, len(cfg["cols"]) - j % 4)]
                extras = extra_vals if j % 3 else extra_vals[:2]
                options = [
                    {"name": color_opt, "values": [{"name": c} for c in colors]},
                    {"name": extra_name, "values": [{"name": e} for e in extras]},
                ]
                variants = []
                price = base_price(fam, j + len(colors))
                for c in colors:
                    for e in extras:
                        p = price + (8 if "L" in e or "Set" in e or "260" in e else 0) + (5 if c in ("Burdeos", "Latón") else 0)
                        onsale = p > 45 and (hash(title + c + e) % 5 == 0)
                        v = {
                            "optionValues": [
                                {"optionName": color_opt, "name": c},
                                {"optionName": extra_name, "name": e},
                            ],
                            "price": f"{p}.00",
                            "sku": f"VIT-{slug(fam)[:3].upper()}-{len(out):03d}-{slug(c)[:3].upper()}-{slug(e)[:3].upper()}",
                            "inventoryItem": {"tracked": False},
                        }
                        if onsale:
                            v["compareAtPrice"] = f"{p + 18}.00"
                        variants.append(v)
                handle = slug(f"{item} {adj}") + (f"-{j}" if j else "")
                pool = by_fam.get(fam, [])
                k = (j + len(colors)) % max(1, len(pool))
                files = []
                if pool:
                    a = pool[k]["gid"]
                    b = pool[(k + 1) % len(pool)]["gid"]
                    files = [
                        {"id": a, "alt": title, "contentType": "IMAGE"},
                        {"id": b, "alt": f"{title} (detalle)", "contentType": "IMAGE"},
                    ]
                tags = [fam, item.lower(), "demo", adj.lower()] + colors[:3]
                prod = {
                    "title": title,
                    "handle": handle,
                    "vendor": f"Estudio {fam}",
                    "productType": fam,
                    "status": "ACTIVE",
                    "tags": tags,
                    "descriptionHtml": (
                        f"<p>{title} hecha en pequeños lotes para la vitrina. "
                        f"Terminado a mano, pieza numerada. Envoltorio de papel de seda incluido.</p>"
                    ),
                    "files": files,
                    "productOptions": options,
                    "variants": variants,
                    "_fam": fam,
                }
                out.append(prod)
    # recorta a 252 exactos
    return out[:252]


def ensure_collections():
    d = gql("{ collections(first:30){ nodes{ id title handle } } }")
    have = {n["handle"]: n["id"] for n in d["data"]["collections"]["nodes"]}
    for fam, cfg in FAMILIAS.items():
        handle, title = cfg["coll"]
        if handle not in have:
            r = gql(
                "mutation($i: CollectionInput!){ collectionCreate(input:$i){ collection{ id } userErrors{ field message } } }",
                {"i": {"title": title, "handle": handle, "descriptionHtml": f"<p>{title}: selección de piezas {fam.lower()} para la casa.</p>"}},
            )
            node = r["data"]["collectionCreate"]["collection"]
            have[handle] = node["id"]
            # publicar en tienda online + headless (si no, /collections no las ve)
            gql(
                """mutation($id:ID!,$input:[PublicationInput!]!){
                  publishablePublish(id:$id, input:$input){ userErrors{ field message } } }""",
                {"id": node["id"], "input": PUBS},
            )
            print(f"coleccion creada: {title} -> {node['id']}")
    # idempotente: asegurar publicación de TODAS las colecciones
    d2 = gql("{ collections(first:30){ nodes{ id handle } } }")
    for c in d2["data"]["collections"]["nodes"]:
        gql(
            """mutation($id:ID!,$input:[PublicationInput!]!){
              publishablePublish(id:$id, input:$input){ userErrors{ field message } } }""",
            {"id": c["id"], "input": PUBS},
        )
    return have


def load_progress():
    try:
        return set(json.load(open(PROGRESS)))
    except Exception:
        return set()


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "pilot"
    token()
    coll_ids = ensure_collections()
    bank = ensure_media_bank()
    print(f"media bank: {len(bank)} archivos en Shopify")
    prods = gen_products(bank)
    print(f"catalogo generado: {len(prods)} productos, {sum(len(p['variants']) for p in prods)} variantes")
    done = load_progress()

    if mode == "pilot":
        p = dict(prods[0])
        fam = p.pop("_fam")
        p["collections"] = [coll_ids[FAMILIAS[fam]["coll"][0]], FRONTPAGE]
        r = gql(MUT_SET, {"input": p})
        res = r["data"]["productSet"]
        print(json.dumps(res, ensure_ascii=False, indent=1)[:800])
        pid = res["product"]["id"]
        rp = gql(MUT_PUBLISH, {"input": {"id": pid, "productPublications": PUBS}})
        print("PUBLISH:", json.dumps(rp["data"]["productPublish"], ensure_ascii=False)[:300])
        return

    if mode == "run":
        for i, p in enumerate(prods):
            fam = p.pop("_fam")
            if p["handle"] in done:
                continue
            p["collections"] = [coll_ids[FAMILIAS[fam]["coll"][0]]]
            # cada 4º producto también a la Home page (para poblar home)
            if i % 4 == 0:
                p["collections"].append(FRONTPAGE)
            for attempt in range(3):
                try:
                    r = gql(MUT_SET, {"input": p})
                    res = r["data"]["productSet"]
                    errs = res["userErrors"]
                    if errs:
                        print(f"[{i}] ERR {p['title']}: {errs}")
                    else:
                        pid = res["product"]["id"]
                        gql(MUT_PUBLISH, {"input": {"id": pid, "productPublications": PUBS}})
                        done.add(p["handle"])
                        json.dump(sorted(done), open(PROGRESS, "w"))
                        if i % 10 == 0:
                            print(f"[{i}] ok {p['title']} (variantes {len(p['variants'])})")
                    break
                except Exception as e:
                    print(f"[{i}] retry {attempt}: {e}")
                    time.sleep(3)
            time.sleep(0.35)
        print(f"TERMINADO: {len(done)} productos creados")
        return

    if mode == "archive":
        d = gql('{ products(first:50, query:"tag:hydrogen OR Snowboard OR \\"Ski Wax\\""){ nodes{ id title tags } } }')
        targets = [n for n in d["data"]["products"]["nodes"] if "Snowboard" in n["title"] or "Ski Wax" in n["title"]]
        for n in targets:
            r = gql(MUT_ARCHIVE, {"product": {"id": n["id"], "status": "ARCHIVED"}})
            ue = (r.get("data") or {}).get("productUpdate", {}).get("userErrors", [r.get("errors")])
            print("archivado" if not ue or ue == [None] else f"ERR {n['title']}: {ue}", n["title"])
        return


TOK = None
if __name__ == "__main__":
    TOK = token()
    main()
