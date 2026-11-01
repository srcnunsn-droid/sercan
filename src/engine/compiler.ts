// Deterministic prompt compiler. Same scene graph in -> same prompt out.
// Claude may enrich or critique the result, but every prompt is produced without it.
import { CATALOG_BY_ID, LIGHT_BY_ID, MODEL_CARDS, TEXTURE_LINE, TEXTURE_LINE_TR, type ModelCard } from '../content';
import type { Character, Dir, LightRig, Part, Project, CameraRig, Location } from '../model/types';

export interface Boxes { scene: string; camera: string; characters: string; light: string; environment: string }
export interface Compiled { en: string; tr: string; boxesEn: Boxes; boxesTr: Boxes; refs: string[]; legendTr: string[] }

export const DIR_EN: Record<Dir, string> = {
  front: 'the front', left: 'the left', right: 'the right', back: 'behind', top: 'directly above', bottom: 'below',
  'front-left': 'the front left', 'front-right': 'the front right', 'back-left': 'behind on the left', 'back-right': 'behind on the right',
};
export const DIR_TR: Record<Dir, string> = {
  front: 'önden', left: 'soldan', right: 'sağdan', back: 'arkadan', top: 'tam yukarıdan', bottom: 'aşağıdan',
  'front-left': 'sol önden', 'front-right': 'sağ önden', 'back-left': 'sol arkadan', 'back-right': 'sağ arkadan',
};
const OPPOSITE_EN: Record<Dir, string> = {
  front: 'behind the subject', left: 'the right', right: 'the left', back: 'toward the camera', top: 'straight down under the subject', bottom: 'upward onto the wall behind',
  'front-left': 'the back right', 'front-right': 'the back left', 'back-left': 'the front right', 'back-right': 'the front left',
};
const OPPOSITE_TR: Record<Dir, string> = {
  front: 'karakterin arkasına', left: 'sağa', right: 'sola', back: 'kameraya doğru', top: 'tam karakterin altına', bottom: 'arkadaki duvara yukarı doğru',
  'front-left': 'sağ arkaya', 'front-right': 'sol arkaya', 'back-left': 'sağ öne', 'back-right': 'sol öne',
};
const TIME_EN: Record<Location['timeOfDay'], string> = { dawn: 'at dawn', day: 'in daytime', 'golden-hour': 'at golden hour', dusk: 'at dusk', night: 'at night' };
const TIME_TR: Record<Location['timeOfDay'], string> = { dawn: 'şafakta', day: 'gündüz', 'golden-hour': 'altın saatte', dusk: 'alacakaranlıkta', night: 'gece' };
const WEATHER_EN: Record<Location['weather'], string> = { clear: 'clear sky', overcast: 'overcast sky', rain: 'light rain, wet reflective surfaces', snow: 'falling snow', fog: 'low fog' };
const WEATHER_TR: Record<Location['weather'], string> = { clear: 'açık gökyüzü', overcast: 'kapalı gökyüzü', rain: 'hafif yağmur, ıslak parlak yüzeyler', snow: 'yağan kar', fog: 'alçak sis' };
const ATMO_EN = { none: '', haze: 'light atmospheric haze', fog: 'thick fog catching the light', smoke: 'drifting smoke', dust: 'dust particles in the air' } as const;
const ATMO_TR = { none: '', haze: 'hafif pus', fog: 'ışığı yakalayan yoğun sis', smoke: 'süzülen duman', dust: 'havada toz parçacıkları' } as const;
const POSE_EN: Record<string, string> = { standing: 'standing', sitting: 'sitting', reaching: 'reaching out a hand', hugging: 'embracing', running: 'running', recoiling: 'stepping back' };
const POSE_TR: Record<string, string> = { standing: 'ayakta', sitting: 'oturuyor', reaching: 'elini uzatıyor', hugging: 'sarılıyor', running: 'koşuyor', recoiling: 'geri çekiliyor' };

export const card = (id: string): ModelCard => MODEL_CARDS.find((c) => c.id === id) ?? MODEL_CARDS[0];

const join = (xs: (string | undefined | false | null)[], sep = ', ') =>
  xs.filter(Boolean).map((x) => (sep.trim() === '.' ? String(x).replace(/[.\s]+$/, '') : String(x))).join(sep);
const sentence = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/[.\s]+$/, '') + '.' : '');

export function cameraText(c: CameraRig, cardId = 'universal'): { en: string; tr: string } {
  const pick = (id?: string) => (id ? CATALOG_BY_ID[id] : undefined);
  const parts = [pick(c.framing), pick(c.perspective), pick(c.angle)].filter(Boolean);
  const mv = pick(c.motion);
  const variant = (e?: { variants: Record<string, string>; promptEn: string }) => {
    if (!e) return '';
    const fam = cardId.startsWith('seedance') ? 'seedance' : cardId;
    return e.variants[fam] ?? e.promptEn;
  };
  const dof = c.fStop <= 2.8 ? 'shallow depth of field' : c.fStop >= 8 ? 'deep focus' : '';
  const dofTr = c.fStop <= 2.8 ? 'sığ alan derinliği' : c.fStop >= 8 ? 'derin odak' : '';
  return {
    en: join([...parts.map((e) => variant(e!)), c.dutch ? 'dutch angle tilted 20 degrees' : '', `shot on a ${c.lensMm}mm lens at f/${c.fStop}`, dof, mv ? variant(mv) : '']),
    tr: join([...parts.map((e) => e!.promptTr), c.dutch ? '20 derece yatık Dutch açı' : '', `${c.lensMm} mm lens, f/${c.fStop}`, dofTr, mv?.promptTr]),
  };
}

