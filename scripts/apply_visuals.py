"""
S-14 · Aplicar material visual aprobado a Shopify remoto.

modos:
  selftest  — sube 2 pngs y prueba el ciclo media en vazo-vertice
  link      — para TODOS los productos demo: borra media vieja, crea media
              por color de variante, anexa imagen a cada variante
  cols      — sube fotos de colecciones/hero y asigna collectionUpdate
"""
import json
import os
import sys
import time
import urllib.request
import urllib.error

sys.path.insert(0, os.path.dirname(__file__))
import catalog_admin as ca  # noqa: E402
from presets_v2 import COLORS as PALETA, FORMAS, render  # noqa: E402

ROOT = os.path.join(os.path.dirname(__file__), "..")
STATE = "C:/Users/marlon/AppData/Local/Temp/vitrina-visuals.json"
DL = "C:/Users/marlon/AppData/Local/Temp/vitphotos"


def load_state():
    if os.path.exists(STATE):
        return json.load(open(STATE))
    return {"upload": {}, "link": {}, "cols": {}}


def save_state(s):
    json.dump(s, open(STATE, "w"))


# ---------- mapeos item→silueta y color→paleta ----------
SHAPE = {
    "Vazo": "jarron", "Taza": "taza", "Cuenco": "cuenco", "Plato hondo": "cuenco",
    "Jarra": "jarra", "Maceta": "maceta", "Set de té": "set_de_te",
    "Lámpara de mesa": "lampara_mesa", "Luz de velador": "lampara_mesa",
    "Aplique": "lampara_mesa", "Lámpara de pie": "colgante", "Colgante": "colgante",
    "Manta": "manta", "Cojín": "cojin", "Mantel": "manta", "Cortina": "manta",
    "Esterilla": "manta", "Toalla de lavabo": "manta",
    "Vela aromática": "vela", "Difusor de varillas": "difusor",
    "Incienso": "difusor", "Perfume de ambiente": "difusor",
    "Tabla de servir": "plato", "Bandeja": "plato", "Set de postre": "set_de_te",
    "Candelabro": "vela", "Mantel individual": "manta",
    "Cuaderno de tapa dura": "cuaderno", "Bolígrafo de latón": "difusor",
    "Organizador": "plato", "Alfombrilla": "manta", "Sello de cera": "vela",
}
PALETA_COL = {
    "Burdeos": "burdeos", "Terracota": "terracota", "Rosa palo": "terracota",
    "Carbón": "carbon", "Negro mate": "carbon", "Grafito": "carbon",
    "Pizarra": "carbon", "Cedro ahumado": "carbon", "Vainilla negra": "carbon",
    "Nogal": "carbon", "Crema": "papel", "Crudo": "papel", "Niebla": "papel",
    "Gris perla": "papel", "Hueso": "papel", "Azahar": "papel",
    "Arena": "ambar", "Ámbar y higo": "ambar", "Cerezo": "burdeos",
    "Latón": "laton", "Mostaza": "laton",
    "Verde salvia": "salvia", "Verde bosque": "salvia", "Olivo": "salvia",
    "Salvia marina": "salvia", "Azul petróleo": "indigo", "Azul índigo": "indigo",
}

# silueta extra (misma gramática visual) no renderizada en la hoja: cuaderno
def cuaderno(d, m, k, o):
    from presets_v2 import shadow
    shadow(d, (300, 620, 620, 660))
    d.rounded_rectangle([280, 280, 640, 640], radius=28, fill=m)
    d.rectangle([280, 280, 316, 640], fill=k)                   # lomo
    d.rounded_rectangle([350, 330, 580, 400], radius=14, fill=k)  # etiqueta
    d.rounded_rectangle([372, 350, 558, 380], radius=10, fill=m)
FORMAS["cuaderno"] = cuaderno


def item_de(titulo):
    for it in SHAPE:
        if titulo.startswith(it):
            return it
    return "Cuenco"  # fallback


def preset_file(shape, pal):
    """ruta png local, generándola si falta."""
    p = f"{ROOT}/public/presets/{shape}-{pal}.png"
    if not os.path.exists(p):
        render(shape, pal).save(p)
    return p


