"""Higgsfield'den inen ham görselleri oyunun istediği dosyalara çevirir (geliştirici aracı).

Kullanım:  python3 gorsel_hazirla.py <ham_klasor> <oyun_klasoru>
Ham klasörde beklenen dosyalar: tavuk.png kaplumbaga.png keci.png ordek.png domuz.png
inek.png esek.png kirpi.png uzak.png zemin.png onplan.png lobi.png kursu.png logo.png efekt.png
"""
import os
import sys

import numpy as np
from PIL import Image

HAYVANLAR = ["tavuk", "kaplumbaga", "keci", "ordek", "domuz", "inek", "esek", "kirpi"]
EFEKTLER = ["muz", "roket", "havuc", "leylek", "camur"]
UZAK_KIRP = 0.66  # uzak.png'nin üstten ne kadarı kullanılsın


def mavi_sil(im):
    """Saf mavi fonu şeffaf yapar (oyundaki gölgelendirici ve FON-TEMIZLE ile aynı formül)."""
    a = np.asarray(im.convert("RGB")).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    rg = np.maximum(r, g)
    alfa = 1.0 - np.clip((b - rg - 40.0) / 60.0, 0.0, 1.0)
    b2 = np.minimum(b, rg + 15.0)  # kenarlardaki mavi yansımayı azalt
    cikti = np.dstack([r, g, b2, alfa * 255.0]).clip(0, 255).astype(np.uint8)
    return Image.fromarray(cikti, "RGBA")


def kirp(im, pay=6, esik=12):
    al = np.asarray(im)[..., 3]
    ys, xs = np.where(al > esik)
    if not len(xs):
        return im
    x0, x1 = max(0, xs.min() - pay), min(im.width, xs.max() + pay + 1)
    y0, y1 = max(0, ys.min() - pay), min(im.height, ys.max() + pay + 1)
    return im.crop((x0, y0, x1, y1))


def boy_ayarla(im, yukseklik):
    o = yukseklik / im.height
    return im.resize((max(1, round(im.width * o)), yukseklik), Image.LANCZOS)


def ayna_birlestir(im):
    """Görseli ve aynadaki halini yan yana koyar: kenarlar birebir eşleşir, yatay tekrar kesintisiz olur."""
    yeni = Image.new(im.mode, (im.width * 2, im.height))
    yeni.paste(im, (0, 0))
    yeni.paste(im.transpose(Image.FLIP_LEFT_RIGHT), (im.width, 0))
    return yeni


def efektleri_bol(im):
    """Yan yana duran 5 efekti boş sütunlara göre ayırır."""
    al = np.asarray(im)[..., 3]
    dolu = (al > 20).sum(axis=0) > 0
    gruplar, bas = [], None
    for x, d in enumerate(dolu):
        if d and bas is None:
            bas = x
        if not d and bas is not None:
            gruplar.append((bas, x))
            bas = None
    if bas is not None:
        gruplar.append((bas, len(dolu)))
    # Çok küçük kırıntıları (parıltı vb.) en yakın gruba kat
    gruplar = [g for g in gruplar if g[1] - g[0] > 3]
    while len(gruplar) > 5:
        # en dar boşluğu birleştir
        bosluk = [gruplar[i + 1][0] - gruplar[i][1] for i in range(len(gruplar) - 1)]
        i = int(np.argmin(bosluk))
        gruplar[i:i + 2] = [(gruplar[i][0], gruplar[i + 1][1])]
    return [kirp(im.crop((x0, 0, x1, im.height))) for x0, x1 in gruplar]


def main(ham, oyun):
    A = os.path.join(oyun, "assets")
    yol = lambda *p: os.path.join(A, *p)
    for h in HAYVANLAR:
        k = os.path.join(ham, h + ".png")
        if not os.path.exists(k):
            print("yok:", k)
            continue
        im = boy_ayarla(kirp(mavi_sil(Image.open(k))), 400)
        os.makedirs(yol("hayvan", h), exist_ok=True)
        im.save(yol("hayvan", h, "karakter.png"), optimize=True)
        print("karakter:", h, im.size)
    if os.path.exists(os.path.join(ham, "uzak.png")):
        im = Image.open(os.path.join(ham, "uzak.png")).convert("RGB")
        # Üretilen kare görselde üstte gökyüzü+tepeler, altta ikinci bir tepe şeridi var: üst kısmı al
        im = im.crop((0, 0, im.width, int(im.height * UZAK_KIRP)))
        im = ayna_birlestir(boy_ayarla(im, 570))
        im.save(yol("pist", "uzak.png"), optimize=True)
        print("uzak:", im.size)
    if os.path.exists(os.path.join(ham, "zemin.png")):
        im = Image.open(os.path.join(ham, "zemin.png")).convert("RGB").resize((512, 512), Image.LANCZOS)
        im.save(yol("pist", "zemin.png"), optimize=True)
        print("zemin:", im.size)
    if os.path.exists(os.path.join(ham, "onplan.png")):
        im = kirp(mavi_sil(Image.open(os.path.join(ham, "onplan.png"))), pay=0)
        im = ayna_birlestir(boy_ayarla(im, 140))
        im.save(yol("pist", "onplan.png"), optimize=True)
        print("onplan:", im.size)
    for ad in ["lobi", "kursu"]:
        k = os.path.join(ham, ad + ".png")
        if os.path.exists(k):
            Image.open(k).convert("RGB").save(yol("ekran", ad + ".png"), optimize=True)
            print("ekran:", ad)
    if os.path.exists(os.path.join(ham, "logo.png")):
        im = boy_ayarla(kirp(mavi_sil(Image.open(os.path.join(ham, "logo.png")))), 300)
        im.save(yol("ekran", "logo.png"), optimize=True)
        print("logo:", im.size)
    if os.path.exists(os.path.join(ham, "efekt.png")):
        parcalar = efektleri_bol(mavi_sil(Image.open(os.path.join(ham, "efekt.png"))))
        print("efekt parça sayısı:", len(parcalar))
        for ad, p in zip(EFEKTLER, parcalar):
            p = boy_ayarla(p, min(200, max(80, p.height)))
            p.save(yol("efekt", ad + ".png"), optimize=True)
            print("efekt:", ad, p.size)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
