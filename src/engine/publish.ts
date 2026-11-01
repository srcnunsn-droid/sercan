// Yayın paketi: hook, caption, hashtags, SRT subtitles, thumbnail prompt, edit list, 9:16 safe zones.
import { TEMPLATES, TEXTURE_LINE } from '../content';
import type { Project } from '../model/types';
import { compilePart } from './compiler';
import { countWords, lower } from '../lib/text';

const WPS = 2.5; // spoken words per second

export function srtTime(sec: number): string {
  const ms = Math.round(sec * 1000);
  const h = Math.floor(ms / 3_600_000), m = Math.floor((ms % 3_600_000) / 60_000), s = Math.floor((ms % 60_000) / 1000), r = ms % 1000;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(r).padStart(3, '0')}`;
}

export function buildSrt(p: Project, partSec: number, lang: 'tr' | 'en' = 'tr'): string {
  const cues: { start: number; end: number; text: string }[] = [];
  p.parts.forEach((part, i) => {
    const partEnd = (i + 1) * partSec;
    for (const d of part.dialogue) {
      const text = lang === 'en' ? d.textEn || d.textTr : d.textTr;
      if (!text.trim()) continue;
      const start = i * partSec + d.atSec;
      const end = Math.min(partEnd, start + Math.max(1.2, countWords(text) / WPS + 0.4));
      cues.push({ start, end, text });
    }
  });
  return cues.map((c, n) => `${n + 1}\n${srtTime(c.start)} --> ${srtTime(c.end)}\n${c.text}\n`).join('\n');
}

export function hook(p: Project): string {
  const first = (p.parts[0]?.scene || p.parts[0]?.sceneEn || p.title).split(/[.!?]/)[0].trim();
  return `İlk 3 saniye: ${first}.`;
}

const TEMPLATE_TAGS: Record<string, string[]> = {
  'emotional-dialogue': ['#duygusal', '#veda', '#kısafilm'], 'epic-battle': ['#epik', '#savaş', '#fantastik'],
  'ad-film': ['#reklam', '#ürün', '#marka'], comedy: ['#komedi', '#parodi', '#mizah'], 'short-drama': ['#shortdrama', '#dizi', '#devamıgelecek'],
  'stadium-reveal': ['#futbol', '#stadyum', '#kutlama'], 'motion-transfer': ['#motiontransfer', '#genjutsu', '#dans'], 'animation-episode': ['#animasyon', '#3d', '#dizi'],
};
const STOP = new Set(['ve', 'ile', 'bir', 'bu', 'şu', 'da', 'de', 'örnek', 'the', 'a', 'of', 'in', 'at']);

export function hashtags(p: Project): string[] {
  const words = lower(p.title).replace(/\(.*?\)/g, '').split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 2 && !STOP.has(w)).map((w) => '#' + w);
  const all = [...words, ...(TEMPLATE_TAGS[p.template] ?? []), '#yapayzeka', '#aivideo', '#sinematik', '#higgsfield'];
  return [...new Set(all)].slice(0, 12);
}

export function caption(p: Project): string {
  const firstLine = p.parts.flatMap((x) => x.dialogue)[0]?.textTr;
  return [firstLine ? `“${firstLine}”` : p.title, 'Sonunu tahmin et 👇', hashtags(p).slice(0, 6).join(' ')].join('\n');
}

/** Image prompt for the cover, built from the climax part: one clear face, contrast, empty title space, no text in the image. */
export function thumbnailPrompt(p: Project, cardId: string): { en: string; tr: string } {
  const climax = structuredClone(p.parts[p.parts.length - 1]);
  climax.camera = { ...climax.camera, framing: 'size.cu', perspective: undefined, motion: 'move.static', lensMm: 85, fStop: 1.8 };
  climax.characters = climax.characters.slice(0, 1);
  climax.dialogue = [];
  const c = compilePart(p, climax, cardId);
  const extraEn = 'Thumbnail composition: one clear face filling the lower two thirds, strong warm-cold contrast, clean empty space in the top third for a title added later in editing, no text in the image.';
  const extraTr = 'Kapak kompozisyonu: alt üçte ikiyi dolduran tek net yüz, güçlü sıcak-soğuk karşıtlık, üst üçte birde sonradan eklenecek başlık için boşluk, görüntüde yazı yok.';
  const inject = (s: string, extra: string, line: string) => (s.includes(line) ? s.replace(line, `${extra}\n${line}`) : `${s}\n${extra}`);
  return { en: inject(c.en, extraEn, TEXTURE_LINE), tr: inject(c.tr, extraTr, 'Keskinleştirme yok, renk taşması yok, doğal fotoğraf dokusu.') };
}

export function editList(p: Project, partSec: number): string[] {
  const tpl = TEMPLATES.find((t) => t.id === p.template);
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const rows = p.parts.map((part, i) => `${i + 1}. Parça ${i + 1} (${tpl?.beatLabelsTr?.[i] ?? part.beat}) · ${fmt(i * partSec)}–${fmt((i + 1) * partSec)} · ${i === 0 ? 'açılış' : 'düz kesme (son kare = başlangıç karesi)'}`);
  rows.push(`Toplam: ${fmt(p.parts.length * partSec)} · altyazı dosyası: .srt · ses: ortam sesi + replikler`);
  return rows;
}

/** Safe zones for vertical feeds (fractions of the frame); app UI covers these areas. */
export const SAFE_916 = { top: 0.1, bottom: 0.2, right: 0.15, left: 0.05 };
export const POST_TIMES_TR = ['Hafta içi 19:00–22:00', 'Cumartesi 12:00–14:00', 'Pazar 20:00–23:00'];
