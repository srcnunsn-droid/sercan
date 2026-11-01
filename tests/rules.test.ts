import { describe, expect, it } from 'vitest';
import { runRules, RULE_IDS, type RuleCtx } from '../src/engine/rules';
import { sampleProject } from '../src/model/factory';
import { TEXTURE_LINE } from '../src/content';
import type { Project } from '../src/model/types';

const T = (s: string) => `${s}\n${TEXTURE_LINE}`;
const proj = (mut: (p: Project) => void): RuleCtx => { const p = sampleProject(); mut(p); return { project: p }; };
const fires = (id: string, ctx: RuleCtx) => runRules(ctx, [id]).length > 0;

// Each rule: at least 3 cases that must fire and 3 that must not.
const CASES: Record<string, { pos: RuleCtx[]; neg: RuleCtx[] }> = {
  'char.invisible-word': {
    pos: [{ text: 'An epic battle on the bridge' }, { text: 'Gizemli bir adam köprüde' }, { text: 'Kadın çok hüzünlüydü' }],
    neg: [{ text: 'Face half in shadow, single hard side light' }, { text: 'Eyes looking down, lower lip trembling' }, { text: 'Peronda iki kişi duruyor' }],
  },
  'text.texture-line': {
    pos: [{ text: 'Scene: a man on a bridge.' }, { text: `${TEXTURE_LINE}\nScene: added after` }, { text: 'Camera: low angle' }],
    neg: [{ text: T('Scene: a man on a bridge.') }, { text: `A cat on a roof. ${TEXTURE_LINE} --ar 9:16 --style raw` }, { text: 'Sahne: peron.\nKeskinleştirme yok, renk taşması yok, doğal fotoğraf dokusu.' }],
  },
  'ref.order': {
    pos: [{ text: '@image-2 woman, @image-1 man' }, { text: '@image-1 and @image-3' }, { text: '@image-1 @image-2 @image-3 @image-4 @image-5', cardId: 'flow-omni' }],
    neg: [{ text: '@image-1 woman, @image-2 man, @image-3 platform' }, { text: 'no references here' }, { text: '@image-1 woman and again @image-1' }],
  },
  'dialogue.logic': {
    pos: [{ text: 'Evlat edindiğim üvey oğlum' }, { text: 'My adopted stepson came home' }, { text: 'İlk kez burada, yine geldi' }],
    neg: [{ text: 'Evlat edindiğim oğlum' }, { text: 'My stepson came home' }, { text: 'İlk kez burada' }],
  },
  'safety.ip': {
    pos: [{ text: 'A man in Nike shoes' }, { text: 'Spider-Man swinging across the city' }, { text: 'Taylor Swift on stage' }],
    neg: [{ text: 'A man in white running shoes' }, { text: 'A masked hero swinging across the city' }, { text: 'A singer on stage' }],
  },
  'light.source-direction': {
    pos: [{ text: 'A ceiling lamp lights her chin from below' }, { text: 'Tavan lambası yüzü aşağıdan aydınlatıyor' }, proj((p) => { p.parts[0].light.source = 'ceiling-lamp'; p.parts[0].light.direction = 'bottom'; })],
    neg: [{ text: 'A ceiling lamp lights her hair from directly above' }, { text: 'Phone screen glow from below' }, proj(() => {})],
  },
  'light.shadow-side': {
    pos: [{ text: 'Window light from the left, shadow falls to the left' }, { text: 'Lamp light from the right, long shadows to the right' }, { text: 'Işık soldan geliyor, gölge sola düşüyor' }],
    neg: [{ text: 'Window light from the left, shadow falls to the right' }, { text: 'Işık soldan geliyor, gölge sağa düşüyor' }, { text: 'Soft light, no visible shadow' }],
  },
  'light.hardness-edge': {
    pos: [{ text: 'Soft overcast light with razor-sharp shadows' }, { text: 'Hard light from the noon sun, soft blurry shadows' }, { text: 'Yumuşak ışık, keskin gölgeler' }],
    neg: [{ text: 'Hard noon sun, crisp shadow under the hat brim' }, { text: 'Soft window light, soft shadows' }, { text: 'Sert ışık, keskin gölge' }],
  },
  'light.color-match': {
    pos: [{ text: 'Candle light, cold blue glow on his face' }, { text: 'Mum ışığı yüzüne mavi vuruyor' }, proj((p) => { p.parts[1].light.source = 'candle'; p.parts[1].light.kelvin = 6500; })],
    neg: [{ text: 'Candle light, deep amber glow on his face' }, { text: 'Phone screen cold blue glow' }, proj(() => {})],
  },
  'continuity.light': {
    pos: [proj((p) => { p.parts[1].light.direction = 'right'; }), proj((p) => { p.parts[2].light.source = 'sun'; }), proj((p) => { p.parts[1].light.source = 'neon'; p.parts[2].light.direction = 'top'; })],
    neg: [proj(() => {}), proj((p) => { p.parts.forEach((x) => { x.light.kelvin = 6000; }); }), proj((p) => { p.parts.forEach((x) => { x.light.hardness = 'sert'; }); })],
  },
  'continuity.time-weather': {
    pos: [proj((p) => { p.parts[1].sceneEn = 'At midnight Kerem steps closer.'; }), proj((p) => { p.parts[2].scene = 'Yağmur başlıyor, Elif trene biniyor.'; }), proj((p) => { p.parts[0].sceneEn = 'Golden hour, they stand facing each other.'; })],
    neg: [proj(() => {}), proj((p) => { p.parts[2].sceneEn = 'At dusk the train leaves.'; }), proj((p) => { p.parts[0].scene = 'Karşı karşıya duruyorlar.'; })],
  },
  'camera.single-move': {
    pos: [{ text: 'Slow push-in while the camera pans left' }, { text: 'Crane up, then orbit around her' }, proj((p) => { p.parts[1].sceneEn = 'The camera orbits around them.'; })],
    neg: [{ text: 'Slow push-in toward the subject' }, { text: 'Static locked-off camera, dutch angle tilted 20 degrees' }, proj(() => {})],
  },
  'camera.pov-face': {
    pos: [{ text: 'POV shot, we see her smiling face as she looks at the sea' }, { text: 'Point-of-view shot, his tears visible' }, proj((p) => { p.parts[0].camera.perspective = 'persp.pov'; p.parts[0].characters[0].action = 'smiling softly'; })],
    neg: [{ text: 'POV shot, a hand reaches for the door handle' }, { text: 'Close-up of her smiling face' }, proj((p) => { p.parts[0].camera.perspective = 'persp.pov'; p.parts[0].characters[0].action = 'reaches for the door'; })],
  },
  'camera.ots-two': {
    pos: [{ text: 'Over-the-shoulder shot of a lonely man' }, { text: 'Omuz üstü çekim, adam yalnız' }, proj((p) => { p.parts[2].camera.perspective = 'persp.ots'; })],
    neg: [{ text: 'Over-the-shoulder shot, @image-1 facing @image-2' }, { text: 'Omuz üstü çekim, iki kardeş karşı karşıya' }, proj(() => {})],
  },
  'camera.motivated-move': {
    pos: [proj((p) => { p.parts[0].camera.motion = 'move.pan'; }), proj((p) => { p.parts[1].camera.motion = 'move.orbit'; p.parts[1].characters.forEach((c) => { c.action = ''; }); p.parts[1].scene = ''; p.parts[1].sceneEn = 'They stand still.'; }), proj((p) => { p.parts[0].camera.motion = 'move.truck'; })],
    neg: [proj(() => {}), proj((p) => { p.parts[0].camera.motion = 'move.pan'; p.parts[0].characters[0].pose = 'running'; }), proj((p) => { p.parts[0].camera.motion = 'move.truck'; p.parts[0].sceneEn = 'Elif walks along the train.'; })],
  },
  'char.mask-expression': {
    pos: [proj((p) => { p.parts[0].characters[0].mask = 'full'; p.parts[0].characters[0].action = 'raises an eyebrow'; }), proj((p) => { p.parts[1].characters[1].mask = 'mouth'; }), proj((p) => { p.parts[0].characters[1].mask = 'full'; p.parts[0].characters[1].action = 'smiling'; })],
    neg: [proj(() => {}), proj((p) => { p.parts[0].characters[0].mask = 'eyes'; p.parts[0].characters[0].action = 'smiling'; }), proj((p) => { p.parts[0].characters[0].mask = 'full'; p.parts[0].characters[0].action = 'holds a knife'; })],
  },
  'dialogue.length': {
    pos: [{ text: 'She says: "I waited for you every single night at this station and you never came back to me"' }, proj((p) => { p.parts[0].dialogue[0].textEn = 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen'; }), { text: 'He says: "one two three four five six seven eight nine ten eleven twelve"', cardId: 'flow-veo31' }],
    neg: [{ text: 'She says: "Do you really have to go?"' }, proj(() => {}), { text: 'No dialogue here' }],
  },
};

describe('rule engine', () => {
  it('covers every rule with tests', () => {
    expect(Object.keys(CASES).sort()).toEqual([...RULE_IDS].sort());
  });
  for (const [id, { pos, neg }] of Object.entries(CASES)) {
    describe(id, () => {
      pos.forEach((c, i) => it(`fires #${i + 1}`, () => expect(fires(id, c)).toBe(true)));
      neg.forEach((c, i) => it(`stays quiet #${i + 1}`, () => expect(fires(id, c)).toBe(false)));
    });
  }
  it('texture fix appends the line', () => {
    const r = runRules({ text: 'Scene: x.' }, ['text.texture-line'])[0];
    expect(r.fixText?.endsWith(TEXTURE_LINE)).toBe(true);
  });
  it('invisible word fix replaces the word', () => {
    const r = runRules({ text: 'A mysterious man' }, ['char.invisible-word'])[0];
    expect(r.fixText).toContain('face half in shadow');
  });
  it('sample project is clean of errors', () => {
    const errors = runRules({ project: sampleProject(), cardId: 'seedance-2' }).filter((r) => r.severity === 'error');
    expect(errors).toEqual([]);
  });
});
