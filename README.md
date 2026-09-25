# sercan — Prompt Havuzu

Bu depo iki şey içerir:

1. **Görsel prompt havuzu** (Midjourney ve sosyal içerik uygulaması). Dosyalar: `styles.json`, `data.json`, `data_extended.json`, `negative_bank.json`, `platforms.json`, `manifest.json`. Kurulum için [`README_FIRST_STEPS.txt`](README_FIRST_STEPS.txt) dosyasına bak.
2. **Seedance sinematik video havuzu.** 48 karakter, 43 viral sahne, prompt birleştirici ve doğrulayıcı. Dosyalar: `seedance/`, `tools/`, `prompts/`.

Başlangıç noktaları:

- Kullanım rehberi: [`SEEDANCE_REHBER.md`](SEEDANCE_REHBER.md)
- Karakter ve sahne kataloğu: [`seedance/KATALOG.md`](seedance/KATALOG.md)
- Kopyala-yapıştır hazır promptlar: [`prompts/README.md`](prompts/README.md)

```bash
python3 tools/seedance_compose.py --list-scenes
python3 tools/seedance_compose.py --scene terlik_anne --negative
python3 tools/validate.py
```