# ---------- subida PNG ----------
def upload_png(path, alt, cache):
    key = os.path.basename(path)
    if key in cache:
        return cache[key]
    size = os.path.getsize(path)
    d = ca.gql(
        """mutation($i:[StagedUploadInput!]!){ stagedUploadsCreate(input:$i){
          stagedTargets{ url resourceUrl parameters{ name value } }
          userErrors{ field message } } }""",
        {"i": [{"resource": "IMAGE", "filename": key, "mimeType": "image/png",
                "fileSize": str(size), "httpMethod": "PUT"}]},
    )
    res = (d.get("data") or {}).get("stagedUploadsCreate")
    if not res or not res["stagedTargets"]:
        print("staged fail", key, d.get("errors") or res)
        return None
    t = res["stagedTargets"][0]
    hdr = {"Content-Type": "image/png"}
    for kv in t.get("parameters") or []:
        n = kv["name"].lower()
        if n.startswith("x-amz") or n in ("cache-control", "content-type"):
            hdr[kv["name"]] = kv["value"]
    put = urllib.request.Request(t["url"], data=open(path, "rb").read(),
                                 method="PUT", headers=hdr)
    urllib.request.urlopen(put).read()
    d2 = ca.gql(
        """mutation($f:[FileCreateInput!]!){ fileCreate(files:$f){
          files{ id } userErrors{ field message } } }""",
        {"f": [{"originalSource": t["resourceUrl"], "contentType": "IMAGE",
                "filename": key, "alt": alt}]},
    )
    r2 = (d2.get("data") or {}).get("fileCreate")
    if not r2 or r2["userErrors"] or not r2["files"]:
        print("fileCreate fail", key, r2 or d2.get("errors"))
        return None
    gid = r2["files"][0]["id"]
    cache[key] = gid
    save_state(STATE_S)
    return gid


MUT_DELETE = """mutation($p:ID!,$ids:[ID!]!){
  productDeleteMedia(product:$p, mediaIds:$ids){ userErrors{ field message } } }"""
# productSet con files → materializa ImageMedia en el producto; usamos alt como
# clave estable ("COLOR::burdeos") para mapear media→color sin depender del orden.
MUT_FILES = """mutation($in:ProductSetInput!){ productSet(input:$in){
  product{ id media(first:40){ nodes{ id ... on MediaImage{ alt } } } }
  userErrors{ field message } } }"""
Q_MEDIA = """query($id:ID!){ product(id:$id){ media(first:40){ nodes{ id ... on MediaImage{ alt } } } } }"""
MUT_APPEND = """mutation($p:ID!,$v:[ProductVariantAppendMediaInput!]!){
  productVariantAppendMedia(productId:$p, variantMedia:$v){
    product{ id } userErrors{ field message } } }"""
Q_PRODUCTS = """
query($cursor:String){ products(first:6, after:$cursor, query:"tag:demo"){
  pageInfo{ hasNextPage endCursor }
  nodes{ id title productType media(first:20){ nodes{ id } }
    variants(first:100){ nodes{ id selectedOptions{ name value } } } } } }"""


def link():
    ca.TOK = ca.token()
    st = STATE_S
    limit = int(os.environ.get("VISUALS_LIMIT", "0"))
    # 1) banco de archivos: solo las combinaciones necesarias
    needed = {(s_, p_) for s_ in set(SHAPE.values()) for p_ in PALETA}
    for s_, p_ in sorted(needed):
        if f"{s_}-{p_}.png" in st["upload"]:
            continue
        gid = upload_png(preset_file(s_, p_), f"{s_} {p_}", st["upload"])
        print("subida", s_, p_, gid)
        time.sleep(0.15)
    save_state(st)
    print(f"presets en Shopify: {len(st['upload'])}")

    # 2) productos demo
    cursor = None
    while True:
        d = ca.gql(Q_PRODUCTS, {"cursor": cursor})
        page = d["data"]["products"]
        for prod in page["nodes"]:
            if prod["id"] in st["link"]:
                continue
            if limit and len(st["link"]) >= limit:
                page["pageInfo"]["hasNextPage"] = False
                break
            shape = SHAPE.get(item_de(prod["title"]), "cuenco")
            colors = []
            for v in prod["variants"]["nodes"]:
                for so in v["selectedOptions"]:
                    if so["name"] == "Color":
                        c = PALETA_COL.get(so["value"], "papel")
                        if c not in colors:
                            colors.append(c)
            files = []
            ok = True
            for c in colors:
                gid = st["upload"].get(f"{shape}-{c}.png")
                if not gid:
                    ok = False; break
                files.append({"id": gid, "alt": f"COLOR::{c}", "contentType": "IMAGE"})
            if not ok:
                print("sin gid", prod["title"]); continue
            r = ca.gql(MUT_FILES, {"in": {"id": prod["id"], "files": files}})
            res = (r.get("data") or {}).get("productSet") or {}
            errs = res.get("userErrors") or r.get("errors")
            if errs:
                print("files fail", prod["title"], str(errs)[:140]); continue
            # mapear alt→mediaId
            dm = ca.gql(Q_MEDIA, {"id": prod["id"]})
            media = dm["data"]["product"]["media"]["nodes"]
            by_color = {}
            legacy = []
            for m in media:
                a = m.get("alt") or ""
                if a.startswith("COLOR::"):
                    by_color.setdefault(a[7:], m["id"])
                else:
                    legacy.append(m["id"])
            vm = []
            for v in prod["variants"]["nodes"]:
                c = "papel"
                for so in v["selectedOptions"]:
                    if so["name"] == "Color":
                        c = PALETA_COL.get(so["value"], "papel")
                if c in by_color:
                    vm.append({"variantId": v["id"], "mediaIds": [by_color[c]]})
            r = ca.gql(MUT_APPEND, {"p": prod["id"], "v": vm})
            res = (r.get("data") or {}).get("productVariantAppendMedia") or {}
            errs = res.get("userErrors") or r.get("errors")
            if errs:
                print("append fail", prod["title"], str(errs)[:140]); continue
            if legacy:
                ca.gql(MUT_DELETE, {"p": prod["id"], "ids": legacy})
            st["link"][prod["id"]] = True
            save_state(st)
        print(f"pagina ok · enlaces {len(st['link'])}")
        if not page["pageInfo"]["hasNextPage"]:
            break
        cursor = page["pageInfo"]["endCursor"]



