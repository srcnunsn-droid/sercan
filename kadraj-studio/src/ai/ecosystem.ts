// Açık kaynak ekosistem haritası — stüdyoya bağlanabilecek / ilham alınan projeler.
// Lisans notları özet niteliğindedir; ticari kullanımdan önce her reponun LICENSE dosyasını doğrula.
export type Status = 'Entegre' | 'Adaptör hazır' | 'Yol haritası' | 'Referans';
export interface Tool { name: string; repo: string; cat: string; what: string; license: string; status: Status; hw?: string }

export const ECOSYSTEM: Tool[] = [
  // Orkestrasyon
  { name: 'ComfyUI', repo: 'comfyanonymous/ComfyUI', cat: 'Orkestrasyon', what: 'Düğüm tabanlı görsel/video üretim motoru. Wan, LTX, Hunyuan, Flux hepsi burada çalışır. Stüdyo HTTP API ile bağlanır.', license: 'GPL-3.0', status: 'Adaptör hazır' },
  { name: 'ComfyUI-WanVideoWrapper', repo: 'kijai/ComfyUI-WanVideoWrapper', cat: 'Orkestrasyon', what: 'Wan modelleri için gelişmiş ComfyUI düğümleri (I2V, VACE, kontrol).', license: 'Apache-2.0', status: 'Adaptör hazır' },
  { name: 'ComfyUI-VideoHelperSuite', repo: 'Kosinkadink/ComfyUI-VideoHelperSuite', cat: 'Orkestrasyon', what: 'ComfyUI içinde video yükleme/kaydetme (MP4 çıktı → stüdyoya düşer).', license: 'GPL-3.0', status: 'Adaptör hazır' },
  { name: 'Ollama', repo: 'ollama/ollama', cat: 'Orkestrasyon', what: 'Yerel LLM sunucusu: senaryo, hook, prompt yazımı.', license: 'MIT', status: 'Adaptör hazır' },
  // Video modelleri
  { name: 'Wan 2.1 / 2.2', repo: 'Wan-Video/Wan2.2', cat: 'Video üretimi', what: 'Açık ağırlıklı en kaliteli T2V/I2V ailesi; 5B sürümü tüketici GPU’da çalışır.', license: 'Apache-2.0', status: 'Adaptör hazır', hw: '8–24 GB VRAM' },
  { name: 'LTX-Video / LTX-2', repo: 'Lightricks/LTX-Video', cat: 'Video üretimi', what: 'Çok hızlı video üretimi; LTX-2 ses+görüntüyü birlikte üretebiliyor. Resmi ComfyUI desteği.', license: 'Açık ağırlık (kendi lisansı)', status: 'Adaptör hazır', hw: '8–16 GB VRAM' },
  { name: 'HunyuanVideo 1.5', repo: 'Tencent-Hunyuan/HunyuanVideo-1.5', cat: 'Video üretimi', what: 'Tencent’in açık video modeli, güçlü hareket kalitesi.', license: 'Tencent Hunyuan Community', status: 'Adaptör hazır', hw: '14–24 GB VRAM' },
  { name: 'FramePack', repo: 'lllyasviel/FramePack', cat: 'Video üretimi', what: 'Düşük VRAM ile uzun image-to-video (dakikalarca).', license: 'Apache-2.0', status: 'Yol haritası', hw: '6 GB VRAM' },
  { name: 'CogVideoX', repo: 'THUDM/CogVideo', cat: 'Video üretimi', what: 'T2V/I2V, geniş topluluk desteği.', license: 'Apache-2.0 / model lisansı', status: 'Referans' },
  { name: 'Mochi 1', repo: 'genmo/mochi', cat: 'Video üretimi', what: 'Yüksek hareket sadakati olan açık T2V.', license: 'Apache-2.0', status: 'Referans' },
  { name: 'Open-Sora', repo: 'hpcaitech/Open-Sora', cat: 'Video üretimi', what: 'Tam açık eğitim + çıkarım hattı.', license: 'Apache-2.0', status: 'Referans' },
  // Görsel
  { name: 'FLUX.1', repo: 'black-forest-labs/flux', cat: 'Görsel üretimi', what: 'Üst düzey metinden görsel; schnell ticari serbest, dev ticari değil.', license: 'schnell Apache-2.0 / dev NC', status: 'Adaptör hazır' },
  { name: 'Qwen-Image', repo: 'QwenLM/Qwen-Image', cat: 'Görsel üretimi', what: 'Görselde metin yazımı çok iyi, düzenleme (edit) modu var.', license: 'Apache-2.0', status: 'Adaptör hazır' },
  // Karakter / yüz
  { name: 'LivePortrait', repo: 'KwaiVGI/LivePortrait', cat: 'Karakter & yüz', what: 'Tek fotoğrafı mimiklerle canlandırma.', license: 'MIT (kod)', status: 'Yol haritası' },
  { name: 'LatentSync', repo: 'bytedance/LatentSync', cat: 'Karakter & yüz', what: 'Yüksek kaliteli dudak senkronu (lip-sync).', license: 'Apache-2.0', status: 'Yol haritası' },
  { name: 'MuseTalk', repo: 'TMElyralab/MuseTalk', cat: 'Karakter & yüz', what: 'Gerçek zamanlı lip-sync.', license: 'MIT', status: 'Referans' },
  // Ses
  { name: 'Kokoro-82M', repo: 'hexgrad/kokoro', cat: 'Ses & TTS', what: 'Küçük, CPU’da bile hızlı TTS. Kokoro-FastAPI ile OpenAI-uyumlu sunucu.', license: 'Apache-2.0', status: 'Adaptör hazır' },
  { name: 'Kokoro-FastAPI', repo: 'remsky/Kokoro-FastAPI', cat: 'Ses & TTS', what: 'Kokoro için Docker’lı /v1/audio/speech sunucusu (port 8880).', license: 'Apache-2.0', status: 'Adaptör hazır' },
  { name: 'Chatterbox', repo: 'resemble-ai/chatterbox', cat: 'Ses & TTS', what: '5 sn örnekle ses klonlama + duygu kontrolü, çok dilli sürümü var.', license: 'MIT', status: 'Adaptör hazır' },
  { name: 'Piper', repo: 'OHF-Voice/piper1-gpl', cat: 'Ses & TTS', what: 'Ultra hafif çevrimdışı TTS, Türkçe ses modelleri var.', license: 'GPL-3.0 (eski sürüm MIT)', status: 'Yol haritası' },
  { name: 'F5-TTS', repo: 'SWivid/F5-TTS', cat: 'Ses & TTS', what: 'Doğal ses klonlama.', license: 'Kod MIT / model CC-BY-NC', status: 'Referans' },
  { name: 'RVC', repo: 'RVC-Project/Retrieval-based-Voice-Conversion-WebUI', cat: 'Ses & TTS', what: 'Ses dönüştürme (kendi sesini başka tona çevirme).', license: 'MIT', status: 'Referans' },
  { name: 'ACE-Step', repo: 'ace-step/ACE-Step', cat: 'Müzik', what: 'Sözlü/şarkılı tam müzik üretimi, hızlı.', license: 'Apache-2.0', status: 'Yol haritası' },
  { name: 'MusicGen (AudioCraft)', repo: 'facebookresearch/audiocraft', cat: 'Müzik', what: 'Metinden enstrümantal müzik.', license: 'Kod MIT / ağırlık CC-BY-NC', status: 'Referans' },
  { name: 'Stable Audio Open', repo: 'Stability-AI/stable-audio-tools', cat: 'Müzik', what: 'SFX ve kısa müzik üretimi.', license: 'Stability Community', status: 'Referans' },
  { name: 'Demucs', repo: 'facebookresearch/demucs', cat: 'Müzik', what: 'Şarkıyı vokal/davul/bas/diğer olarak ayırma.', license: 'MIT', status: 'Yol haritası' },
  // Analiz & post
  { name: 'Whisper / whisper.cpp', repo: 'ggml-org/whisper.cpp', cat: 'Altyazı & analiz', what: 'Otomatik transkripsiyon → altyazı. Stüdyoda transformers.js ile tarayıcı içinde (WebGPU/WASM) çalışıyor.', license: 'MIT', status: 'Entegre' },
  { name: 'Transformers.js', repo: 'huggingface/transformers.js', cat: 'Altyazı & analiz', what: 'Hugging Face modellerini tarayıcıda çalıştırır (Whisper, arka plan silme, derinlik…).', license: 'Apache-2.0', status: 'Entegre' },
  { name: 'faster-whisper', repo: 'SYSTRAN/faster-whisper', cat: 'Altyazı & analiz', what: 'Whisper’ın 4x hızlı sürümü.', license: 'MIT', status: 'Referans' },
  { name: 'auto-editor', repo: 'WyattBlue/auto-editor', cat: 'Altyazı & analiz', what: 'Sessiz bölümleri otomatik kesme (jump-cut).', license: 'Unlicense', status: 'Yol haritası' },
  { name: 'Real-ESRGAN', repo: 'xinntao/Real-ESRGAN', cat: 'Post-prodüksiyon', what: 'Görsel/video 4x büyütme (upscale).', license: 'BSD-3', status: 'Yol haritası' },
  { name: 'RIFE', repo: 'hzwer/Practical-RIFE', cat: 'Post-prodüksiyon', what: 'Ara kare üretimi: 16fps AI videoyu 30/60fps’e akıcılaştırma, yavaş çekim.', license: 'MIT', status: 'Yol haritası' },
  { name: 'MODNet / RMBG', repo: 'ZHKKKe/MODNet', cat: 'Post-prodüksiyon', what: 'Arka plan silme — Görsel Stüdyo’da tarayıcı içinde (transformers.js) çalışıyor.', license: 'Apache-2.0 (RMBG: NC)', status: 'Entegre' },
  { name: 'rembg / BiRefNet', repo: 'danielgatis/rembg', cat: 'Post-prodüksiyon', what: 'Arka plan silme (görsel & kare kare video).', license: 'MIT', status: 'Yol haritası' },
  { name: 'SAM 2', repo: 'facebookresearch/sam2', cat: 'Post-prodüksiyon', what: 'Videoda nesne takibi/maskeleme (rotoskop).', license: 'Apache-2.0', status: 'Referans' },
  // Kurgu & motion
  { name: 'mp4-muxer', repo: 'Vanilagy/mp4-muxer', cat: 'Kurgu & motion', what: 'Tarayıcıda MP4 paketleme — stüdyonun render çıktısı bununla.', license: 'MIT', status: 'Entegre' },
  { name: 'Mediabunny', repo: 'Vanilagy/mediabunny', cat: 'Kurgu & motion', what: 'mp4-muxer’ın halefi: okuma+yazma, dönüştürme.', license: 'MPL-2.0', status: 'Yol haritası' },
  { name: 'ffmpeg.wasm', repo: 'ffmpegwasm/ffmpeg.wasm', cat: 'Kurgu & motion', what: 'Tarayıcıda FFmpeg: format dönüştürme, GIF, ProRes vb.', license: 'MIT (+FFmpeg LGPL/GPL)', status: 'Yol haritası' },
  { name: 'Remotion', repo: 'remotion-dev/remotion', cat: 'Kurgu & motion', what: 'React ile programatik video; sunucu tarafı render.', license: 'Özel (bireylere ücretsiz)', status: 'Referans' },
  { name: 'Motion Canvas', repo: 'motion-canvas/motion-canvas', cat: 'Kurgu & motion', what: 'Kodla açıklayıcı animasyonlar (explainer).', license: 'MIT', status: 'Referans' },
  { name: 'Revideo', repo: 'redotvideo/revideo', cat: 'Kurgu & motion', what: 'Motion Canvas tabanlı, API ile render.', license: 'MIT', status: 'Referans' },
  { name: 'Theatre.js', repo: 'theatre-js/theatre', cat: 'Kurgu & motion', what: 'Profesyonel keyframe/eğri editörü fikri.', license: 'Apache-2.0 / AGPL', status: 'Referans' },
  { name: 'MoviePy', repo: 'Zulko/moviepy', cat: 'Kurgu & motion', what: 'Python ile toplu/otomatik kurgu.', license: 'MIT', status: 'Referans' },
  { name: 'Kdenlive / Shotcut', repo: 'KDE/kdenlive', cat: 'Kurgu & motion', what: 'Açık kaynak NLE referansı (iz, efekt, geçiş UX).', license: 'GPL-3.0', status: 'Referans' },
  { name: 'Blender', repo: 'blender/blender', cat: 'Kurgu & motion', what: '3D sahne, kamera hareketi, VFX; ComfyUI’ye derinlik/poz kontrolü verir.', license: 'GPL', status: 'Referans' },
];

