// Fikir → Senaryo → Shot listesi motoru. Çevrimdışı şablon zekâsı (API gerekmez).
// Yerel LLM (Ollama) bağlıysa aynı şemayı LLM'e de ürettirebiliriz (providers.ts).
import type { Idea, Scene, Shot } from '../types';
import { hashStr, pick, rng, uid } from '../util';

export const FORMATS: Record<string, { label: string; beats: { name: string; frac: number; desc: string[] }[] }> = {
  reklam: { label: 'Reklam / Ticari', beats: [
    { name: 'Kanca', frac: 0.1, desc: ['{T} dünyasından dikkat çeken, beklenmedik bir görüntüyle açılış', 'Ekrana sert giren makro detay: {T}', 'Kameraya dönen karakter tek cümleyle merak uyandırıyor: {T}'] },
    { name: 'Sorun', frac: 0.18, desc: ['Hedef kitlenin gündelik derdi abartılı ve esprili biçimde gösteriliyor', 'Karakter {T} olmadan yaşanan aksaklıkla boğuşuyor'] },
    { name: 'Çözüm', frac: 0.22, desc: ['{T} sahneye "kahraman" gibi giriyor, ışık değişiyor', 'Ürün/hizmet ({T}) yavaş çekimde ortaya çıkıyor'] },
    { name: 'Fayda / Demo', frac: 0.25, desc: ['{T} kullanımda: hızlı kurgu, 3 net fayda ekranda yazıyla', 'Önce/sonra bölünmüş ekran: {T} farkı'] },
    { name: 'Kanıt', frac: 0.1, desc: ['Mutlu kullanıcı tepkileri, kısa yorumlar ekranda', 'Rakamlarla güven: kullanıcı sayısı, puan, ödül'] },
    { name: 'Çağrı (CTA)', frac: 0.15, desc: ['Hero packshot: {T} logo ile, net çağrı ve web adresi', 'Logo animasyonu + slogan + "Şimdi dene"'] },
  ] },
  shorts: { label: 'Shorts / Reels / TikTok', beats: [
    { name: 'Kanca (0-2sn)', frac: 0.12, desc: ['İlk karede şok edici iddia: "{T} hakkında herkes yanılıyor"', 'Hareketin ortasından başlayan sahne: {T}', 'Yakın plan yüz + büyük alt yazı: {T}'] },
    { name: 'Bağlam', frac: 0.2, desc: ['Hızlı B-roll montajı ile {T} konusunun kısa özeti', 'Ekranda sayaç/liste başlıyor: {T}'] },
    { name: 'Merak / Gerilim', frac: 0.3, desc: ['Bilgi parça parça açılıyor, her 2 saniyede görsel değişim', 'Beklenti yükseliyor: zoom-in kesmeleri, riser sesi'] },
    { name: 'Payoff', frac: 0.26, desc: ['Büyük açıklama: {T} ile ilgili asıl sonuç', 'Şaşırtıcı final görüntüsü, kısa sessizlik + darbe'] },
    { name: 'Döngü / CTA', frac: 0.12, desc: ['İlk kareye bağlanan son kare (loop), "takip et" yazısı', 'Soru ile kapanış: yorumlara yaz'] },
  ] },
  kisafilm: { label: 'Kısa Film', beats: [
    { name: 'Açılış imajı', frac: 0.1, desc: ['Atmosferik geniş plan: {T} dünyası sessizce tanıtılıyor', 'Karakterin rutini, detaylarla anlatılan yalnızlık'] },
    { name: 'Tetikleyici olay', frac: 0.15, desc: ['Beklenmedik bir olay karakterin dengesini bozuyor: {T}', 'Bir mesaj/obje her şeyi değiştiriyor'] },
    { name: 'Yükselen çatışma', frac: 0.3, desc: ['Karakter hedefine ilerlerken engeller büyüyor', 'Gerilim artıyor; kesmeler kısalıyor, kamera omuzda'] },
    { name: 'Dönüm noktası', frac: 0.15, desc: ['Kritik karar anı: karakter gerçeği fark ediyor', 'Her şeyin tersine döndüğü sessiz an'] },
    { name: 'Doruk', frac: 0.18, desc: ['Duygusal/aksiyonlu zirve: {T} ile yüzleşme', 'En büyük görsel an, yavaş çekim'] },
    { name: 'Kapanış imajı', frac: 0.12, desc: ['Açılış imajının değişmiş hâli — karakterin dönüşümü', 'Geniş plan, ufka bakış, siyaha geçiş'] },
  ] },
  belgesel: { label: 'Belgesel / Anlatım (Faceless)', beats: [
    { name: 'Soğuk açılış', frac: 0.1, desc: ['Arşiv hissi veren görüntü + çarpıcı soru: {T}?', 'Karanlıktan çıkan tek görüntü, anlatıcı sesi başlıyor'] },
    { name: 'Bağlam', frac: 0.2, desc: ['Harita/zaman çizelgesi ile {T} konusunun arka planı', 'Dönemin görselleri, kâğıt dokusu, yavaş Ken Burns'] },
    { name: 'Bölüm 1', frac: 0.2, desc: ['Birinci önemli bilgi; infografik ve rakamlar', 'Uzman anlatımı yerine metin kartı ve B-roll'] },
    { name: 'Bölüm 2', frac: 0.2, desc: ['İkinci katman: neden-sonuç ilişkisi, karşılaştırma', 'Görsel metafor ile soyut fikir somutlaşıyor'] },
    { name: 'Şaşırtıcı gerçek', frac: 0.15, desc: ['Bilinmeyen detay açığa çıkıyor: {T}', 'Müzik kesilir, tek cümle ekranda'] },
    { name: 'Sonuç', frac: 0.15, desc: ['Bugüne bağlanan kapanış, izleyiciye soru', 'Özet + abone çağrısı'] },
  ] },
  klip: { label: 'Müzik Klibi', beats: [
    { name: 'İntro', frac: 0.12, desc: ['Atmosfer: siluetler, ışık huzmeleri, {T} teması', 'Yavaş dolly, sis ve kontra ışık'] },
    { name: 'Verse', frac: 0.22, desc: ['Sanatçı performansı orta plan, ritimle kesmeler', 'Hikâye parçaları: {T}'] },
    { name: 'Build-up', frac: 0.14, desc: ['Kesmeler hızlanıyor, flaş geçişler, riser', 'Kamera dönüyor, enerji birikiyor'] },
    { name: 'Nakarat', frac: 0.24, desc: ['Patlama: geniş plan dans/performans, renkli ışıklar', 'Speed ramp + beat-sync kesmeler'] },
    { name: 'Bridge', frac: 0.12, desc: ['Sakin, intim yakın planlar, siyah-beyaz', 'Tek ışık kaynağı, duygusal yüz'] },
    { name: 'Final', frac: 0.16, desc: ['Final nakarat, tüm enerjinin zirvesi, geniş vinç', 'Son poz, siyaha kesme'] },
  ] },
  urun: { label: 'Ürün Tanıtımı', beats: [
    { name: 'Gizem', frac: 0.14, desc: ['Karanlıkta ürün silüeti, kenar ışığı süzülüyor: {T}', 'Makro detaylar, ne olduğu henüz belli değil'] },
    { name: 'Açılış', frac: 0.16, desc: ['360° orbit ile {T} tam görünüyor', 'Ürün döner tabla üzerinde, stüdyo ışığı'] },
    { name: 'Özellikler', frac: 0.3, desc: ['Her özellik için makro + ekranda çağrı (callout) yazısı', 'Patlatılmış görünüm / parçalar havada'] },
    { name: 'Kullanım', frac: 0.2, desc: ['Gerçek hayatta {T} kullanan kişi, doğal ışık', 'Lifestyle montajı'] },
    { name: 'Hero shot', frac: 0.2, desc: ['Kahraman çekimi: ürün + logo + fiyat/CTA', 'Yavaş push-in, parlama efekti'] },
  ] },
  fragman: { label: 'Fragman (Trailer)', beats: [
    { name: 'Atmosfer', frac: 0.12, desc: ['Sessizlik, uzak sesler, {T} dünyasından ilk kare', 'Logo kartı + drone'] },
    { name: 'Dünya', frac: 0.2, desc: ['Ana karakter ve dünyası tanıtılıyor', 'Geniş planlar, epik ölçek'] },
    { name: 'Tehdit', frac: 0.2, desc: ['Karanlık bir güç beliriyor: {T}', 'BRAAM sesi ile kesme'] },
    { name: 'Montaj', frac: 0.28, desc: ['Hızlanan aksiyon montajı, siyaha flaş kesmeler', 'Ritmik vuruşlar, metin kartları'] },
    { name: 'Başlık', frac: 0.2, desc: ['Ana başlık kartı + tarih', 'Son sürpriz kare (stinger)'] },
  ] },
};

