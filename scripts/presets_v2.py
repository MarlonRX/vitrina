"""
S-14 presets v2 — siluetas fieles por tipo de pieza, cruzadas con la paleta.
Renderiza public/presets/<forma>-<color>.png + una hoja de contacto.
Galería de aprobación en /presets-preview (dev). No toca Shopify.
"""
import os
from PIL import Image, ImageDraw, ImageFilter

S = 900  # lienzo cuadrado
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "presets")

# Paleta editorial (coincide con tokens del sitio)
COLORS = {
    "terracota":   ("#B5563A", "#7E3421", "#F3E7DA"),
    "salvia":      ("#8A9A7B", "#5C6B4F", "#EEF1E6"),
    "carbon":      ("#3B3A38", "#232220", "#E8E4DD"),
    "laton":       ("#C89B3F", "#8F6A1E", "#F5EBD4"),
    "burdeos":     ("#6E2436", "#471421", "#F0DEDC"),
    "papel":       ("#D9CBB6", "#A79277", "#F7F2E8"),
    "indigo":      ("#3E4A6B", "#26304A", "#E6E9F2"),
    "ambar":       ("#D98E3B", "#9C5F1E", "#F7EBD8"),
}


def canvas(bg):
    img = Image.new("RGB", (S, S), bg)
    return img, ImageDraw.Draw(img, "RGBA")


def shadow(d, box, shift=18):
    x0, y0, x1, y1 = box
    d.ellipse([x0 + shift, y1 - 46, x1 + shift, y1 + 30], fill=(0, 0, 0, 38))


def round_rect(d, box, r, fill, outline=None, width=0):
    d.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)


# --- siluetas: (main, dark) son colores de la variante --------------------

def cuenco(d, m, k, o):
    shadow(d, (250, 520, 650, 640))
    d.pieslice([225, 330, 675, 690], 0, 180, fill=m)          # cuerpo
    d.ellipse([225, 300, 675, 390], fill=k)                    # boca
    d.ellipse([275, 318, 625, 372], fill=m)                    # interior
    d.rounded_rectangle([400, 636, 500, 668], 14, fill=k)      # pie


def taza(d, m, k, o):
    shadow(d, (300, 600, 620, 660))
    d.ellipse([555, 380, 700, 540], outline=m, width=34)       # asa
    round_rect(d, (300, 360, 620, 650), 46, m)                 # cuerpo
    d.ellipse([300, 336, 620, 408], fill=k)                    # borde
    d.ellipse([332, 352, 588, 396], fill=m)                    # interior
    d.rectangle([318, 500, 602, 522], fill=(255, 255, 255, 54))  # banda


def jarron(d, m, k, o):
    shadow(d, (360, 640, 560, 680))
    body = [(430, 250), (470, 250), (500, 330), (560, 430),
            (560, 560), (500, 650), (400, 650), (340, 560),
            (340, 430), (400, 330)]
    d.polygon(body, fill=m)
    d.ellipse([418, 232, 482, 268], fill=k)
    d.ellipse([430, 242, 470, 260], fill=m)
    d.rectangle([340, 470, 560, 492], fill=(255, 255, 255, 48))


def jarra(d, m, k, o):
    shadow(d, (330, 620, 600, 660))
    d.ellipse([560, 380, 690, 540], outline=m, width=30)       # asa
    round_rect(d, (330, 320, 610, 630), 40, m)                 # cuerpo
    # cuello con pico alto y afilado (leíble también sobre carbón/índigo)
    d.polygon([(360, 330), (330, 236), (420, 286), (482, 318),
               (470, 360), (352, 360)], fill=m, outline=o, width=6)
    d.ellipse([322, 224, 382, 258], fill=k, outline=o, width=4)  # boca
    d.rectangle([330, 450, 610, 478], fill=k)                  # línea de agua


def maceta(d, m, k, o):
    shadow(d, (330, 630, 600, 670))
    d.polygon([(330, 380), (600, 380), (560, 640), (370, 640)], fill=m)
    round_rect(d, (312, 344, 618, 404), 22, k)                 # labio
    d.polygon([(410, 200), (455, 120), (470, 210), (520, 150), (560, 230),
               (480, 300), (400, 300)], fill=(0, 0, 0, 0))     # (placeholder planta)
    d.ellipse([388, 180, 468, 300], fill="#8A9A7B")            # hoja
    d.ellipse([448, 150, 540, 280], fill="#6E8060")            # hoja
    d.ellipse([408, 230, 520, 330], fill="#9CB08C")


def plato(d, m, k, o):
    shadow(d, (230, 560, 680, 640))
    d.ellipse([210, 470, 700, 630], fill=k)                    # borde exterior
    d.ellipse([246, 486, 664, 614], fill=m)                    # cuerpo
    d.ellipse([320, 508, 590, 592], fill=k)                    # cavidad
    d.ellipse([342, 516, 568, 584], fill=m)


def set_de_te(d, m, k, o):
    plato(d, m, k, o)
    d.ellipse([640, 470, 760, 560], outline=m, width=22)       # asa taza alta
    round_rect(d, (430, 380, 640, 560), 34, m)
    d.ellipse([430, 360, 640, 414], fill=k)
    d.ellipse([458, 372, 612, 404], fill=m)


