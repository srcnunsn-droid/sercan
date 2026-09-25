# Claude tanıtım videosu (15 sn, Instagram Reels)

- `claude_tanitim_15s.mp4`: 1080×1920, 30 fps, H.264 + AAC stereo, 15.00 sn
- `anim.html`: tüm animasyon (canvas, `draw(t)` fonksiyonu kare kare çizer)
- `render.js`: Playwright ile 450 kareyi PNG olarak alır (`node render.js`)
- `audio.py`: müzik ve ses efektleri, 120 BPM, görüntüyle senkron (`python3 audio.py`)

Kodlama: `ffmpeg -framerate 30 -i frames/f%04d.png -i audio.wav -c:v libx264 -crf 17 -pix_fmt yuv420p -c:a aac -b:a 256k -shortest claude_tanitim_15s.mp4`