export const TONES: Record<string, { palette: string[]; look: string; music: string; bpm: number; font: string; moves: string[]; light: string[] }> = {
  Epik: { palette: ['#0a0f1a', '#1f3b5a', '#e0a040', '#f5e6c8'], look: 'Teal & orange, anamorfik, yüksek kontrast, hafif gren', music: 'epik', bpm: 90, font: 'Bebas Neue', moves: ['Vinç yükselen (crane up)', 'Yavaş dolly in', 'Orbit 180°', 'Drone geniş takip'], light: ['Altın saat kontra ışık', 'Volumetrik ışık huzmeleri', 'Fırtına öncesi dramatik gökyüzü'] },
  Duygusal: { palette: ['#1b1a24', '#4a3f5c', '#d9a7a0', '#f3e9dc'], look: 'Yumuşak pastel, düşük kontrast, sığ alan derinliği, film emülasyonu', music: 'duygusal', bpm: 72, font: 'Playfair Display', moves: ['El kamerası nefes alan', 'Yavaş dolly in', 'Statik, uzun plan', 'Rack focus'], light: ['Pencere ışığı, yumuşak', 'Gün batımı sıcak', 'Mum ışığı'] },
  Enerjik: { palette: ['#0d0d0d', '#ff2e63', '#08d9d6', '#eaeaea'], look: 'Doygun renkler, hızlı kesmeler, speed ramp, beat-sync', music: 'enerjik', bpm: 124, font: 'Bebas Neue', moves: ['Whip pan', 'Hızlı push-in', 'Takip (tracking) yanlamasına', 'FPV dalış'], light: ['Neon karışık ışık', 'Sert güneş, net gölgeler', 'Stüdyo RGB'] },
  Gerilim: { palette: ['#07090c', '#1c2a2e', '#7a1f1f', '#b8c4c2'], look: 'Soğuk yeşil-mavi, ezilmiş siyahlar, dar kadraj, sarsıntı', music: 'gerilim', bpm: 100, font: 'Inter', moves: ['Omuz kamerası', 'Yavaş dolly in (Hitchcock)', 'Dutch angle statik', 'Pan ile açığa çıkarma'], light: ['Tek kaynak, sert gölge', 'Floresan titreşim', 'Ay ışığı soğuk'] },
  Komik: { palette: ['#fff7e0', '#ffcb47', '#ff6b6b', '#3a86ff'], look: 'Parlak, simetrik kompozisyon, canlı renkler', music: 'enerjik', bpm: 118, font: 'Arial Black', moves: ['Crash zoom', 'Statik simetrik', 'Whip pan', 'Hızlı truck'], light: ['Düz ve parlak', 'Sitcom üç nokta', 'Güneşli dış mekân'] },
  Minimal: { palette: ['#f4f4f2', '#d9d9d6', '#1a1a1a', '#e8475f'], look: 'Temiz, geniş negatif alan, yumuşak gölgeler, kurumsal', music: 'minimal', bpm: 105, font: 'Inter', moves: ['Yavaş slider', 'Statik', 'Top-down', 'Yavaş orbit'], light: ['Yumuşak kutu ışık', 'Gün ışığı stüdyo', 'High-key'] },
  Karanlık: { palette: ['#050505', '#1a1410', '#8c6a43', '#d8c8a8'], look: 'Sepya/arşiv, ağır vinyet, gren, düşük anahtar ışık', music: 'karanlik', bpm: 70, font: 'Playfair Display', moves: ['Yavaş Ken Burns', 'Statik', 'Yavaş pan', 'Dolly out'], light: ['Low-key chiaroscuro', 'Lamba ışığı', 'Sisli loş'] },
};

