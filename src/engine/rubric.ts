// Deterministic rubric for a prompt the learner wrote. Claude may add reasons; the score never depends on it.
import { runRules } from './rules';
import { lower } from '../lib/text';
import { CATALOG, LIGHT_SOURCES, TEXTURE_LINE, TEXTURE_LINE_TR } from '../content';

export interface Rubric {
  score: number;
  boxes: { scene: boolean; camera: boolean; characters: boolean; light: boolean; environment: boolean };
  light5: { source: boolean; direction: boolean; color: boolean; hardness: boolean; shadow: boolean };
  invisible: string[];
  contradictions: string[];
  texture: boolean;
  tipsTr: string[];
}

const has = (t: string, re: RegExp) => re.test(t);

export function scorePrompt(text: string): Rubric {
  const t = lower(text);
  const camWords = CATALOG.filter((e) => ['angle', 'size', 'lens', 'movement', 'perspective'].includes(e.category)).flatMap((e) => [lower(e.en), lower(e.tr)]);
  const boxes = {
    scene: has(t, /(scene|sahne)\s*:/u) || t.split(/\s+/).length >= 6,
    camera: has(t, /(camera|kamera)\s*:/u) || camWords.some((w) => w.length > 3 && t.includes(w)) || /\d{2,3}\s?mm/u.test(t),
    characters: has(t, /(characters?|karakter\p{L}*)\s*:/u) || /@image-\d|\b(woman|man|girl|boy|kadın|adam|kız|çocuk|kral|anne)\b/u.test(t),
    light: has(t, /(light|ışık)\s*:/u) || /(light|lamp|sun|candle|ışı|lamba|güneş|mum)/u.test(t),
    environment: has(t, /(environment|mekân|mekan|ortam)\s*:/u) || /(platform|street|room|forest|bridge|peron|sokak|oda|orman|köprü|salon|station|istasyon)/u.test(t),
  };
  const light5 = {
    source: LIGHT_SOURCES.some((s) => t.includes(lower(s.en.split(' ').pop()!)) || t.includes(lower(s.tr))) || /(lamp|candle|window|sun|neon|screen|fire|lamba|mum|pencere|güneş|ekran|ateş)/u.test(t),
    direction: /(from the (left|right|front|back|above|below)|from above|from below|backlight|side light|soldan|sağdan|önden|arkadan|yukarıdan|aşağıdan|yandan)/u.test(t),
    color: /(\d{4}\s?k\b|warm|cool|cold|amber|golden|blue|orange|sıcak|soğuk|kehribar|altın|mavi|turuncu)/u.test(t),
    hardness: /(hard|soft|diffused|harsh|sert|yumuşak)/u.test(t),
    shadow: /(shadow|gölge)/u.test(t),
  };
  const results = runRules({ text });
  const invisible = results.filter((r) => r.ruleId === 'char.invisible-word').map((r) => r.messageTr);
  const contradictions = results.filter((r) => r.severity === 'error' && r.ruleId !== 'text.texture-line').map((r) => r.messageTr);
  const body = text.trim();
  const texture = body.endsWith(TEXTURE_LINE) || body.endsWith(TEXTURE_LINE_TR);

  const boxPts = Object.values(boxes).filter(Boolean).length * 8;      // 40
  const lightPts = Object.values(light5).filter(Boolean).length * 6;   // 30
  const cleanPts = Math.max(0, 20 - invisible.length * 5 - contradictions.length * 8); // 20
  const texPts = texture ? 10 : 0;                                      // 10
  const score = Math.max(0, Math.min(100, boxPts + lightPts + cleanPts + texPts));

  const tipsTr: string[] = [];
  const BOX_TR = { scene: 'Sahne', camera: 'Kamera', characters: 'Karakterler', light: 'Işık', environment: 'Mekân' } as const;
  const L5_TR = { source: 'kaynak', direction: 'yön', color: 'renk', hardness: 'sertlik', shadow: 'gölge' } as const;
  for (const [k, v] of Object.entries(boxes)) if (!v) tipsTr.push(`${BOX_TR[k as keyof typeof BOX_TR]} kutusu boş.`);
  const missing = Object.entries(light5).filter(([, v]) => !v).map(([k]) => L5_TR[k as keyof typeof L5_TR]);
  if (missing.length) tipsTr.push(`Işığın eksik parçaları: ${missing.join(', ')}.`);
  tipsTr.push(...invisible, ...contradictions);
  if (!texture) tipsTr.push('Sona doku satırını ekle.');
  return { score, boxes, light5, invisible, contradictions, texture, tipsTr };
}