def vela(d, m, k, o):
    shadow(d, (350, 620, 580, 660))
    round_rect(d, (350, 380, 580, 640), 26, m)                 # cera
    d.ellipse([350, 356, 580, 410], fill=k)                    # borde vidrio
    d.ellipse([372, 372, 558, 400], fill=(245, 238, 226, 255)) # superficie
    d.line([(465, 386), (465, 340)], fill="#4A4237", width=7)  # mecha
    d.ellipse([442, 262, 488, 348], fill="#E8A93C")            # llama
    d.ellipse([452, 288, 478, 336], fill="#F6D27A")


def difusor(d, m, k, o):
    shadow(d, (360, 630, 570, 670))
    round_rect(d, (360, 430, 570, 645), 36, m)
    d.ellipse([360, 410, 570, 458], fill=k)
    round_rect(d, (432, 366, 498, 430), 12, k)                 # tapa
    for i, x in enumerate((400, 440, 470, 505, 540)):          # varillas
        d.line([(x, 396), (x + (i - 2) * 26, 140)], fill="#B99B76", width=9)


LUCES = {"colgante", "lampara_mesa"}


def colgante(d, m, k, o):
    d.line([(450, 0), (450, 260)], fill=o, width=16)           # cable visible
    d.line([(450, 0), (450, 260)], fill="#4A4237", width=9)
    d.polygon([(450, 250), (640, 560), (260, 560)], fill=m, outline=o, width=6)
    d.ellipse([260, 540, 640, 600], fill=k)
    d.ellipse([300, 548, 600, 596], fill="#F2B84B")            # charco de luz
    d.ellipse([410, 560, 490, 640], fill="#F6E9C8")            # bombilla


def mesa_lamp(d, m, k, o):
    d.polygon([(340, 260), (560, 260), (610, 420), (290, 420)], fill=m, outline=o, width=6)
    d.ellipse([290, 402, 610, 442], fill=k)
    d.ellipse([320, 406, 580, 440], fill="#F2B84B")            # luz bajo el borde
    d.rectangle([436, 430, 464, 610], fill=k, outline=o, width=4)  # pie
    shadow(d, (350, 600, 560, 640))
    d.ellipse([350, 600, 560, 648], fill=m, outline=o, width=4)


def manta(d, m, k, o):
    shadow(d, (250, 620, 670, 660))
    round_rect(d, (240, 300, 680, 640), 26, m)
    for y in (350, 386):                                       # franjas
        d.rectangle([240, y, 680, y + 16], fill=k)
    d.line([(240, 480), (680, 480)], fill=o, width=12)         # raya de trama
    for x in range(252, 676, 28):                              # flecos gruesos
        d.line([(x, 636), (x + 6, 692)], fill=o, width=11)


def coj(d, m, k, o):
    shadow(d, (290, 640, 640, 680))
    round_rect(d, (270, 330, 650, 680), 60, m)
    d.line([(300, 360), (620, 650)], fill=o, width=12)         # costuras en aspa
    d.line([(620, 360), (300, 650)], fill=o, width=12)
    d.ellipse([420, 460, 500, 540], fill=k)                    # botón


FORMAS = {
    "cuenco": cuenco, "taza": taza, "jarron": jarron, "jarra": jarra,
    "maceta": maceta, "plato": plato, "set_de_te": set_de_te, "vela": vela,
    "difusor": difusor, "manta": manta, "cojin": coj,
    "colgante": colgante, "lampara_mesa": mesa_lamp,
}


def render(shape, color):
    m, k, bg = COLORS[color]
    img, d = canvas(bg)
    fn = FORMAS.get(shape)
    if not fn:
        raise ValueError(f"forma desconocida: {shape}")
    # trazo de contraste: claro sobre colores oscuros, oscuro sobre claros
    o = "#EDE6DA" if color in ("carbon", "indigo", "burdeos") else "#2E2A25"
    if shape in LUCES:
        # halo difuso DETRAS del objeto: no lava la pantalla ni el cable
        glow = Image.new("L", (S, S), 0)
        gd = ImageDraw.Draw(glow)
        gd.ellipse([280, 360, 620, 700], fill=170)
        glow = glow.filter(ImageFilter.GaussianBlur(95))
        # sobre fondo papel el ámbar desaparece → blanco más frío y brillante
        warm_rgb = (255, 250, 240) if color == "papel" else (250, 226, 168)
        img = Image.composite(Image.new("RGB", (S, S), warm_rgb), img, glow)
    d = ImageDraw.Draw(img, "RGBA")
    fn(d, m, k, o)
    return img


def main():
    os.makedirs(OUT, exist_ok=True)
    shapes = list(FORMAS.keys()) + ["colgante", "lampara_mesa"]
    n = 0
    for shape in shapes:
        for color in COLORS:
            try:
                render(shape, color).save(f"{OUT}/{shape}-{color}.png")
                n += 1
            except Exception as e:
                print("FALLO", shape, color, e)
    print(f"render: {n} imágenes en public/presets")


if __name__ == "__main__":
    main()