const SIZES = ['Çok geniş (EWS)', 'Geniş (WS)', 'Boy (FS)', 'Diz (MS)', 'Bel (MCU)', 'Yakın (CU)', 'Detay (ECU)', 'Omuz üstü (OTS)', 'POV', 'Ürün çekimi'];
const LENSES = ['14mm ultra geniş', '24mm geniş', '35mm', '50mm', '85mm portre', '100mm makro', '135mm tele', '40mm anamorfik'];
const SFX_FOR: Record<string, string> = { 'Kanca': 'impact', 'Kanca (0-2sn)': 'impact', 'Çözüm': 'whoosh', 'Payoff': 'braam', 'Tehdit': 'braam', 'Build-up': 'riser', 'Merak / Gerilim': 'riser', 'Montaj': 'whoosh', 'Gizem': 'drone', 'Soğuk açılış': 'drone', 'Çağrı (CTA)': 'pop', 'Döngü / CTA': 'pop', 'Başlık': 'impact', 'Hero shot': 'sparkle' };

const EN_SIZE: Record<string, string> = { 'Çok geniş (EWS)': 'extreme wide shot', 'Geniş (WS)': 'wide shot', 'Boy (FS)': 'full shot', 'Diz (MS)': 'medium shot', 'Bel (MCU)': 'medium close-up', 'Yakın (CU)': 'close-up', 'Detay (ECU)': 'extreme close-up', 'Omuz üstü (OTS)': 'over-the-shoulder shot', 'POV': 'POV shot', 'Ürün çekimi': 'product hero shot' };

