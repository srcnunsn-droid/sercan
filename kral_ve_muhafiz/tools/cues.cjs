// Ortak zaman çizelgesinden türetilen çıktılar:
//  out/cues.json  — ses için adım zamanları (iskelet yürüyüş çözücüsünden, kareyle birebir aynı)
//  out/kral_ve_muhafiz.srt — altyazı
//  out/dis_ses_metni_ve_zamanlama.md — seslendirme metni ve satır zamanları
const path = require('path'), fs = require('fs');
globalThis.U = require('../src/util.js');
const TL = require('../src/timeline.js');
const RIG = require('../src/rig.js');
const out = path.resolve(__dirname, '../out');
fs.mkdirSync(out, { recursive: true });

// hangi plan aralığında hangi zemin duyulur
const shotOf = (t) => TL.shots.find((s) => t >= s.start && t < s.end);
const steps = [];
for (const w of TL.walks) {
  for (const t of RIG.footstepTimes(w)) {
    const sh = shotOf(t); if (!sh) continue;
    let surface = null;
    if (w.id === 'kingIn' || w.id === 'clerkIn') surface = sh.set === 'int' ? 'stone' : null;
    else if (sh.set === 'ext' || sh.set === 'morning') {
      // kral kapıdan içeri girdiyse (derinlik < -0.25) karda adım yok
      const st = RIG.walkState(w, t);
      surface = st.z < -0.25 ? null : 'snow';
    }
    if (!surface) continue;
    steps.push({ t, who: w.who, surface, gain: w.who === 'king' ? 0.5 : w.who === 'clerk' ? 0.35 : 0.42 });
  }
}
steps.sort((a, b) => a.t - b.t);
fs.writeFileSync(path.join(out, 'cues.json'), JSON.stringify({ steps }, null, 1));

// SRT
const ts = (t) => { const ms = Math.round(t * 1000); const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60, r = ms % 1000; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(r).padStart(3, '0')}`; };
let srt = '';
TL.lines.forEach((l, i) => { srt += `${i + 1}\n${ts(l.start)} --> ${ts(l.end + 0.35)}\n${l.sub.join('\n')}\n\n`; });
fs.writeFileSync(path.join(out, 'kral_ve_muhafiz.srt'), srt);

// Dış ses metni
let md = '# Kral ve Muhafız — Dış ses metni ve zamanlama\n\n';
md += 'Tek anlatıcı. Kralın ve muhafızın sözleri aynı anlatıcı tarafından, hafif ton farkıyla okunur. Ton sakin, anlaşılır ve ölçülü olmalı.\n';
md += 'Reklam sesi, bağırma, ağlamaklı oyunculuk ve yapay fısıltı kullanılmamalı.\n\n';
md += '> **Durum:** Bu ortamda yerel, ücretsiz bir Türkçe TTS aracı bulunamadı (espeak/espeak-ng, piper, festival, pyttsx3 yok). Seslendirme kaydı **üretilmedi**. ';
md += 'Aşağıdaki zamanlar doğal okuma hızına (~12 karakter/sn) ve gerekli duraklamalara göre ayarlanmış geçici zamanlardır. Film, altyazı ve ses efektleri bu zamanlara bağlıdır.\n\n';
md += 'Kayıt eklemek için: kaydı `audio/vo.wav` (mono/stereo, 48 kHz önerilir) olarak koyup `./render.sh` komutunu çalıştırın. Ses betiği anlatımı miksaja ekler ve müziği anlatımın altında kısar.\n';
md += 'Kaydın satır zamanları farklıysa `src/timeline.js` içindeki `lines[].start/end` değerlerini güncelleyin. Altyazı ve kurgu aynı kaynaktan yeniden hesaplanır.\n\n';
md += '| # | Başlangıç | Bitiş | Ses / ton | Metin |\n|---|---|---|---|---|\n';
TL.lines.forEach((l) => { md += `| ${l.id} | ${l.start.toFixed(2)} s | ${l.end.toFixed(2)} s | ${l.voice} | ${l.text} |\n`; });
md += `\nFinal cümlesinden önce ~1.3 sn duraklama vardır (64.6 → 65.9 s). Cümlenin ardından görüntü ~2 sn tutulur (film süresi ${TL.duration} s).\n`;
fs.writeFileSync(path.join(out, 'dis_ses_metni_ve_zamanlama.md'), md);
console.log('adım sayısı', steps.length, '| srt satır', TL.lines.length);