export function lightText(l: LightRig): { en: string; tr: string } {
  const src = LIGHT_BY_ID[l.source];
  const hardEn = l.hardness === 'sert' ? 'hard' : 'soft';
  const hardTr = l.hardness === 'sert' ? 'sert' : 'yumuşak';
  const edgeEn = l.hardness === 'sert' ? 'crisp-edged' : 'soft-edged';
  const edgeTr = l.hardness === 'sert' ? 'keskin kenarlı' : 'silik kenarlı';
  const en = [
    `${hardEn} ${src?.en ?? l.source} from ${DIR_EN[l.direction]}, ${src?.colorEn ?? ''} around ${l.kelvin}K, ${edgeEn} shadows falling to ${OPPOSITE_EN[l.direction]}`,
  ];
  const tr = [
    `${DIR_TR[l.direction]} gelen ${hardTr} ${src?.tr.toLocaleLowerCase('tr') ?? l.source} ışığı, ${src?.colorTr ?? ''} (~${l.kelvin}K), ${edgeTr} gölgeler ${OPPOSITE_TR[l.direction]} düşüyor`,
  ];
  if (l.secondary) {
    const s2 = LIGHT_BY_ID[l.secondary.source];
    en.push(`secondary ${s2?.en ?? l.secondary.source} from ${DIR_EN[l.secondary.direction]} adding a ${s2?.colorEn ?? ''} edge around ${l.secondary.kelvin}K`);
    tr.push(`ikinci ışık: ${DIR_TR[l.secondary.direction]} ${s2?.tr.toLocaleLowerCase('tr') ?? ''}, ${s2?.colorTr ?? ''} kenar (~${l.secondary.kelvin}K)`);
  }
  if (l.atmosphere && l.atmosphere !== 'none') { en.push(ATMO_EN[l.atmosphere]); tr.push(ATMO_TR[l.atmosphere]); }
  return { en: en.join('; '), tr: tr.join('; ') };
}

/** Reference order is fixed: character sheets first (@image-1, @image-2...), then the location. */
/** With a part, numbering is scoped to the images that part actually uploads (each generation starts at @image-1). */
export function referenceMap(project: Project, part?: Part): { characters: Record<string, string>; location?: string; list: string[]; legendTr: string[] } {
  const characters: Record<string, string> = {};
  const legendTr: string[] = [];
  let n = 1;
  const present = part ? new Set(part.characters.map((c) => c.characterId)) : null;
  for (const c of project.characters) {
    if (present && !present.has(c.id)) continue;
    characters[c.id] = `@image-${n}`;
    legendTr.push(`@image-${n++} = ${c.name || 'karakter'} sheet`);
  }
  const loc = project.locations.find((l) => l.id === project.locationId);
  const location = loc ? `@image-${n}` : undefined;
  if (loc) legendTr.push(`@image-${n++} = ${loc.name} mekân görseli`);
  return { characters, location, legendTr, list: Array.from({ length: n - 1 }, (_, i) => `@image-${i + 1}`) };
}

function characterText(project: Project, part: Part, refs: Record<string, string>) {
  const byId = Object.fromEntries(project.characters.map((c) => [c.id, c])) as Record<string, Character>;
  const en: string[] = []; const tr: string[] = [];
  // keep @image-N in ascending order regardless of who acts first in the part
  const order = (id: string) => Number((refs[id] ?? '@image-999').split('-')[1]);
  const sorted = [...part.characters].sort((a, b) => order(a.characterId) - order(b.characterId));
  for (const cr of sorted) {
    const c = byId[cr.characterId];
    if (!c) continue;
    const ref = refs[c.id] ? `${refs[c.id]} ` : '';
    en.push(join([`${ref}${c.name}`, c.descriptionEn, c.wardrobe && `wearing ${c.wardrobe}`, POSE_EN[cr.pose] ?? cr.pose, cr.action]));
    tr.push(join([`${ref}${c.name}`, c.descriptionTr, c.wardrobe && `üzerinde ${c.wardrobe}`, POSE_TR[cr.pose] ?? cr.pose, cr.action]));
  }
  return { en: en.join('; '), tr: tr.join('; ') };
}

function environmentText(project: Project, ref?: string) {
  const loc = project.locations.find((l) => l.id === project.locationId);
  if (!loc) return { en: '', tr: '' };
  return {
    en: join([`${ref ? ref + ' ' : ''}${loc.descriptionEn}`, TIME_EN[loc.timeOfDay], WEATHER_EN[loc.weather]]),
    tr: join([`${ref ? ref + ' ' : ''}${loc.name}`, TIME_TR[loc.timeOfDay], WEATHER_TR[loc.weather]]),
  };
}