export function buildPrompt(s: Shot, idea: Idea | null): { prompt: string; negative: string } {
  const tone = idea ? TONES[idea.tone] : null;
  const parts = [
    `${EN_SIZE[s.size] ?? s.size}`, s.desc, idea?.topic ? `subject: ${idea.topic}` : '',
    `camera: ${s.move}`, `lens: ${s.lens}`, `lighting: ${s.light}`,
    tone ? `look: ${tone.look}` : '', idea ? `palette ${idea.style.palette.join(' ')}` : '',
    'cinematic, highly detailed, natural motion, 24fps, film grain',
  ].filter(Boolean);
  return { prompt: parts.join(', '), negative: 'blurry, low quality, deformed hands, extra fingers, warped face, text artifacts, watermark, logo distortion, flicker, morphing, oversaturated' };
}

export function generateIdea(input: Pick<Idea, 'topic' | 'format' | 'tone' | 'audience' | 'duration' | 'aspect' | 'notes'>, seed = Date.now()): { idea: Idea; scenes: Scene[] } {
  const r = rng(hashStr(input.topic) ^ seed);
  const F = FORMATS[input.format] ?? FORMATS.reklam; const tone = TONES[input.tone] ?? TONES.Epik;
  const T = input.topic.trim() || 'konu';
  const aud = input.audience || 'genç yetişkinler';
  const logline = pick(r, [
    `${aud} için ${T} etrafında kurulan, ${input.tone.toLowerCase()} bir ${F.label.toLowerCase()}: ilk saniyede yakala, sonunda akılda kal.`,
    `${T} — sıradan bir anın, ${input.tone.toLowerCase()} bir dönüşüme uğradığı ${input.duration} saniyelik hikâye.`,
    `Herkesin bildiğini sandığı ${T}, hiç görmedikleri bir açıdan: ${input.tone.toLowerCase()} ve unutulmaz.`,
  ]);
  const hooks = [
    `"${T} hakkında sana söylenmeyen tek şey…"`,
    `Hareketin ortasından giriş: ${T} anında, sesli darbe ile`,
    `Soru kartı: "Ya ${T} her şeyi değiştirseydi?"`,
    `3 saniyelik önce/sonra karşılaştırması`,
    `POV: ${aud} ilk kez ${T} ile karşılaşıyor`,
  ].sort(() => r() - 0.5).slice(0, 3);

  const total = Math.max(5, input.duration);
  const scenes: Scene[] = F.beats.map((b, bi) => {
    const sceneDur = total * b.frac;
    const nShots = Math.max(1, Math.round(sceneDur / (input.tone === 'Enerjik' || input.format === 'shorts' ? 1.6 : 3.2)));
    const shots: Shot[] = Array.from({ length: Math.min(nShots, 6) }, (_, si) => {
      const size = bi === 0 && si === 0 ? pick(r, ['Detay (ECU)', 'Yakın (CU)', 'Çok geniş (EWS)']) : pick(r, SIZES);
      const s: Shot = {
        id: uid('s_'), desc: pick(r, b.desc).replaceAll('{T}', T) + (si > 0 ? ` (${pick(r, ['ters açı', 'detay', 'tepki', 'ara plan', 'geçiş planı'])})` : ''),
        size, move: pick(r, tone.moves), lens: size.includes('Detay') ? '100mm makro' : pick(r, LENSES), light: pick(r, tone.light),
        duration: Math.round((sceneDur / Math.min(nShots, 6)) * 10) / 10,
        vo: si === 0 ? voLine(b.name, T, r) : '', onscreen: si === 0 && /Kanca|CTA|Başlık|Fayda|Şaşırtıcı/.test(b.name) ? onscreenLine(b.name, T) : '',
        sfx: si === 0 ? (SFX_FOR[b.name] ?? '') : '', prompt: '', negative: '',
      };
      return s;
    });
    return { id: uid('sc_'), title: b.name, beat: b.name, location: pick(r, ['Stüdyo', 'Şehir sokağı', 'İç mekân – ev', 'Doğa', 'Ofis', 'Gece çatı', 'Sonsuz fon (cyclorama)']), time: pick(r, ['Gündüz', 'Altın saat', 'Gece', 'Mavi saat']), mood: input.tone, shots };
  });
  const idea: Idea = {
    ...input, logline, hooks, cta: pick(r, ['Şimdi keşfet', 'Takip et, devamı geliyor', 'Linke tıkla', 'Hemen dene']),
    style: { palette: tone.palette, look: tone.look, music: tone.music, bpm: tone.bpm, font: tone.font },
  };
  scenes.forEach(sc => sc.shots.forEach(s => Object.assign(s, buildPrompt(s, idea))));
  return { idea, scenes };
}

