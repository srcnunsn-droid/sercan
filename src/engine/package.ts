// "Sahne paketi": everything needed to produce the scene, in production order, as one Markdown file.
import { MODEL_CARDS, TEMPLATES } from '../content';
import type { Project } from '../model/types';
import { compileCharacterSheet, compileLocation, compilePart } from './compiler';
import { runRules } from './rules';
import { countWords } from '../lib/text';

export interface PackageOpts { imageCardId: string; videoCardId: string; prices: Record<string, number>; defaultPrice: { image: number; video: number } }

export function estimateCredits(p: Project, o: PackageOpts) {
  const img = o.prices[o.imageCardId] ?? o.defaultPrice.image;
  const vid = o.prices[o.videoCardId] ?? o.defaultPrice.video;
  const images = p.characters.length + (p.locationId ? 1 : 0) + p.parts.length;
  const videos = p.parts.length;
  return { images, videos, imageCredits: images * img, videoCredits: videos * vid, total: images * img + videos * vid };
}

export function buildPackage(p: Project, o: PackageOpts): string {
  const img = MODEL_CARDS.find((c) => c.id === o.imageCardId) ?? MODEL_CARDS[0];
  const vid = MODEL_CARDS.find((c) => c.id === o.videoCardId) ?? MODEL_CARDS[0];
  const tpl = TEMPLATES.find((t) => t.id === p.template);
  const loc = p.locations.find((l) => l.id === p.locationId);
  const est = estimateCredits(p, o);
  const fence = (s: string) => '```text\n' + s + '\n```';
  const out: string[] = [];
  out.push(`# ${p.title}`, '', `Şablon: ${tpl?.tr ?? p.template} · Oran: ${p.aspect} · Görsel modeli: ${img.name} · Video modeli: ${vid.name}`, '');
  out.push('> Sıra: önce görseller (1–3), görselleri onayla, sonra video (4). Model kartları “doğrulanmadı” etiketli olabilir.', '');

  out.push('## 1. Karakter sheet’leri', '');
  p.characters.forEach((c, i) => {
    const s = compileCharacterSheet(c);
    out.push(`### @image-${i + 1} · ${c.name}`, fence(s.en), '', `Türkçesi: ${s.tr.replace(/\n/g, ' ')}`, '');
  });
  if (loc) {
    const l = compileLocation(loc);
    out.push('## 2. Mekân', '', `### ${loc.name}`, fence(l.en), '', `Türkçesi: ${l.tr.replace(/\n/g, ' ')}`, '');
  }
  out.push(`## 3. Başlangıç kareleri (${img.name})`, '');
  p.parts.forEach((part, i) => {
    const c = compilePart(p, part, img.id);
    out.push(`### Parça ${i + 1} · ${tpl?.beatLabelsTr?.[i] ?? part.beat}`, `Yükle: ${c.legendTr.join(' · ') || '—'}`, fence(c.en), '', `Türkçesi: ${c.tr.replace(/\n/g, ' ')}`, '');
  });
  out.push(`## 4. Video promptları (${vid.name}, ${vid.partSec ?? 10} sn)`, '', 'Süreklilik: her parçanın son karesi bir sonrakinin başlangıç karesidir.', '');
  p.parts.forEach((part, i) => {
    const c = compilePart(p, part, vid.id);
    out.push(`### Parça ${i + 1}`, `Yükle: ${c.legendTr.join(' · ') || '—'}`, fence(c.en), '', `Türkçesi: ${c.tr.replace(/\n/g, ' ')}`, '');
  });
  const lines = p.parts.flatMap((part, i) => part.dialogue.map((d) => `| ${i + 1} | 0:${String(d.atSec).padStart(2, '0')} | ${d.speaker} | ${d.textTr} | ${d.textEn ?? ''} | ${countWords(d.textEn || d.textTr)} |`));
  if (lines.length) out.push('## Replikler', '', '| Parça | Zaman | Konuşan | Türkçe | English | Kelime |', '|---|---|---|---|---|---|', ...lines, '');
  const rules = runRules({ project: p, cardId: vid.id });
  out.push('## Kontrol listesi', '');
  out.push(`- [ ] ${p.characters.length} karakter sheet’i üretildi ve aynı yüz tutarlı`);
  if (loc) out.push(`- [ ] Mekân görseli üretildi (${loc.timeOfDay}, ${loc.weather}; üç parçada sabit)`);
  out.push('- [ ] 3 başlangıç karesi onaylandı', '- [ ] Video: parça başına tek kamera hareketi', '- [ ] Replikler süreye sığıyor');
  if (rules.length) { out.push('', '**Çelişki bekçisi:**'); rules.forEach((r) => out.push(`- ${r.severity === 'error' ? 'HATA' : r.severity === 'warn' ? 'Uyarı' : 'İpucu'}: ${r.messageTr} (${r.fixTr})`)); }
  out.push('', '## Kredi tahmini', '', `${est.images} görsel = ${est.imageCredits} kredi · ${est.videos} video = ${est.videoCredits} kredi · **toplam ${est.total} kredi** (fiyat tablosu Ayarlar’dan düzenlenir; denemeler hariç)`, '');
  return out.join('\n');
}