function dialogueText(part: Part, c: ModelCard) {
  if (!part.dialogue.length) return { en: '', tr: '' };
  const fmt = (sec: number) => `0:${String(Math.max(0, Math.round(sec))).padStart(2, '0')}`;
  return {
    en: part.dialogue.map((d) => `at ${fmt(d.atSec)} ${d.speaker} says: "${d.textEn || d.textTr}"`).join('; ') + (c.kind === 'video' ? '' : ''),
    tr: part.dialogue.map((d) => `${fmt(d.atSec)} ${d.speaker}: "${d.textTr}"`).join('; '),
  };
}

/** Compile one 10-second part into the 5-box prompt for a target model card. */
export function compilePart(project: Project, part: Part, cardId = 'universal'): Compiled {
  const c = card(cardId);
  const refs = referenceMap(project, part);
  const cam = cameraText(part.camera, cardId);
  const light = lightText(part.light);
  const chars = characterText(project, part, refs.characters);
  const env = environmentText(project, refs.location);
  const dlg = c.kind !== 'image' ? dialogueText(part, c) : { en: '', tr: '' };
  const sound = c.kind !== 'image' && part.sound ? { en: `ambient sound: ${part.sound}`, tr: `ortam sesi: ${part.sound}` } : { en: '', tr: '' };
  const sec = c.partSec ?? 10;

  const boxesEn: Boxes = {
    scene: sentence(join([c.kind !== 'image' ? `${sec}-second shot` : '', part.sceneEn || part.scene, dlg.en, sound.en], '. ')),
    camera: sentence(cam.en),
    characters: sentence(chars.en),
    light: sentence(light.en),
    environment: sentence(env.en),
  };
  const boxesTr: Boxes = {
    scene: sentence(join([c.kind !== 'image' ? `${sec} saniyelik plan` : '', part.scene, dlg.tr, sound.tr], '. ')),
    camera: sentence(cam.tr),
    characters: sentence(chars.tr),
    light: sentence(light.tr),
    environment: sentence(env.tr),
  };
  return {
    en: assemble(boxesEn, c, project.aspect, 'en'),
    tr: assemble(boxesTr, c, project.aspect, 'tr'),
    boxesEn, boxesTr, refs: refs.list, legendTr: refs.legendTr,
  };
}

export function assemble(b: Boxes, c: ModelCard, aspect: string, lang: 'en' | 'tr'): string {
  const L = lang === 'en'
    ? { scene: 'Scene', camera: 'Camera', characters: 'Characters', light: 'Light', environment: 'Environment' }
    : { scene: 'Sahne', camera: 'Kamera', characters: 'Karakterler', light: 'Işık', environment: 'Mekân' };
  const lines = (Object.keys(L) as (keyof Boxes)[]).filter((k) => b[k]).map((k) => `${L[k]}: ${b[k]}`);
  if (c.id === 'midjourney' && lang === 'en') {
    return `${Object.values(b).filter(Boolean).join(' ')} ${TEXTURE_LINE} --ar ${aspect.replace('2.39:1', '239:100')} --style raw`;
  }
  lines.push(lang === 'en' ? TEXTURE_LINE : TEXTURE_LINE_TR);
  return lines.join('\n');
}

/** Single character sheet prompt (one prompt per character, no multi-step chain). Neutral grey, shadowless. */
export function compileCharacterSheet(ch: Character): { en: string; tr: string } {
  return {
    en: [
      `Character reference sheet of ${ch.name}: ${ch.descriptionEn}, wearing ${ch.wardrobe}.`,
      'Three panels side by side: full-body front view, full-body side profile, close-up face portrait.',
      'Flat mid-grey seamless background, even shadowless light, neutral expression, same identity in every panel.',
      TEXTURE_LINE,
    ].join('\n'),
    tr: [
      `${ch.name} karakter sayfası: ${ch.descriptionTr}, üzerinde ${ch.wardrobe}.`,
      'Yan yana üç panel: boydan önden, boydan profil, yakın yüz portresi.',
      'Düz orta gri zemin, gölgesiz eşit ışık, nötr ifade, her panelde aynı kimlik.',
      TEXTURE_LINE_TR,
    ].join('\n'),
  };
}

/** Location plate: no people. Time and weather chosen here stay fixed for all three parts. */
export function compileLocation(loc: Location): { en: string; tr: string } {
  return {
    en: [`Empty location plate, no people: ${loc.descriptionEn}, ${TIME_EN[loc.timeOfDay]}, ${WEATHER_EN[loc.weather]}.`, 'Wide eye-level view, natural light from the visible sky.', TEXTURE_LINE].join('\n'),
    tr: [`İnsansız mekân görseli: ${loc.name}, ${TIME_TR[loc.timeOfDay]}, ${WEATHER_TR[loc.weather]}.`, 'Göz hizasında geniş görünüm, görünen gökyüzünden doğal ışık.', TEXTURE_LINE_TR].join('\n'),
  };
}