function voLine(beat: string, T: string, r: () => number) {
  const L: Record<string, string[]> = {
    'Kanca': [`Bunu hiç böyle düşünmedin: ${T}.`, `Bir saniye dur. ${T}.`],
    'Kanca (0-2sn)': [`${T} hakkında herkes yanılıyor.`, `Bunu bilen çok az kişi var.`],
    'Sorun': ['Hepimiz yaşadık. Her gün, aynı dert.'], 'Çözüm': [`İşte ${T}.`], 'Fayda / Demo': ['Daha hızlı. Daha kolay. Daha iyi.'],
    'Çağrı (CTA)': ['Şimdi sıra sende.'], 'Soğuk açılış': [`Peki ${T} gerçekten nasıl başladı?`], 'Bağlam': ['Her şey yıllar önce başladı.'],
    'Şaşırtıcı gerçek': ['Ama asıl şaşırtıcı olan şu…'], 'Sonuç': ['Ve bugün hâlâ etkisini görüyoruz.'], 'Payoff': ['Ve işte gerçek cevap.'],
    'Döngü / CTA': ['Devamı için takip et.'], 'Açılış imajı': [''], 'Başlık': [''], 'Hero shot': [`${T}. Yeni nesil.`],
  };
  return pick(r, L[beat] ?? ['']);
}
function onscreenLine(beat: string, T: string) {
  if (beat.startsWith('Kanca')) return T.toUpperCase();
  if (beat.includes('CTA') || beat === 'Başlık') return T;
  if (beat.includes('Fayda')) return 'HIZLI • KOLAY • GÜÇLÜ';
  return '';
}

/** LLM için talimat — yerel model (Ollama) aynı JSON şemasını döndürsün */
export function llmPrompt(input: Pick<Idea, 'topic' | 'format' | 'tone' | 'audience' | 'duration' | 'aspect' | 'notes'>) {
  const F = FORMATS[input.format] ?? FORMATS.reklam;
  return `Sen ödüllü bir yaratıcı yönetmen ve senaristsin. Türkçe yaz. Aşağıdaki brief için JSON üret.
Brief: konu="${input.topic}", format="${F.label}", ton="${input.tone}", hedef kitle="${input.audience}", süre=${input.duration}sn, en-boy=${input.aspect}. Notlar: ${input.notes || '-'}
Yapı (beat'ler): ${F.beats.map(b => b.name).join(' → ')}
Şema: {"logline": string, "hooks": [string,string,string], "cta": string, "scenes": [{"title": string, "location": string, "time": string, "shots": [{"desc": string, "size": one of ${JSON.stringify(SIZES)}, "move": string, "lens": string, "light": string, "duration": number, "vo": string, "onscreen": string, "prompt_en": string}]}]}
Toplam shot süreleri ${input.duration} saniyeye eşit olsun. "prompt_en" alanı video üretim modeli için İngilizce, sinematik ve detaylı olsun. Sadece JSON döndür.`;
}

export const ALL_SIZES = SIZES; export const ALL_LENSES = LENSES;
