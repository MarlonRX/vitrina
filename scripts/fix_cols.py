"""Reintenta collectionUpdate para ceramica e iluminacion (imágenes que
quedaron colgadas por carrera UPLOADED→READY). Idempotente."""
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(__file__))
import catalog_admin as ca  # noqa: E402

ca.TOK = ca.token()
st = json.load(open("C:/Users/marlon/AppData/Local/Temp/vitrina-visuals.json"))
urls = st["cols"]

Q_NODE = """query($id:ID!){ node(id:$id){ ... on MediaImage{ status image{ url } } } }"""
MUT = """mutation($i:CollectionInput!){ collectionUpdate(input:$i){
  collection{ id handle } userErrors{ field message } } }"""

dc = ca.gql("{ collections(first:20){ nodes{ id handle title } } }")
byh = {c["handle"]: c for c in dc["data"]["collections"]["nodes"]}

for handle in ("ceramica", "iluminacion"):
    c = byh.get(handle)
    url = urls.get(handle)
    if not c or not url:
        print("salto", handle, "sin coleccion o sin url")
        continue
    # si la url viene del bucket temporal, resolver a CDN vía fileCreate no
    # aplica: las fotos ya pasaron; solo esperamos a que estén procesadas.
    for attempt in range(10):
        r = ca.gql(MUT, {"i": {"id": c["id"], "image": {"src": url}}})
        res = (r.get("data") or {}).get("collectionUpdate") or {}
        errs = res.get("userErrors") or r.get("errors")
        if not errs:
            print("OK", handle)
            break
        print("intento", handle, attempt, str(errs)[:90])
        time.sleep(6)
else:
    pass

# verificación de lectura
dv = ca.gql("{ collections(first:20){ nodes{ handle image{ url } } } }")
for n in dv["data"]["collections"]["nodes"]:
    if n["handle"] in ("ceramica", "iluminacion", "textil", "fragancia", "mesa", "escritorio"):
        print("lectura", n["handle"], (n.get("image") or {}).get("url", "SIN IMAGEN")[:70])