FOTOS = {
    "ceramica": (f"{DL}/final/col-ceramica.jpg", None),
    "iluminacion": (f"{DL}/final/col-iluminacion.jpg", None),
    "textil": (f"{DL}/final/col-textil.jpg", None),
    "fragancia": (f"{DL}/final/col-fragancia.jpg", None),
    "mesa": (f"{DL}/final/col-mesa.jpg", None),
    "escritorio": (f"{DL}/final/col-escritorio.jpg", None),
    "hero-ceramica": (f"{DL}/final/hero-ceramica.jpg", "src"),
    "hero-textil": (f"{DL}/final/hero-textil.jpg", "src"),
    "hero-luz": (f"{DL}/final/hero-luz.jpg", "src"),
}


def cols():
    ca.TOK = ca.token()
    st = STATE_S
    urls = {}
    for name, (path, _kind) in FOTOS.items():
        if name in st["cols"]:
            urls[name] = st["cols"][name]
            continue
        import io
        from PIL import Image
        im = Image.open(path).convert("RGB")
        if name.startswith("col-"):
            w, h = im.size
            s = min(w, h)
            im = im.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s)).resize((1200, 1200))
        else:
            im.thumbnail((1920, 1920))
        out = f"C:/Users/marlon/AppData/Local/Temp/vit-{name}.jpg"
        im.save(out, quality=88)
        gid = None
        size = os.path.getsize(out)
        d = ca.gql(
            """mutation($i:[StagedUploadInput!]!){ stagedUploadsCreate(input:$i){
              stagedTargets{ url resourceUrl parameters{ name value } } userErrors{ field message } } }""",
            {"i": [{"resource": "IMAGE", "filename": os.path.basename(out),
                    "mimeType": "image/jpeg", "fileSize": str(size), "httpMethod": "PUT"}]},
        )
        t = ((d.get("data") or {}).get("stagedUploadsCreate") or {}).get("stagedTargets", [{}])[0]
        hdr = {"Content-Type": "image/jpeg"}
        for kv in t.get("parameters") or []:
            n = kv["name"].lower()
            if n.startswith("x-amz") or n in ("cache-control", "content-type"):
                hdr[kv["name"]] = kv["value"]
        urllib.request.urlopen(urllib.request.Request(t["url"], data=open(out, "rb").read(),
                                                      method="PUT", headers=hdr)).read()
        d2 = ca.gql(
            """mutation($f:[FileCreateInput!]!){ fileCreate(files:$f){
              files{ id ... on MediaImage{ image{ url } } } userErrors{ field message } } }""",
            {"f": [{"originalSource": t["resourceUrl"], "contentType": "IMAGE",
                    "filename": os.path.basename(out), "alt": name}]},
        )
        f0 = ((d2.get("data") or {}).get("fileCreate") or {}).get("files", [{}])[0]
        url = (f0.get("image") or {}).get("url")
        if not url and f0.get("id"):
            # la media tarda unos segundos en pasar UPLOADED → READY
            for _ in range(12):
                time.sleep(3)
                rp = ca.gql('query($id:ID!){ node(id:$id){ ... on MediaImage{ status image{ url } } } }',
                            {"id": f0["id"]})
                nd = (rp.get("data") or {}).get("node") or {}
                url = (nd.get("image") or {}).get("url")
                if url:
                    break
        st["cols"][name] = url
        save_state(st)
        urls[name] = url
        print("foto", name, "->", url[:80])
        time.sleep(0.3)

    # asignar a colecciones
    dc = ca.gql("{ collections(first:20){ nodes{ id handle title } } }")
    byh = {c["handle"]: c for c in dc["data"]["collections"]["nodes"]}
    for handle in ("ceramica", "iluminacion", "textil", "fragancia", "mesa", "escritorio"):
        c = byh.get(handle)
        if not c:
            print("sin coleccion", handle)
            continue
        r = ca.gql(
            """mutation($i:CollectionInput!){ collectionUpdate(input:$i){
              collection{ id handle } userErrors{ field message } } }""",
            {"i": {"id": c["id"], "image": {"src": urls[handle]}}},
        )
        err = (r.get("data") or {}).get("collectionUpdate", {}).get("userErrors") or r.get("errors")
        print("collection image", handle, "OK" if not err else err)
    print("COLS TERMINADO")
    json.dump(urls, open("C:/Users/marlon/AppData/Local/Temp/vitrina-fotos.json", "w"))


STATE_S = load_state()
if __name__ == "__main__":
    mode = sys.argv[1]
    {"link": link, "cols": cols}[mode]()