export const ROADMAP = [
  { k: 'Faz 1 · Şimdi (bu sürüm)', items: ['Fikir → Senaryo → Shot listesi (çevrimdışı motor + Ollama)', 'Storyboard eskiz üretimi, prompt paketi', 'Çok izli timeline, keyframe, 16 efekt, 12 geçiş, 8 metin animasyonu, grade presetleri', 'Prosedürel müzik + 14 SFX + mikrofon VO', 'Kare-doğru MP4 render (H.264/HEVC/VP9 + AAC)', 'ComfyUI / Ollama / Yerel TTS adaptörleri', 'Tarayıcıda Whisper altyazı + SRT', 'Beat algılama → vuruşa kesme', 'Otomatik ducking', 'Önizlemede sürükle/ölçekle, 7 şablon', 'Yönetmen: Türkçe komutla kurgu (Ctrl+K)', 'Chroma key, maske, renk tekerlekleri, .cube LUT, glow', 'Sessizlik kesme, kare dondurma', 'WebGL2 GPU efekt motoru', 'Görsel Stüdyo: katmanlar, fırça/silgi, AI dekupe, PNG/JPG/WebP', 'Ayar katmanı, video skopları, seçim araçları, piksel geçmişi, kırpma', 'AE: expressions, parenting/null, grafik editörü, motion blur, trim paths, parçacıklar', '400 parametrik hareketli grafik şablonu (40 tasarım × 10 palet)'] },
  { k: 'Faz 2 · Yerel AI derinleşme', items: ['Tüm katman kompozitini GPU’ya taşıma (gerçek zamanlı 4K)', 'Sihirli değnek ve AI nesne seçimi (SAM 2)', 'Bezier kalem maskesi ve hareket takibi (tracking)', 'Kompozisyon iç içe (precomp), 3B katmanlar ve kamera', 'Karakter bazlı metin animatörleri', 'Ses klonlama (Chatterbox sunucusu)', 'ComfyUI kuyruğu: tüm shotları toplu üret, varyasyon karşılaştırma', 'RIFE ara kare, Real-ESRGAN upscale (ComfyUI üzerinden)'] },
  { k: 'Faz 3 · Profesyonel', items: ['Masaüstü uygulama (Tauri) + yerel ffmpeg render, ProRes/DNxHR', 'Karakter tutarlılığı: referans kütüphanesi + LoRA', 'Lip-sync (LatentSync), yüz canlandırma (LivePortrait)', 'Eğri (graph) editörü, maske/rotoskop (SAM 2)', 'Ekip: proje paylaşımı, yorum, versiyon'] },
  { k: 'Faz 4 · Bulut (opsiyonel)', items: ['Backend proxy ile API anahtarı güvenli saklama', 'Seedance / Kling / Veo / ElevenLabs / Suno sağlayıcıları', 'Kredi/maliyet takibi, render farm'] },
];
