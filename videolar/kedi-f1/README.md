# Kedi F1

Bir kedinin F1 arabasıyla rakiplerini tek tek solladığı 30 saniyelik video. Videodaki her kare kodla çizildi (HTML Canvas); video modeli kullanılmadı.

- `kedi-f1.mp4`: hazır video (1920x1080, 60 fps, sesli)
- `scene.js`: bütün sahneler; `render(t)` fonksiyonu t saniyesindeki kareyi çizer
- `audio.py`: ses bandı (motor, sollamalar, efektler, ritim)
- `render.mjs`: kareleri alır ve ffmpeg ile MP4'e çevirir

Yeniden üretmek için:

```bash
python3 audio.py
node render.mjs --fps=60
```

Tarayıcıda önizleme: `index.html?play` gerçek zamanlı oynatır, `index.html?t=12.5` tek bir kareyi gösterir.
