/* CineBG Studio — Yönetmen Masası: Video & Reklam araçları (v5).
   Kurallar skill'lerden: faceless-script-writer (üç katmanlı kanca, 145 wpm, nişe göre yapı, başlık + küçük resim satırı,
   fact-check), faceless-video-prompts (FOV derece, ~2 sn'de bir kesme, live/archive/scheme/pVFX, POSITIVE LOCKS,
   "NO MUSIC. SFX ONLY"), cinematic-prompt-builder (kanonik bölüm sırası, stil tarifleri, içerik politikası),
   higgsfield-timed-prompts (zaman kodlu mimari, bitişik zaman doğrulaması, SOUND satır listesi, reframe bant hesabı),
   seedance-shotlist-director (Style Prefix, 15 sn prompt, CUT blokları, localStorage onay kutulu HTML),
   cinedance-block-library (brief + blok kodları, PART 4 sıralaması), soul-cinema-ads (görsel içi başlık/slogan),
   ai-animation-directing (olay sayısı, belirti → çare), alchemist-v1 (Genjutsu dilbilgisi, tehlikeli kelimeler). */
(function () {
  const CB = window.CB;
  if (!CB || !CB.DIR || !CB.UI) return;
  const U = CB.UI;
  const { el, select, input, textarea, field, btn, pcard, copy, saveText, toast, store, words } = U;
  const GROUP = 'Video & Reklam';

  /* ---------------- ortak yardımcılar ---------------- */
  const load = (k, d) => Object.assign({}, d, store.get('dirVideo.' + k, {}));
  const keep = (k, o) => store.set('dirVideo.' + k, o);
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const pad = (n) => String(n).padStart(2, '0');
  const mmss = (s) => `${pad(Math.floor(s / 60))}:${pad(Math.round(s % 60))}`;
  const ts = (s) => `${Math.floor(s / 60)}:${pad(Math.round(s % 60))}`;
  const fx = (n) => (Math.round(n * 10) / 10).toFixed(1);
  const cap = (t) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);
  const lines = (t) => (t || '').split('\n').map((x) => x.trim()).filter(Boolean);
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const slug = (t) => (t || 'x').toLocaleLowerCase('tr').replace(/[çğıöşü]/g, (c) => ({ ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' }[c])).replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 24) || 'x';
  const titleCase = (t) => t.replace(/\b([a-z])/g, (m) => m.toUpperCase());

  /* Form durumu: değişince kaydet ve yalnızca çıktıyı yeniden üret (odak kaybolmasın) */
  function binder(key, o, rerun) {
    const id = (k) => `dv-${key}-${k}`;
    const set = (k, v) => { o[k] = v; keep(key, o); rerun(); };
    return {
      sel: (k, label, items) => field(label, select(id(k), items, o[k], (v) => set(k, v))),
      txt: (k, label, ph) => field(label, input(id(k), o[k], (v) => set(k, v), ph)),
      area: (k, label, rows, ph) => field(label, textarea(id(k), o[k], (v) => set(k, v), rows, ph)),
      num: (k, label, min, max, step) => {
        const i = el('input', { id: id(k), type: 'number', min: String(min), max: String(max), step: String(step || 1), value: String(o[k]) });
        i.addEventListener('input', () => { const v = parseFloat(i.value); if (!isNaN(v)) set(k, v); });
        return field(label, i);
      },
      chk: (k, label) => {
        const c = el('input', { id: id(k), type: 'checkbox' }); c.checked = !!o[k];
        c.addEventListener('change', () => set(k, c.checked));
        return el('label', { class: 'dv-chk', for: id(k) }, c, el('span', { text: label }));
      },
    };
  }
  const head = (main, title, hint) => main.append(el('div', { class: 'section' }, el('h3', { text: title }), el('p', { class: 'hint', text: hint })));
  const grid = (...kids) => el('div', { class: 'dv-grid' }, ...kids);
  const wide = (node) => { node.classList.add('dv-wide'); return node; };
  const note = (text, kind) => el('p', { class: 'dv-note' + (kind ? ' ' + kind : ''), text });
  function checks(items) { // [[ok, metin], …]
    return el('ul', { class: 'dv-checks' }, ...items.map(([ok, t]) => el('li', { class: ok ? 'ok' : 'bad', text: (ok ? '✓ ' : '✗ ') + t })));
  }

  /* Arka plan sekmesindeki güncel sahneden konum bilgisi */
  function scene(ctx) {
    const c = ctx.cur() || {};
    const s = c.spec;
    if (!s) return { ok: false, loc: 'a wide open location', tr: '—', time: 'flat neutral daylight', weather: 'still air', light: 'soft natural light', pal: ['deep shadow', 'neutral mid-tone', 'pale highlight', 'one warm accent'], lm: { center: 'a central landmark', left: 'a structure on the left', right: 'a structure on the right', far: 'the far horizon' }, floor: 'bare ground', mats: ['stone', 'dust'], grade: 'naturalistic grade', lens: '35mm', camEn: 'eye-level wide shot', ctx: 'ext', handle: '@loc_scene' };
    return {
      ok: true, s, loc: CB.locText(s.cat), tr: s.cat.tr, time: s.time.en, weather: s.weather.en, light: s.light ? s.light.en : 'natural light',
      pal: s.palette.w, lm: s.landmarks, floor: s.floor, mats: s.materials || [], grade: (CB.GRADES[s.gradeId] || {}).en || 'naturalistic grade',
      lens: s.camera.lens, camEn: s.camera.en, ctx: s.ctx, handle: '@loc_' + slug(s.cat.tr),
    };
  }
  const archOf = (c) => (CB.ARCHETYPES || []).find((a) => a.id === c.arch);
  const charHandle = (c) => '@char_' + slug(c.name || 'karakter');
  const charEn = (c) => { const a = archOf(c); return a ? a.en : 'original character'; };
  const catById = (id) => CB.CATS.find((c) => c.id === id);

  /* Proje storyboard'u → çekimler (spec ile) */
  function projectShots(ctx) {
    const p = ctx.project() || {};
    return (p.shots || []).map((sh) => {
      const cat = catById(sh.cat); if (!cat) return null;
      const spec = CB.makeSpec(cat, sh.seed, sh.ov || {});
      return { name: sh.name || cat.tr, note: sh.note || '', cat, spec };
    }).filter(Boolean);
  }
  /* Yarışma konsepti → çekimler (studio.js'in planıyla aynı mantık: konsept boyunca tek ışık) */
  function conceptShots(concept, seed) {
    if (CB.studio && typeof CB.studio.plan === 'function') {
      try { const pl = CB.studio.plan(); if (pl && pl.concept === concept) return pl.shots.map((s) => ({ name: s.cat.tr, note: s.sh.act, cat: s.cat, spec: s.spec, sh: s.sh })); } catch (e) { /* kendi planımızı kur */ }
    }
    const r = CB.rng ? CB.rng((seed * 2654435761) >>> 0) : Math.random;
    const pk = (a) => a[Math.floor(r() * a.length) % a.length];
    const extGroups = CB.GROUPS.filter((g) => ['ext', 'mixed', 'space', 'sky'].includes(g.ctx) && !g.id.startsWith('ad-')).map((g) => g.id);
    const tId = concept.t || 'golden', wId = concept.w || 'clear', gId = concept.g || 'blockbuster';
    const used = new Set();
    return concept.shots.map((sh) => {
      const groups = sh.bg && sh.bg.length ? sh.bg : extGroups;
      let cats = CB.CATS.filter((c) => groups.includes(c.group.id) && !used.has(c.id));
      if (!cats.length) cats = CB.CATS.filter((c) => groups.includes(c.group.id));
      if (!cats.length) cats = CB.CATS;
      const cat = pk(cats); used.add(cat.id);
      const sd = (r() * 4294967296) >>> 0;
      const probe = CB.makeSpec(cat, sd, { camera: sh.cam });
      const ov = probe.ctx === 'int' ? { camera: sh.cam, grade: gId } : { camera: sh.cam, time: tId, weather: wId, grade: gId };
      return { name: cat.tr, note: sh.act, cat, spec: CB.makeSpec(cat, sd, ov), sh };
    });
  }
  const P = (t, who) => (t || '').replace(/\{P\}/g, who);

  /* ======================================================================
     1. FACELESS SENARYO
     ====================================================================== */
  const NICHE = [['crime', 'True crime · Vaka dosyası'], ['explainer', 'Explainer · Segment döngüsü'], ['documentary', 'Belgesel · İniş']];
  const BANNED_HOOK = ['welcome back', 'before we start', 'make sure to subscribe', 'in this video', 'in today\'s video', 'don\'t forget to', 'let\'s get started', 'smash that'];
  const FILLER = ['as we mentioned', 'interestingly', 'it\'s worth noting', 'little did they know', 'needless to say', 'at the end of the day', 'it goes without saying'];

  function blueprint(niche, total) {
    let B;
    if (niche === 'crime') {
      const loops = clamp(Math.round((total - 385) / 105), 2, 4);
      B = [
        { k: 'HOOK', s: 60 },
        { k: 'THE NORMAL DAY', s: 75, vo: 'Exact date and place, present tense. Establish the victim and the setting as ordinary. End on the first anomaly.' },
        { k: 'DISCOVERY', s: 75, vo: 'The scene as investigators find it. Sensory specifics. Float one misleading first theory.' },
        ...Array.from({ length: loops }, (_, i) => ({ k: `INVESTIGATION LOOP ${i + 1}`, s: 105, vo: 'One lead → one revelation → one new question. End on an open loop (a forward promise, never the answer).' })),
        { k: 'THE TURN', s: 75, turn: true, vo: 'The assumption that collapses: the moment the title promised. It must land at roughly 70% of runtime, never earlier.' },
        { k: 'RESOLUTION', s: 75, vo: 'What happened to whom: concrete outcomes, sentences, dates.' },
        { k: 'CLOSER', s: 25, vo: 'One unresolved thread or a factual gut-punch line. No moralizing outro.' },
      ];
    } else if (niche === 'explainer') {
      const n = clamp(Math.round((total - 43) / 65), 5, 12);
      B = [
        { k: 'HOOK', s: 25 },
        ...Array.from({ length: n }, (_, i) => ({ k: `SEGMENT ${i + 1}${i === 0 ? ' (second-strongest item)' : i === n - 1 ? ' (strongest item)' : ''}`, s: 65, vo: 'Item name → its single most shocking fact → the mechanism in plain words → one concrete number or case → one-line bridge to the next item.' })),
        { k: 'CLOSER', s: 18, vo: 'The one item or fact deliberately held back, delivered as a final reveal.' },
      ];
    } else {
      const loops = clamp(Math.round((total - 450) / 120), 3, 5);
      B = [
        { k: 'HOOK', s: 60 },
        { k: 'THE SURFACE', s: 90, vo: 'The world as it appears: the official version, the tourist view, the public story.' },
        ...Array.from({ length: loops }, (_, i) => ({ k: `DESCENT ${i + 1}`, s: 120, vo: 'One level deeper than the last: a new location, a new person, a new document. End by contradicting something established in the previous block.' })),
        { k: 'THE HUMAN CORE', s: 105, vo: 'One named individual whose daily experience embodies the whole topic. Physical, bodily detail.' },
        { k: 'THE WHY', s: 75, turn: true, vo: 'The system or incentive that produces the situation. Numbers, not opinions.' },
        { k: 'CLOSER', s: 25, vo: 'Return to the opening image with the viewer\'s understanding transformed.' },
      ];
    }
    // hedef süreye ölçekle (kanca sabit kalır)
    const hook = B[0].s, rest = B.slice(1).reduce((a, b) => a + b.s, 0);
    const k = Math.max(0.35, (total - hook) / rest);
    let t = 0;
    B.forEach((b, i) => { if (i) b.s = Math.max(12, Math.round(b.s * k)); b.t = t; t += b.s; });
    return B;
  }
  function hookText(niche, topic) {
    const L1 = {
      crime: 'Layer 1 (0:00–0:10) — COLD DROP: a fragment of tense dialogue or a scene mid-action, no context given.',
      explainer: 'Layer 1 (0:00–0:10) — COLD DROP: the first list item or the core anomaly, stated flat.',
      documentary: 'Layer 1 (0:00–0:10) — COLD DROP: superlative + number in sentence one, or a named character mid-action.',
    }[niche];
    const out = [L1, 'Layer 2 (0:10–0:30) — STAKES: one sentence naming what is actually at stake, containing a superlative or a knowledge gap.'];
    if (niche === 'explainer') out.push('No Layer 3: list formats start segment one instantly (total hook under 25 s).');
    else out.push('Layer 3 (0:30–1:00) — TRAILER: 3–4 short teases pulled from the middle and end (emotional peaks, payoff withheld), then a hard cut to an exact time and place ("February 24th, 1996. Van Nuys, California.").');
    out.push('Write the hook LAST, pulling teases from real peaks in the body. Banned: "welcome back", "before we start", "make sure to subscribe", any roadmap of the video.');
    return out.join('\n');
  }
  function titlesFor(niche, topic, n) {
    const T = titleCase(topic || 'The Case');
    const L = {
      crime: [`Suspect Realizes Detectives Found the ${T.split(' ').slice(-1)[0]}`, `${T}: Solved ${n} Years Later`, `They Had No Idea Investigators Already Knew`],
      explainer: [`Every ${T}, Explained`, `${T} Shouldn't Exist`, `The ${n} Most Extreme ${T}`],
      documentary: [`Life Inside ${T}`, `${T} Is Not What It Looks Like`, `What ${n} Days Inside ${T} Reveal`],
    }[niche];
    const thumbs = { crime: ['THEY ALREADY KNEW', 'ONE MISSED CALL', 'WRONG MAN?', 'NOBODY CHECKED'], explainer: ['WAIT, WHAT?', 'THIS IS REAL', 'IMPOSSIBLE MATH', 'NUMBER 7 THOUGH'], documentary: ['NO WAY OUT', 'THEY LIVE HERE', 'BEHIND THE DOOR', 'IT GETS WORSE'] }[niche];
    const tw = new Set(L.join(' ').toUpperCase().match(/[A-Z]+/g) || []);
    const thumb = thumbs.find((t) => !(t.match(/[A-Z]+/g) || []).some((w) => tw.has(w) && w.length > 2)) || thumbs[0];
    return { titles: L, thumb };
  }
  function lintVO(text, niche) {
    const t = (text || '').trim(); if (!t) return [];
    const low = t.toLowerCase();
    const sentences = t.split(/(?<=[.!?])\s+/).filter(Boolean);
    const long = sentences.filter((s) => words(s) > 20);
    const wc = words(t), secs = (wc / 145) * 60;
    const nums = (t.match(/\b\d[\d,.:]*\b/g) || []).length;
    const needNums = Math.max(1, Math.floor(secs / 60));
    const qChain = /\?[^.!?]{0,60}\?[^.!?]{0,60}\?/.test(t);
    const dashes = (t.match(/—/g) || []).length;
    const first = sentences[0] || '';
    const brand = /\b(uber|lyft|google|facebook|instagram|tiktok|apple|iphone|amazon|netflix|youtube|coca-cola|nike|tesla)\b/i.exec(t);
    return [
      [!BANNED_HOOK.some((b) => low.includes(b)), 'Kancada yasak ifade yok (welcome back, in this video, subscribe…)'],
      [!FILLER.some((b) => low.includes(b)), 'Dolgu geçişi yok (interestingly, as we mentioned, little did they know…)'],
      [!long.length, long.length ? `${long.length} cümle 20 kelimeyi aşıyor: "${long[0].slice(0, 70)}…"` : 'Her cümle ≤20 kelime'],
      [nums >= needNums, `Kesin sayı: ${nums} adet (~${Math.round(secs)} sn VO için en az ${needNums})`],
      [!qChain, 'Retorik soru zinciri yok'],
      [dashes <= Math.max(1, Math.round(sentences.length / 8)), `Uzun tire kullanımı: ${dashes}`],
      [!/^(hey|hi|hello|welcome|today|in this)/i.test(first), 'İlk cümle doğrudan hikâyenin içinde başlıyor'],
      [!brand, brand ? `Marka adı geçiyor: "${brand[0]}" → tarif et ("a major ride-sharing app")` : 'Marka adı yok'],
      [true, `${wc} kelime ≈ ${mmss(secs)} @145 wpm`],
    ];
  }
  function facelessScript(o, ctx) {
    const sc = scene(ctx);
    const total = clamp(o.minutes, 2, 30) * 60;
    const B = blueprint(o.niche, total);
    const end = B[B.length - 1].t + B[B.length - 1].s;
    const facts = lines(o.facts);
    const num = ((o.topic + ' ' + o.facts).match(/\b\d{1,4}\b/) || ['23'])[0];
    const { titles, thumb } = titlesFor(o.niche, o.topic, num);
    const turn = B.find((b) => b.turn);
    const turnPct = turn ? Math.round(((turn.t + turn.s / 2) / end) * 100) : 0;
    const vis = (b) => {
      const n = Math.max(1, Math.ceil(b.s / 8));
      const kind = o.niche === 'crime' ? ['[live] ' + sc.loc + ', unmanned, flat cool daylight', '[archive] sepia handheld beat, figures 10–15 m from camera, faces small and dark', '[scheme] map / timeline card (rendered in code, cut in full-frame)']
        : o.niche === 'explainer' ? ['[live] the item itself, off-centre on the right third, horizon tilted 10°', '[scheme] number card / comparison diagram (rendered in code)', '[pVFX] a cyan beam 0.5 m wide rakes across the subject']
          : ['[live] ' + sc.loc + ', wide 84°, harsh flat midday light', '[archive] sepia handheld street beat', '[live] physical detail at 8° extreme close-up'];
      return `VISUAL (${n} changes, one at least every 8 s): ${kind.slice(0, Math.min(3, n)).join(' · ')}`;
    };
    const out = [
      `TITLE OPTIONS: 1) ${titles[0]} 2) ${titles[1]} 3) ${titles[2]}`,
      `THUMBNAIL LINE: ${thumb}`,
      `TARGET LENGTH: ${o.minutes} min (~${Math.round((total / 60) * 145)} words VO @145 wpm)`,
      `NICHE: ${o.niche} · TOPIC: ${o.topic || '[topic]'}${turn ? ` · ${turn.k} lands at ${mmss(turn.t)} (${turnPct}% of runtime)` : ''}`,
      '',
    ];
    B.forEach((b) => {
      const wds = Math.round((b.s / 60) * 145);
      out.push(`[${mmss(b.t)}] ${b.k}  (${b.s} s · ~${wds} words)`);
      if (b.k === 'HOOK') out.push(hookText(o.niche, o.topic).split('\n').map((x) => '  ' + x).join('\n'), 'VO: [write last]');
      else out.push(`VO: [${b.vo}]`);
      out.push(vis(b), '');
    });
    out.push(`[${mmss(end)}] END`, '',
      'RETENTION PASS: present tense · an exact number every 30–60 s · never answer a loop in the breath it opens · re-hook every 2–3 min · one idea per sentence, ≤20 words · concrete over abstract · no filler transitions.',
      'ANTI-SLOP PASS: no staccato mirrored cadences · no motivational padding · no rhetorical-question chains · few em-dashes · vary sentence length · no trademarked brand names · no imitation of any channel or video.',
      '', 'FACT CHECK');
    if (facts.length) facts.forEach((f, i) => { const [claim, src] = f.split('|').map((x) => x.trim()); out.push(`${i + 1}. ${claim} — source: ${src || 'none yet'} — status: ${src && src.includes(';') ? 'CHECK (2 sources listed)' : 'UNVERIFIED (needs 2 independent sources)'}`); });
    else out.push('1. Every date in the script — UNVERIFIED', '2. Every number (ages, distances, amounts, durations) — UNVERIFIED', '3. Every named person, place and quote — UNVERIFIED', 'Rule: verify against at least 2 independent sources; cut anything that cannot be verified. Never invent cases, quotes or statistics.');
    if (o.niche === 'crime') out.push('', 'True crime: documented public cases only, no speculation presented as fact, no gratuitous detail, respectful handling of victims.');
    return { text: out.join('\n'), titles, thumb, turnPct, end };
  }

  CB.DIR.register({
    id: 'faceless-script', tr: 'Faceless Senaryo', sub: 'Kanca · yapı · 145 wpm · fact-check', group: GROUP,
    render(main, ctx) {
      const o = load('script', { niche: 'crime', topic: '', minutes: 8, facts: '', draft: '' });
      const out = el('div', { class: 'dv-out' });
      const run = () => {
        const r = facelessScript(o, ctx);
        const tl = r.titles.map((t) => [t.length <= 60, `${t} (${t.length} karakter)`]);
        const turnOk = o.niche === 'explainer' || (r.turnPct >= 60 && r.turnPct <= 82);
        out.replaceChildren(
          el('div', { class: 'section' }, el('h3', { text: 'Denetim' }), checks([
            ...tl, [r.thumb.split(' ').length <= 4, `Küçük resim satırı ≤4 kelime: ${r.thumb}`],
            [turnOk, o.niche === 'explainer' ? 'Explainer: en güçlü iki madde 1. ve son sırada' : `Dönüş anı ~%70'te: %${r.turnPct}`],
            [!!o.topic, o.topic ? 'Konu girildi' : 'Konu yok: konu kuralına uyan bir başlık yaz (bilgi boşluğu, üstünlük + sayı, ters köşe, tam set)'],
            [/\d/.test(o.topic) || /every|all|each/i.test(o.topic) || o.niche !== 'explainer', 'Konu testi: sayı ya da "Every X" vaadi'],
          ])),
          pcard('Senaryo iskeleti', 'Zaman kodlu VO + görsel notlar', r.text, 'Araç araştırma yapmaz: VO metnini sen yazarsın, her iddiayı iki bağımsız kaynakla doğrula.'),
          o.draft ? el('div', { class: 'section' }, el('h3', { text: 'VO taslak denetimi' }), checks(lintVO(o.draft, o.niche))) : null,
          el('div', { class: 'row' }, btn('⤓ TXT indir', () => saveText(r.text + (o.draft ? '\n\nDRAFT VO\n' + o.draft : ''), `faceless_${slug(o.topic || o.niche)}.txt`), 'primary')));
      };
      const b = binder('script', o, run);
      head(main, 'Faceless Senaryo', 'Üç niş için en iyi performans gösteren yapı: üç katmanlı kanca, 145 wpm zaman kodları, her 8 saniyede görsel değişim, başlık seti ve küçük resim satırı. Taslağını yapıştırırsan tutma kurallarına göre denetlenir.');
      main.append(el('div', { class: 'section' }, grid(
        b.sel('niche', 'Niş', NICHE), b.num('minutes', 'Hedef süre (dk)', 2, 30, 1),
        wide(b.txt('topic', 'Konu (İngilizce)', 'e.g. the smallest apartments in Hong Kong')),
        wide(b.area('facts', 'Doğrulanacak gerçekler: iddia | kaynak1; kaynak2', 3, 'Built in 1962 | city archive; newspaper')),
        wide(b.area('draft', 'VO taslağı (isteğe bağlı, denetim için)', 4, 'Paste your voiceover draft…')))), out);
      run();
    },
  });

  /* ======================================================================
     2. FACELESS 10 SN BLOK
     ====================================================================== */
  const FOV = [['180', '180° tüm gökyüzü'], ['107', '107° tepeden geniş'], ['84', '84° geniş'], ['63', '63° ortam'], ['47', '47° normal'], ['29', '29° kısa tele'], ['18', '18° portre sıkıştırma'], ['12', '12° uzun tele'], ['8', '8° aşırı detay']];
  const SIZES = [['WIDE', 'WIDE'], ['MEDIUM', 'MEDIUM'], ['CU', 'CU'], ['ECU', 'ECU'], ['DETAIL', 'DETAIL'], ['OVERHEAD', 'OVERHEAD'], ['LOW', 'LOW']];
  const TYPES = [['live', '[live] fotogerçek'], ['archive', '[archive] sepya el kamerası'], ['pvfx', '[pVFX] pratik ışık'], ['scheme', '[scheme] şema (kodla)']];
  const DEF_SHOTS = [
    { type: 'live', size: 'WIDE', fov: '84', move: 'a slow 4 km/h push along the ground toward the subject' },
    { type: 'live', size: 'LOW', fov: '63', move: 'a low lateral drift right to left at walking pace' },
    { type: 'archive', size: 'MEDIUM', fov: '47', move: 'hand-cranked handheld with gate weave, footstep jolts' },
    { type: 'live', size: 'DETAIL', fov: '8', move: 'a breathing drift of a few millimetres across the surface' },
    { type: 'pvfx', size: 'OVERHEAD', fov: '107', move: 'a slow orbit descending 2 m over the full shot' },
  ];
  function block10(o, ctx) {
    const sc = scene(ctx);
    const loc = o.loc || sc.loc;
    const subj = o.subject || sc.lm.center;
    const shots = o.shots.slice(0, o.count);
    const vids = shots.filter((s) => s.type !== 'scheme');
    const schemes = shots.length - vids.length;
    const per = o.dur / Math.max(1, vids.length);
    const cuts = vids.slice(1).map((_, i) => fx(per * (i + 1)));
    const cutLine = vids.length > 1 ? `${vids.length} shots, ${cuts.length} hard cuts at ${cuts.join(' / ')} s` : 'one continuous shot';
    const hasLive = vids.some((s) => s.type === 'live'), hasArch = vids.some((s) => s.type === 'archive'), hasFx = vids.some((s) => s.type === 'pvfx');
    let tilt = 1;
    const timing = vids.map((s, i) => {
      const a = per * i, b2 = per * (i + 1);
      tilt = -tilt;
      const tiltT = s.type === 'live' ? ` Horizon tilted ${8 + ((i * 3) % 7)}° ${tilt > 0 ? 'clockwise' : 'counter-clockwise'}, ${subj} on the right-third golden point.` : '';
      const look = s.type === 'archive' ? ' Heavy sepia, thick film grain, gate weave, hand-cranked wobble, slight overexposure blooms, dust and scratches; two figures stand 10–15 m from camera, faces small and dark.'
        : s.type === 'pvfx' ? ` ${o.fxText || 'A cyan beam 0.5 m wide rakes across the stone left to right over 2 seconds, its spill lifting the surface texture'}.${o.impact ? ' The struck object shudders but keeps its geometry; it stays whole, the flash lives in light only.' : ''}`
          : ' The site is unmanned; only architecture, equipment and light.';
      return `${fx(a)}–${fx(b2)} s — SHOT ${i + 1}, ${s.size}, ${s.fov}° FOV: ${s.move}.${tiltT}${look}`;
    });
    const p = [
      `SCENE CONTEXT: ${o.dur}-second faceless documentary block for the line "${o.beat || '[script beat]'}". ${cap(subj)} in ${loc}, built as ${cutLine}.`,
      `LOCATION MAP: ${cap(sc.lm.center)} at the centre; ${sc.lm.left} on the left; ${sc.lm.right} on the right; ${sc.lm.far} in the far distance; ${sc.floor} underfoot. Every shot stays inside this geography.`,
      `FIRST FRAME: already mid-motion — ${vids[0] ? vids[0].move : 'the camera drifting'}, ${o.haze}% haze hanging in the air, dust lifting off ${sc.floor}.`,
      `FORMAT MODE: timed multishot — ${cutLine}. Within each shot the camera is physically carried and holds one continuous move.`,
      `OPTICS: ${vids.map((s, i) => `shot ${i + 1} ${s.fov}° ${s.size.toLowerCase()}`).join('; ')}. Camera distance stated per shot against ${subj}.`,
      `CAMERA: every move is motivated — wind drift, the narration's reveal, a slow orbit around ${subj}. Handheld reads as overshoot-and-recoil, footstep jolts and breathing drift. Top speed ${o.speed} km/h.`,
      'ACTION TIMING:', ...timing,
      `PHYSICS: dust falls back under gravity, loose cloth and rope sway with the ${o.haze}% haze air, every object keeps its weight and contact shadow; continuity of dust, damage and object positions is restated on both sides of every cut.`,
      `LIGHTING: ${hasLive ? `flat neutral midday light, pale grey-dust sky, cool blue-grey shadows, WB locked at ${o.wb}K` : `${sc.time}, WB locked at ${o.wb}K`}${hasFx ? '; the practical beam is the only coloured source' : ''}.`,
      `AUDIO: NO MUSIC. SFX ONLY — diegetic sound throughout; no score, no narration, no voices. ${o.sfx || 'Wind over stone, a distant low hum, rope creak'}.`,
      `STYLE: ${hasArch ? 'live beats photoreal with fine grain; archive beats sepia with heavy grain; ' : 'photoreal footage, fine grain, '}palette ${sc.pal[0]} 60%, ${sc.pal[1]} 30%, ${sc.pal[3] || sc.pal[2]} 10%.`,
      `POSITIVE LOCKS: ${cutLine}; ${hasLive ? 'the light stays cool and flat in every frame, the palette stays grey-blue to the final frame; the site is unmanned in every live frame; ' : ''}${hasArch ? 'archive figures stay 10–15 m away with faces small and dark; ' : ''}${subj} stays in its place with its full geometry; WB ${o.wb}K holds through every cut.`,
    ];
    return { text: p.join('\n'), schemes, vids: vids.length, cuts };
  }
  CB.DIR.register({
    id: 'faceless-block', tr: 'Faceless 10 sn Blok', sub: 'Live · archive · pVFX · FOV°', group: GROUP,
    render(main, ctx) {
      const o = load('block', { beat: '', subject: '', loc: '', dur: 10, count: 5, wb: 5600, haze: 30, speed: 4, impact: false, fxText: '', sfx: '', shots: DEF_SHOTS });
      if (!Array.isArray(o.shots) || o.shots.length < 6) o.shots = [...(o.shots || []), ...DEF_SHOTS, DEF_SHOTS[0]].slice(0, 6).map((s) => Object.assign({}, s));
      const out = el('div', { class: 'dv-out' });
      const rowsBox = el('div', { class: 'dv-rows' });
      const run = () => {
        const r = block10(o, ctx);
        out.replaceChildren(
          checks([[r.vids >= 4 || o.dur < 8, `Her ~2 sn'de yeni görüntü: ${r.vids} çekim / ${o.dur} sn`], [!/\b(no|not|never|without)\b/i.test((o.beat + o.subject + o.fxText).toLowerCase()), 'Olumsuzlama yok (model her ismi istek sayar)'], [!o.impact || o.shots.some((s) => s.type === 'pvfx'), 'Darbe kilidi pVFX çekimiyle']]),
          r.schemes ? note(`${r.schemes} şema yuvası video prompt'a girmedi: şemalar kodla çizilip kurguda tam kare kart olarak kesilir.`, 'warn') : null,
          pcard('10 sn blok prompt', 'Seedance 2.5 · faceless', r.text, 'Bir üretim 30 sn\'ye kadar taşır: üç blok tek çekimde zamanlı kesmelerle verilebilir; modelin birkaç kesmeyi atlayabileceğini kontrol et.'));
      };
      const b = binder('block', o, run);
      const drawRows = () => {
        rowsBox.replaceChildren(...o.shots.slice(0, o.count).map((s, i) => {
          const up = (k, v) => { s[k] = v; keep('block', o); run(); };
          return el('div', { class: 'dv-row5' },
            el('b', { text: `Çekim ${i + 1}` }),
            select(`dv-bt${i}`, TYPES, s.type, (v) => up('type', v)),
            select(`dv-bs${i}`, SIZES, s.size, (v) => up('size', v)),
            select(`dv-bf${i}`, FOV, s.fov, (v) => up('fov', v)),
            input(`dv-bm${i}`, s.move, (v) => up('move', v), 'camera move with a physical motive'));
        }));
      };
      head(main, 'Faceless 10 sn Blok', 'Bir senaryo vuruşunu ~2 saniyede bir kesmeli çok çekimli prompta çevirir. Görülebilir olanı yazar: FOV derece, Kelvin, km/s, pus %. Konum varsayılanı arka plan sekmesindeki sahne.');
      const countSel = b.num('count', 'Çekim sayısı', 2, 6, 1);
      countSel.querySelector('input').addEventListener('input', drawRows);
      main.append(el('div', { class: 'section' }, grid(
        wide(b.txt('beat', 'Senaryo vuruşu (VO satırı)', 'In 1962 the city stops building upward.')),
        b.txt('subject', 'Özne', scene(ctx).lm.center), b.txt('loc', 'Konum (boş = güncel arka plan)', scene(ctx).loc),
        b.num('dur', 'Süre (sn)', 4, 30, 1), countSel, b.num('wb', 'WB (Kelvin)', 2800, 9000, 100), b.num('haze', 'Pus %', 0, 90, 5), b.num('speed', 'Kamera hızı km/s', 0, 120, 1),
        wide(b.txt('fxText', 'pVFX ışığı (renk, geometri, davranış)', 'a cyan beam 0.5 m wide rakes across the wall left to right over 2 seconds')),
        b.chk('impact', 'Çarpma / flaş var (anti-impact kilidi)'),
        wide(b.txt('sfx', 'Diegetik ses yatağı (2–3 gerçek ses)', 'wind over stone, projector whir, rope creak')))),
      el('div', { class: 'section' }, el('h3', { text: 'Çekimler' }), rowsBox), out);
      drawRows(); run();
    },
  });

  /* ======================================================================
     3. PROMPT KURUCU (cinematic-prompt-builder)
     ====================================================================== */
  const STYLES = {
    live: { tr: 'Live-action sinematik', n: 4, oner: false, style: '8K photoreal, anamorphic widescreen, 35mm film quality, fine grain, professional colour grading, steadicam fluidity. Photoreal — NOT 3D render, NOT game engine.', cam: 'orbiting and chasing as a ground presence, whip-pans, handheld shake on impacts', shots: ['WIDE ESTABLISHING, crane descending', 'TRACKING alongside the subject', 'CLOSE-UP push-in on the hero beat', 'HIGH WIDE pull-away reveal'], audio: 'NO MUSIC. SFX ONLY — diegetic sound throughout; wind, footsteps, distant rumble.' },
    animated: { tr: '3D animasyon (Pixar kalitesi)', n: 6, oner: false, style: 'Vibrant glossy CGI render, Pixar-quality stylized animation, subsurface-scattered fur and skin, expressive cartoon performance, dappled daylight, lush saturated palette, depth-of-field mastery. Do not use one camera angle or a single cut.', cam: 'deliberately varied per shot — push-in, close-up, wide, tracking, insert, wide', shots: ['WIDE, slow push-in', 'CLOSE-UP on the reaction', 'WIDE two-shot', 'TRACKING beside the characters', 'INSERT on the key object', 'WIDE final gag'], audio: 'Light score allowed; SFX-forward: footsteps in leaves, creature chirps, the gag thud.' },
    game: { tr: 'Oyun ara sahnesi + HUD', n: 3, oner: false, style: 'AAA video-game cinematic, Unreal Engine 5 real-time in-engine render, Lumen GI, Nanite micro-geometry, screen-space reflections. Hyperreal but unmistakably GAME-RENDERED — NOT live-action, NOT film. Game-character subsurface skin, NOT live-action pores.', cam: 'virtual game-cinematic camera, third-person over-the-shoulder, 180° shutter motion blur, game-cutscene depth of field', shots: ['THIRD-PERSON OVER-THE-SHOULDER follow', 'LOW WIDE reveal of the threat, boss bar fades in', 'ORBIT around the hero, speed-ramp on the big beat'], hud: true, audio: 'NO MUSIC, SFX only, plus subtle UI ticks (waypoint ping, quest-update chime).' },
    gameplay: { tr: 'Oynanış görüntüsü', n: 3, oner: false, style: 'AAA arcade gameplay footage. Hyper-saturated, glossy, high-contrast real-time engine render, crisp pinned UI. In-game gameplay, NOT a film plate.', cam: 'classic third-person chase-cam, rock-steady, locked to the vehicle, ultra-wide, heavy speed-blur on the world while the subject stays razor-sharp and centred', shots: ['CHASE-CAM full throttle', 'CHASE-CAM drift through the corner', 'CHASE-CAM boost burst down the straight'], hud: true, audio: 'NO MUSIC, SFX only — engine revs, gear shifts, boost whoosh, tyre screech, UI beeps.' },
    fpv: { tr: 'FPV / POV oner', n: 1, oner: true, style: 'Single continuous shot, one take no cuts, cinematic FPV oner, 4K ultra-detailed, photoreal macro, anamorphic, fluid drone flight.', cam: 'the camera IS a flying presence: dives into texture, brushes close against surfaces, never stops, never pulls up or back', shots: ['ONER'], audio: 'Diegetic only; during the slow-motion beat ambient wind drops to a muffled vacuum with amplified rhythmic sound, then a sonic whoosh as reality snaps back.' },
    product: { tr: 'Ürün / reklam spotu', n: 8, oner: false, style: '8K photorealistic editorial commercial, cinematic and moody, deep black crush, per-section colour worlds.', cam: 'crash-zoom, macro probe-lens, snap-rack focus, speed-ramp on product interactions, slow dolly on the packshot', shots: ['MACRO probe across the product surface', 'HAND interaction, snap-rack focus', 'MACRO 0.3 s strobe cut', 'MACRO 0.3 s strobe cut', 'CRASH-ZOOM onto the detail', 'SPEED-RAMP on the pour', 'MEDIUM in-use', 'HERO PACKSHOT, slow dolly-in'], packshot: true, audio: 'NO MUSIC, NO voiceover, NO on-screen text — only diegetic product-handling SFX (glass clink, pump hiss, spray mist) and an ambient bass drone.' },
    vfx: { tr: 'Kaynak videoya VFX', n: 1, oner: true, style: '8K cinematic, photorealistic — no 3D render, no game engine. Practical creature-FX realism; composition and grade INHERITED from <<<video_1>>>.', cam: 'INHERIT the source camera exactly; the added element is parallax-locked to its anchor plane with correct occlusion', shots: ['SOURCE CLIP'], input: true, audio: 'NO MUSIC, SFX only — the new element\'s diegetic sounds over faint preserved room tone.' },
    kaiju: { tr: 'Kaiju / yaratık', n: 6, oner: false, style: '8K photoreal, anamorphic, original-creature blockbuster grade, fine grain, hyperdetailed. Original design, not based on any franchise.', cam: 'macro on detail → hard fast zoom → wide reveal → handheld water-on-lens → grapple → high wide; never static', shots: ['ECU 14° on the closed eye', 'HARD FAST ZOOM into the same eye', 'WIDE 84° breach, slow motion on this beat only', 'HANDHELD at surface level, water on the lens', 'MEDIUM grapple at the surface', 'HIGH WIDE pull-away'], audio: 'Diegetic only — ocean ambience, rising rumble, water-burst, roars, a subsonic boom.' },
  };
  const RISK = [
    [/\b(guns?|rifles?|pistols?|shoot(ing|s)?|firing|bullets?)\b/i, 'Silah ateşi → enerji boşalması, tarayan projektörler, ateşlenmeyen silüet'],
    [/\b(blood|gore|wound(ed|s)?|kill(s|ed|ing)?|dead|corpse|stab)\b/i, 'Kan/ölüm → darbe ışığı, toz, enkaz, kadraj dışına düşen silüet'],
    [/\b(crowds? (flee|fleeing|panic)|civilians?|panic)\b/i, 'Panik kalabalık → boşaltılmış şehir, ölçek için tek figür'],
    [/\b(child|children|kid|minor|teen)\b/i, 'Çocuk: yalnızca masum, yaşa uygun sahne'],
    [/\b(nike|adidas|coca[- ]?cola|apple|marvel|godzilla|pokemon|disney)\b/i, 'Gerçek marka/IP → özgün tasarım (kendi ürünün hariç)'],
  ];
  function builder(o, ctx) {
    const st = STYLES[o.fmt] || STYLES.live;
    const sc = scene(ctx);
    const asp = o.aspect || (ctx.aspect() || {}).id || '16:9';
    const oner = st.oner || o.mode === 'oner';
    const n = oner ? 1 : clamp(o.shots || st.n, 1, 12);
    const beats = lines(o.beats);
    const D = o.dur;
    const hero = o.subject || (o.fmt === 'kaiju' ? 'an original sea titan with barnacled slate hide and a single amber eye' : o.fmt === 'product' ? 'the product from @image_1' : 'the hero');
    const refs = lines(o.refs);
    const S = [];
    S.push(`STYLE: ${st.style} ${sc.grade}.`);
    S.push(`SCENE CONTEXT: ${D}-second ${st.tr === 'Live-action sinematik' ? 'live-action cinematic' : o.fmt} piece — ${hero} in ${sc.loc}. ${oner ? 'One continuous take.' : `${n} shots.`} Aspect ${asp}.`);
    if (refs.length || st.input) {
      S.push('ACTIVE REFERENCES / INPUT LOCK:');
      if (st.input) S.push(`INPUT LOCK — <<<video_1>>> matches input 100%. The entire source clip is preserved UNCHANGED: every figure, the props, the lighting, the grade and the exact camera move with its framing, focal length, shake and timing. Do NOT re-grade, re-time, smooth, or re-frame anything. The ONLY additions are ${hero}, the light it casts, its contact shadows and the host surface's slight physical reaction.`);
      refs.forEach((r) => S.push(/100%/.test(r) ? r : `${r} 100% matches the reference.`));
      if (!st.input && o.fmt !== 'product') S.push('@image_1 is the master STYLE REFERENCE, not a fixed keyframe. Match its look 100%. Set the scene in motion and let the world extend forward. Introduce no new characters, props or palette.');
    }
    S.push(`FORMAT MODE: ${oner ? 'ONE CONTINUOUS TAKE, no cuts — the camera never cuts on its own.' : `Timed multishot, ${n} shots, HARD CUTs on action at the stated timecodes only.`}`);
    S.push(`LIGHTING: ${sc.time}; ${sc.light}; practical sources motivate every highlight, ${sc.weather}.`);
    S.push(`COLOR: 60:30:10 — ${sc.pal[0]} dominant, ${sc.pal[1]} secondary, ${sc.pal[3] || sc.pal[2]} accent.`);
    S.push(`CAMERA: ${st.cam}. In motion from the first second.`);
    if (!oner) S.push(`OPTICS: ${st.shots.slice(0, n).map((s, i) => `CUT ${i + 1} — ${s.split(',')[0]}`).join(' · ')}.`);
    S.push(`MATERIAL / SURFACES: ${sc.mats.join(', ') || 'weathered stone, dust'}, ${sc.floor}; wet and dry surfaces read at material level.`);
    if (o.fmt === 'kaiju' || o.fmt === 'vfx') S.push(`CHARACTER DESIGN: ${hero} — original, not based on any franchise. Identity locked across every cut.`);
    S.push(`SUBJECTS: ${hero}${o.fmt === 'product' ? ' — logos, colours and arrangement match the reference exactly' : ''}.`);
    S.push(`PHYSICS: real mass, gravity and inertia, contact shadows on every surface, dust and debris fall under gravity. No floating props.`);
    if (o.fmt === 'animated' || o.fmt === 'live') S.push('ACTING / PERFORMANCE: micro-pauses before reactions, precise eye-line, breath and body weight; ' + (o.fmt === 'animated' ? 'cartoon expressiveness, short characterful lines in quotes.' : 'restraint by default.'));
    S.push(`COMPOSITION: rule of thirds, three-layer depth — ${sc.lm.left} in the foreground, ${hero} in the midground, ${sc.lm.far} behind; a human figure gives scale to anything large. Motion from frame one.`);
    S.push(`LOCATION MAP: ${cap(sc.lm.center)} at the centre, ${sc.lm.left} left, ${sc.lm.right} right, ${sc.lm.far} far; ${sc.floor} underfoot.`);
    S.push(`FIRST FRAME: ${beats[0] || `${hero} already moving through ${sc.lm.center}`}, the camera already travelling.`);
    S.push(`CONTINUITY: ${hero}, the props and the environment stay identical across every ${oner ? 'beat' : 'cut'}. No identity drift.`);
    if (st.hud) S.push(`HUD LAYER: flat 2D screen-space UI in accent ${o.hud || '#3CF2FF'}, screen-PINNED on every shot (no parallax; numbers tick, layout locked): ${o.fmt === 'gameplay' ? 'RPM gauge bottom-right, digital speedometer climbing, gear number, BOOST bar, mini-map top-left with hazard markers, lap timer top-centre, position 1/8' : 'compass bar top-centre, minimap top-left, quest log right with "REACH THE GATE 0/1", HP and stamina bars bottom-left, hotbar bottom-centre, diegetic world-space [E] INTERACT prompt'}.`);
    S.push('ACTION / SHOT BREAKDOWN:');
    if (oner) {
      const b = beats.length ? beats : [`${hero} enters already in motion`, 'the hook event triggers a 240fps slow-motion beat', 'snaps back to 24fps real time', 'the camera dives on without ever pulling up or back'];
      S.push(`Single continuous shot ${D}s: ` + b.map((x, i) => `${ts((D * i) / b.length)}–${ts((D * (i + 1)) / b.length)} — ${x}`).join('; ') + '. One take, no edits, never pulling up or back.');
    } else {
      const per = D / n;
      for (let i = 0; i < n; i++) {
        const shot = st.shots[i % st.shots.length];
        const act = beats[i] || (i === 0 ? `${hero} already moving` : i === n - 1 && st.packshot ? 'the product settles in one third, clean dark negative space, gold dust drifting, micro-bounce settle, hold' : `${hero} continues the action`);
        S.push(`SHOT ${i + 1} (${ts(per * i)}–${ts(per * (i + 1))}) — ${shot}: ${act}.${i < n - 1 ? ' HARD CUT —' : ''}`);
      }
    }
    S.push('TECHNICAL: 24fps, 180° shutter motion blur, no jitter, no aliasing.');
    S.push(`AUDIO: ${o.music ? 'Score allowed under diegetic SFX.' : st.audio}`);
    S.push(`CONSTRAINTS: aspect ${asp}, total ${D}s, ${oner ? 'no cuts' : `exactly ${n} shots`}; no slow-motion except the named beat; ${o.fmt === 'kaiju' ? 'the fight stays at the sea surface and never flies into the air; ' : ''}destruction only in uninhabited terrain.`);
    S.push(`POSITIVE LOCKS: ${refs.length || st.input ? 'reference fidelity 100%; ' : ''}${o.fmt === 'product' ? 'logos read exactly as supplied and stay sharp, product colours locked; ' : ''}${st.hud ? `HUD legible and identical in every shot, accent ${o.hud || '#3CF2FF'} locked; ` : ''}${hero} keeps one identity from first frame to last.`);
    const all = [o.subject, o.beats, o.refs].join(' ');
    const risks = RISK.filter(([re]) => re.test(all)).map(([, t]) => t);
    return { text: S.join('\n'), risks, n, oner };
  }
  CB.DIR.register({
    id: 'prompt-builder', tr: 'Prompt Kurucu', sub: '8 format · kanonik bölüm sırası', group: GROUP,
    render(main, ctx) {
      const o = load('builder', { fmt: 'live', mode: 'multi', dur: 15, shots: 0, aspect: '', subject: '', refs: '', beats: '', hud: '#3CF2FF', music: false });
      const out = el('div', { class: 'dv-out' });
      const run = () => {
        const r = builder(o, ctx);
        out.replaceChildren(
          r.risks.length ? el('div', { class: 'section' }, el('h3', { text: 'İçerik politikası ön kontrolü' }), ...r.risks.map((t) => note('Değiştir: ' + t, 'warn'))) : note('İçerik politikası ön kontrolü temiz: sivil zarar, ateşlenen silah, gore, gerçek IP yok.', 'okk'),
          pcard('Video prompt', `${STYLES[o.fmt].tr} · ${o.dur} sn · ${r.oner ? 'oner' : r.n + ' çekim'}`, r.text, 'STYLE önde, kamera ilk saniyede hareketli, üç derinlik katmanı, fizik satırı, kesmeler zaman kodlu, AUDIO ve oran belirtildi.'));
      };
      const b = binder('builder', o, run);
      head(main, 'Prompt Kurucu', 'Her stil için üretim seviyesinde video promptu: STYLE → SCENE CONTEXT → REFERANSLAR → FORMAT → IŞIK → RENK → KAMERA … → POSITIVE LOCKS. Konum, arka plan sekmesindeki güncel sahneden gelir.');
      main.append(el('div', { class: 'section' }, grid(
        b.sel('fmt', 'Format', Object.entries(STYLES).map(([k, v]) => [k, v.tr])), b.sel('mode', 'Yapı', [['multi', 'Çok çekim (kesmeli)'], ['oner', 'Oner (tek çekim)']]),
        b.num('dur', 'Süre (sn)', 4, 30, 1), b.num('shots', 'Çekim sayısı (0 = stil varsayılanı)', 0, 12, 1),
        b.sel('aspect', 'Oran', [['', 'Seçili oran'], ['16:9', '16:9'], ['9:16', '9:16'], ['2.39:1', '2.39:1'], ['1:1', '1:1']]), b.txt('hud', 'HUD vurgu rengi (oyun)', '#3CF2FF'),
        wide(b.txt('subject', 'Kahraman / özne', 'an original sea titan with barnacled slate hide')),
        wide(b.area('refs', 'Referanslar (bir satıra bir: @image_1 — ne kilitlenir)', 2, '@image_1 — the rider: dark leather coat, silver braid.')),
        wide(b.area('beats', 'Çekim başına aksiyon (bir satıra bir)', 4, 'the rider banks hard between two sea stacks…')),
        b.chk('music', 'Müziğe izin ver'))), out);
      run();
    },
  });

  /* ======================================================================
     4. ZAMAN KODLU ÇOK ÇEKİM (higgsfield-timed-prompts)
     ====================================================================== */
  const blankShot = () => ({ start: 0, end: 3, cam: 'camera at chest height', lens: '28mm', move: 'slow push-in that never stops for a line', who: '', bg: '', action: '', speaker: '', line: '', ls: 0, le: 0, cut: 'hard cut' });
  function seedRows(o, ctx, from) {
    const chars = ctx.chars();
    const lead = chars[0];
    const src = from === 'project' ? projectShots(ctx) : [];
    if (from === 'project' && !src.length) { toast('Projede çekim yok: Arka plan sekmesinde "Projeye ekle" ile sahne ekle.'); return false; }
    const list = src.length ? src : [{ name: scene(ctx).tr, cat: (ctx.cur() || {}).cat, spec: (ctx.cur() || {}).spec }];
    const per = o.dur / list.length;
    o.shots = list.map((s, i) => {
      const sp = s.spec;
      return Object.assign(blankShot(), {
        start: +fx(per * i), end: +fx(per * (i + 1)), lens: sp ? sp.camera.lens : '28mm', cam: sp ? sp.camera.en.split(',')[0] : 'eye-level medium shot',
        who: lead ? `${charHandle(lead)} centre frame` : '', bg: sp ? `${sp.landmarks.center} directly behind, ${sp.landmarks.far} beyond` : '',
        action: s.note || '', loc: sp ? '@loc_' + slug(sp.cat.tr) : '',
      });
    });
    const handles = [...new Set(o.shots.map((s) => s.loc).filter(Boolean))];
    o.assets = [...chars.slice(0, 4).map((c) => `${charHandle(c)} — ${charEn(c)}; take face, hair and clothes; ignore the studio backdrop`),
      ...handles.map((h, i) => `${h} — location plate; take geometry and light; ignore any people in the plate${i === 0 ? '; its camera angle IS the first shot\'s angle' : ''}`)].join('\n');
    return true;
  }
  function timedPrompt(o) {
    const sh = o.shots;
    const assets = lines(o.assets);
    const known = new Set(assets.map((a) => (a.match(/^@\w+/) || [''])[0]).filter(Boolean));
    const used = new Set((sh.map((s) => [s.cam, s.who, s.bg, s.action, s.loc].join(' ')).join(' ') + ' ' + o.look + ' ' + o.chars).match(/@\w+/g) || []);
    const issues = [];
    if (sh.length && Math.abs(sh[0].start) > 0.001) issues.push([false, `İlk çekim 0'da başlamıyor (${sh[0].start})`]);
    sh.forEach((s, i) => {
      if (s.end <= s.start) issues.push([false, `Çekim ${i + 1}: bitiş başlangıçtan büyük olmalı`]);
      if (i && Math.abs(sh[i - 1].end - s.start) > 0.001) issues.push([false, `Çekim ${i} bitişi (${sh[i - 1].end}) ≠ çekim ${i + 1} başlangıcı (${s.start})`]);
      if (!s.bg) issues.push([false, `Çekim ${i + 1}: BACKGROUND boş`]);
      if (s.line && (s.ls < s.start || s.le > s.end || s.le < s.ls)) issues.push([false, `Çekim ${i + 1}: replik zamanı (${s.ls}–${s.le}) çekim aralığı dışında`]);
    });
    const last = sh.length ? sh[sh.length - 1].end : 0;
    const okDur = Math.abs(last - o.dur) < 0.001;
    const missing = [...used].filter((h) => !known.has(h));
    const checksList = [
      [!issues.length, issues.length ? `${issues.length} zaman kodu sorunu` : 'Zaman kodları bitişik (end_i = start_i+1)'],
      [okDur, `Son bitiş ${last} sn = toplam ${o.dur} sn`],
      [!missing.length, missing.length ? `REFERENCES'ta olmayan handle: ${missing.join(', ')}` : 'Tüm @handle\'lar REFERENCES listesinde'],
      [sh.every((s) => s.bg), 'Her çekimde BACKGROUND var'],
      ...issues,
    ];
    const spoken = sh.filter((s) => s.line);
    const P = [];
    P.push(o.logline || `${o.dur}-second ${o.aspect} clip, ${sh.length} shots, hard cuts on action.`);
    if (o.mid) P.push(o.mid);
    P.push('', 'REFERENCES', ...(assets.length ? assets : ['@loc_scene — location plate; take geometry and light; ignore people in the plate.']));
    P.push('', 'LOOK', o.look || 'Wide 24–28 mm lenses for energy, clean modern digital cinema look, deep clean blacks, punchy contrast, saturated like the location references.');
    if (o.chars.trim()) P.push('', 'CHARACTERS', ...lines(o.chars));
    if (o.props.trim()) P.push('', ...lines(o.props));
    if (o.where.trim()) P.push('', 'WHERE EVERYONE IS — fixed for the whole clip', ...lines(o.where));
    if (o.behind.trim()) P.push('', 'WHAT IS BEHIND EACH OF THEM — so they land in the right seats', ...lines(o.behind));
    P.push('', 'SHOTS');
    sh.forEach((s, i) => {
      const first = i === 0 ? `THE VERY FIRST FRAME OF THE CLIP IS THIS${s.loc ? `, exactly the angle of ${s.loc}` : ''}. ` : '';
      const line = s.line ? ` ${fx(s.ls)}–${fx(s.le)}s, ${s.speaker || 'the speaker'}: "${s.line}"` : '';
      const cut = i < sh.length - 1 ? ` ${cap(s.cut || 'hard cut')} on the last frame — no dissolve, no flash, no morph.` : ' The clip ends on this frame.';
      P.push(`${fx(s.start)}–${fx(s.end)}s — ${first}${cap(s.cam)}, ${s.lens}, ${s.move}. ${s.who ? cap(s.who) + '.' : ''} BACKGROUND: ${s.bg || '[what is behind each visible person]'}. ${s.action ? cap(s.action) + '.' : ''}${line}${cut}`.replace(/\s+/g, ' ').trim());
    });
    P.push('', 'SOUND', o.sound || 'No score, no stings, no whooshes; diegetic sound only. Ambience changes on the exact cut frames.');
    if (spoken.length) {
      P.push('Clean, close, professional studio dialogue recording on a professional studio microphone — dry, no echo, no noise; the microphone never appears in frame.');
      P.push('Lines, each spoken exactly once and nothing else: ' + spoken.map((s) => `${fx(s.ls)}s ${s.speaker || 'Speaker'} "${s.line}"`).join(' · ') + '.');
      P.push('No added words, interjections, laughter, humming or added background score.');
    }
    const kc = lines(o.keep);
    P.push('', 'KEEP CONSISTENT', ...(kc.length ? kc : [
      'Faces and clothes exactly as the references in every frame.',
      'Everyone keeps the place of their first shot within a location.',
      `The clip opens on the first shot described, never on a close-up.`,
      'The camera never stops for a line.',
      ...sh.slice(0, -1).map((s, i) => `${fx(s.end)}s is a ${s.cut || 'hard cut'}; nothing else changes on that frame.`),
    ]));
    return { text: P.join('\n'), checks: checksList };
  }
  function reframePrompt(o, target) {
    const [W, H] = target === '1:1' ? [1080, 1080] : [1080, 1920];
    const band = Math.round((H - W * 9 / 16) / 2);
    const sh = o.shots;
    return [
      `GENERATIVE REFRAME 16:9 → ${target} … Outpainting only.`,
      `INPUT @final_${slug(o.name || 'edit')} — ${o.dur} s, 1920×1080, 24 fps, ${sh.length} shots, finished sound.`,
      `OUTPUT ${W}×${H}, 24 fps, exactly ${o.dur} s, same cut points (${sh.slice(0, -1).map((s) => fx(s.end) + ' s').join(', ') || 'none'}). Audio: source track passed through — no generated sound.`,
      `HOW THE FRAME IS BUILT — TOP AND BOTTOM ONLY: fit the entire source uniformly to the output width (${W}×${Math.round(W * 9 / 16)}), left and right edges aligned to the output; zero pixels generated on the sides; keep that fixed scale and exact vertical centre in every frame, with no crop, animated zoom or repositioning; the middle band contains the complete source picture; two equal bands of ${band} px above and below. The composition of the original shot IS the composition of the output. Seams invisible. No zoom, crop, pan-and-scan.`,
      'RULES FOR THE GENERATED BANDS — environment only; no new people, hands, faces, animals, food, phones, screens, text or logos; no duplicates of existing objects; bodies cut by the edge continue as clothing only; wide-lens perspective; camera moves carried with parallax; hard cuts hard on the same frame; colour stays saturated.',
      'SHOT BY SHOT —', ...sh.map((s, i) => `Shot ${i + 1} (${fx(s.start)}–${fx(s.end)} s): ABOVE: ${/int|room|hall|inside/i.test(s.bg) ? 'ceiling continuing the room' : 'sky continuing the location light'}. BELOW: floor and ground continuing ${s.bg ? s.bg.split(',')[0] : 'the set'}. ${s.who ? cap(s.who.split(' ')[0]) + ' stays a single figure.' : ''}`),
      'AUDIO — NOTHING IS GENERATED: source track only; no music, ambience, foley, voices or effects; silence is preferable to any new sound.',
      'KEEP CONSISTENT — same cut frames, same scale and centre in every frame.',
    ].join('\n');
  }
  CB.DIR.register({
    id: 'timed', tr: 'Zaman Kodlu Çok Çekim', sub: 'Higgsfield · Seedance 2.5 · doğrulama', group: GROUP,
    render(main, ctx) {
      const o = load('timed', { name: '', dur: 15, aspect: '16:9', logline: '', mid: '', assets: '', look: '', chars: '', props: '', where: '', behind: '', sound: '', keep: '', shots: [] });
      if (!o.shots.length) seedRows(o, ctx, 'current');
      const out = el('div', { class: 'dv-out' });
      const rowsBox = el('div', { class: 'dv-rows' });
      const run = () => {
        const r = timedPrompt(o);
        out.replaceChildren(el('div', { class: 'section' }, el('h3', { text: 'Doğrulama' }), checks(r.checks)),
          pcard('Zaman kodlu prompt', `${o.dur} sn · ${o.shots.length} çekim · ${o.aspect}`, r.text, 'Tam prompt teslim edilir, fark değil. Repliklerin kelimeleri ve sırası değişmez; her biri bir kez söylenir.'),
          el('details', { class: 'dv-details' }, el('summary', { text: 'Reframe / outpaint (16:9 → 9:16 / 1:1)' }),
            pcard('Reframe 9:16', 'bant hesabı: 656 px', reframePrompt(o, '9:16')), pcard('Reframe 1:1', 'bant hesabı: 236 px', reframePrompt(o, '1:1'))));
      };
      const b = binder('timed', o, run);
      const drawRows = () => {
        rowsBox.replaceChildren(...o.shots.map((s, i) => {
          const up = (k, v, num) => { s[k] = num ? parseFloat(v) || 0 : v; keep('timed', o); run(); };
          const n = (k, w) => { const x = el('input', { type: 'number', step: '0.1', value: String(s[k]), class: 'dv-n', 'aria-label': k, style: w ? `width:${w}` : null }); x.addEventListener('input', () => up(k, x.value, true)); return x; };
          const t = (k, ph) => input(`dv-t${k}${i}`, s[k], (v) => up(k, v), ph);
          return el('div', { class: 'dv-shot' },
            el('div', { class: 'dv-shot-h' }, el('b', { text: `Çekim ${i + 1}` }), n('start'), el('span', { text: '–' }), n('end'), el('span', { text: 'sn' }),
              btn('↑', () => { if (i) { [o.shots[i - 1], o.shots[i]] = [o.shots[i], o.shots[i - 1]]; keep('timed', o); drawRows(); run(); } }),
              btn('✕', () => { o.shots.splice(i, 1); keep('timed', o); drawRows(); run(); })),
            grid(field('Kamera konumu', t('cam')), field('Lens', t('lens')), wide(field('Hareket (çekim boyunca)', t('move'))),
              wide(field('Kim nerede (bu karede)', t('who', '@char_x centre frame, @char_y out of frame'))),
              wide(field('BACKGROUND (arkada ne var)', t('bg', 'the plaster wall with the green shutters directly behind her'))),
              wide(field('Aksiyon vuruşları (zaman kodlu)', t('action', '11.1–11.45s her eyes scan the screen'))),
              field('Konuşan', t('speaker')), wide(field('Replik (sabit metin)', t('line'))),
              field('Replik başı', n('ls')), field('Replik sonu', n('le')), field('Geçiş', t('cut', 'hard cut / MATCH CUT on the tap')), field('Konum handle', t('loc', '@loc_x'))));
        }));
      };
      head(main, 'Zaman Kodlu Çok Çekim', 'Reklam ve kısa anlatı için zaman kodlu prompt: önce geometri, sonra aksiyon. Her çekim kendi içinde tam (kamera → kim nerede → arka plan → aksiyon → ışık). Zaman kodları ve replikler otomatik doğrulanır.');
      main.append(el('div', { class: 'section' }, grid(
        b.txt('name', 'Proje adı'), b.num('dur', 'Toplam süre (sn)', 2, 60, 0.5), b.sel('aspect', 'Oran', [['16:9', '16:9'], ['9:16', '9:16'], ['1:1', '1:1'], ['2.39:1', '2.39:1']]),
        wide(b.txt('logline', 'Logline (süre, oran, ne oluyor, kesme numarası)')), wide(b.txt('mid', '"Opens mid-situation…" (önceki klibin devamıysa)')),
        wide(b.area('assets', 'REFERENCES: @dosya_adi — ne alınır / ne yok sayılır', 3)), wide(b.area('look', 'LOOK paragrafı', 2)),
        wide(b.area('chars', 'CHARACTERS: İsim — 2–3 özellik + konuşma + bir davranış kuralı', 2)),
        wide(b.area('props', 'PROP RULE(S)', 2, 'PHONE RULE: screen never shown, red back to camera…')),
        wide(b.area('where', 'WHERE EVERYONE IS (saat kadranı ya da ekran sol/orta/sağ)', 2)), wide(b.area('behind', 'WHAT IS BEHIND EACH OF THEM', 2)),
        wide(b.area('sound', 'SOUND politikası / ambiyans', 2)), wide(b.area('keep', 'KEEP CONSISTENT (boş = otomatik)', 3)))),
      el('div', { class: 'section' }, el('h3', { text: 'Çekimler' }),
        el('div', { class: 'row' }, btn('＋ Çekim ekle', () => { const l = o.shots[o.shots.length - 1]; const s = blankShot(); s.start = l ? l.end : 0; s.end = +(s.start + 3).toFixed(1); o.shots.push(s); keep('timed', o); drawRows(); run(); }),
          btn('Projeden doldur', () => { if (seedRows(o, ctx, 'project')) { keep('timed', o); main.replaceChildren(); this.render(main, ctx); } }),
          btn('Güncel arka plandan', () => { seedRows(o, ctx, 'current'); keep('timed', o); main.replaceChildren(); this.render(main, ctx); }),
          btn('Zamanları eşit böl', () => { const per = o.dur / Math.max(1, o.shots.length); o.shots.forEach((s, i) => { s.start = +fx(per * i); s.end = +fx(per * (i + 1)); }); keep('timed', o); drawRows(); run(); })),
        rowsBox), out);
      drawRows(); run();
    },
  });

  /* ======================================================================
     5. SHOTLIST HTML (seedance-shotlist-director)
     ====================================================================== */
  const PREFIX = `Style: 8K IMAX. Photorealistic — no 3D render, no game engine.
Lighting: Natural light only — contre-jour backlight, camera on shadow side, atmospheric haze throughout. Key light from sky and windows only. No artificial lightning.
Color: 60:30:10 — dominant / secondary / accent.
Camera: Physical cine lens. 180° shutter motion blur.
Skin: Pore-level realism — vellus hair, asymmetric moles, capillary flush, pore-shadow matching on-set light.
Acting: Hollywood — micro-pauses before reactions, precise eye-line, living eyes with catch-lights, chest rise from breathing. Characters never standing, always reacting.
Physics: Gravity and inertia respected — mass has real weight, correct contact shadows. No floating props.
Composition: Rule of thirds + golden ratio. Every person moving from frame one.
Continuity: Characters, props, environment identical across every cut. No identity drift.
Technical: 24fps smooth motion. 8K detail. No jitter.
Audio: Environmental SFX only. No music. No subtitles.`;
  function shotlistScenes(o, ctx) {
    let src = [];
    if (o.src === 'project') src = projectShots(ctx);
    else if (o.src === 'concept') { const k = (CB.CONCEPTS || [])[o.concept | 0]; if (k) src = conceptShots(k, o.seed || 1); }
    if (!src.length) { const c = ctx.cur() || {}; if (c.spec) src = [{ name: c.cat.tr, note: '', cat: c.cat, spec: c.spec }]; }
    const chars = ctx.chars();
    const lead = chars[0];
    const who = lead ? (lead.name || 'the lead').toUpperCase() : 'THE LEAD';
    const anchors = o.anchors.trim() || (chars.length ? chars.slice(0, 3).map((c) => `${(c.name || 'LEAD').toUpperCase()} — ${charEn(c)}, the same wardrobe and hair in every frame, carrying forward the state of the previous scene.`).join('\n') : `${who} — an original character, same wardrobe and hair in every frame.`);
    const per = Math.max(1, o.per | 0);
    return src.map((s, i) => {
      const sp = s.spec, lm = sp.landmarks;
      const act = P(s.note || (s.sh && s.sh.act) || `${who.toLowerCase()} crosses the space toward ${lm.center}`, lead ? lead.name : 'the lead');
      const prompts = Array.from({ length: per }, (_, k) => {
        const tag = per > 1 ? `${i + 1}${'abc'[k]}` : `${i + 1}`;
        const body = [
          'Characters:', anchors, '',
          'Scene:', `${cap(CB.locText(sp.cat))}, ${sp.time.en.split(',')[0]}, ${sp.weather.en}. ${who} stands near ${lm.center}, ${lm.left} on camera-left, ${lm.right} on camera-right, ${lm.far} far behind. ${k ? 'Continuing directly from the previous prompt: same positions, same light, same emotional state.' : ''}`.trim(), '',
          `CUT 1 — Wide, ${sp.camera.lens}, ${sp.camera.en.split(',')[0]}, slow motivated move:`,
          `${k ? 'The beat continues.' : cap(act) + '.'} ${who} is already in motion from the first frame; breath visible, weight shifting. Contre-jour key from ${sp.time.sun > 0.3 ? 'the low sun' : 'the brightest window or sky'} behind, haze catching it. Diegetic sound: ${sp.weather.en.split(',')[0]}.`, '',
          'CUT 2 — Medium, 50mm, eye-level, slow push-in:',
          `${who}'s eyes find something off-screen — a micro-pause before the reaction, jaw tightens once, chest rise from breathing. The camera pushes from waist to chest as the realisation lands.`, '',
          'CUT 3 — Close, 85mm, static, contre-jour:',
          `A single slow blink, the eye-line holds on ${lm.far}. The hands stay busy with the small task they carried into the scene. The light flares softly at the edge of frame. Hold the silence to the end of the 15 seconds.`,
        ].join('\n');
        return { tag, text: o.prefix + '\n\n' + body };
      });
      return { n: i + 1, desc: `${s.name}${s.note ? ' — ' + P(s.note, lead ? lead.name : 'the lead').slice(0, 90) : ''}`, prompts };
    });
  }
  function shotlistHTML(title, prefix, scenes) {
    const css = `:root{--bg:#0e0e10;--panel:#17171a;--panel-2:#1d1d21;--border:#2a2a30;--text:#e8e8ea;--text-dim:#9a9aa2;--accent:#d4a259;--done:#4ade80}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;line-height:1.5;padding:32px 24px 80px}.container{max-width:980px;margin:0 auto}h1{font-size:28px;font-weight:600;margin:0 0 4px;letter-spacing:-.02em}.subtitle{color:var(--text-dim);font-size:14px;margin-bottom:32px}.howto{background:var(--panel);border:1px solid var(--border);border-radius:8px;padding:14px 18px;font-size:13px;color:var(--text-dim);margin-bottom:24px}details.style-prefix{background:var(--panel);border:1px solid var(--border);border-radius:8px;padding:14px 18px;margin-bottom:32px}details.style-prefix summary{cursor:pointer;font-weight:600;color:var(--accent);user-select:none}details.style-prefix pre{margin:14px 0 0;padding:14px;background:var(--panel-2);border-radius:6px;font-family:"SF Mono",Menlo,Consolas,monospace;font-size:12.5px;white-space:pre-wrap;color:var(--text)}.scene{background:var(--panel);border:1px solid var(--border);border-radius:10px;padding:20px 22px;margin-bottom:18px}.scene-header{display:flex;align-items:flex-start;gap:12px;margin-bottom:14px}.scene-header input[type="checkbox"]{width:20px;height:20px;margin-top:2px;accent-color:var(--done);cursor:pointer;flex-shrink:0}.scene-num{font-size:18px;font-weight:700;color:var(--accent);min-width:56px}.scene-desc{font-size:15px;color:var(--text);flex:1}.scene.done .scene-desc{text-decoration:line-through;color:var(--text-dim)}.prompt-block{background:var(--panel-2);border:1px solid var(--border);border-radius:6px;margin-top:12px;overflow:hidden}.prompt-label{display:flex;justify-content:space-between;align-items:center;padding:8px 14px;background:rgba(255,255,255,.02);border-bottom:1px solid var(--border);font-size:12px;color:var(--text-dim);text-transform:uppercase;letter-spacing:.05em}.copy-btn{background:transparent;color:var(--accent);border:1px solid var(--border);border-radius:4px;padding:4px 10px;font-size:11px;cursor:pointer;text-transform:uppercase;letter-spacing:.05em;font-family:inherit}.copy-btn:hover{border-color:var(--accent)}.copy-btn.copied{color:var(--done);border-color:var(--done)}pre.prompt{margin:0;padding:14px 16px;font-family:"SF Mono",Menlo,Consolas,monospace;font-size:12.5px;white-space:pre-wrap;color:var(--text)}`;
    const js = `document.querySelectorAll('.scene input[type="checkbox"]').forEach(cb=>{const key='shotlist-scene-'+cb.dataset.scene+'-done';try{if(localStorage.getItem(key)==='1'){cb.checked=true;cb.closest('.scene').classList.add('done');}}catch(e){}cb.addEventListener('change',()=>{try{localStorage.setItem(key,cb.checked?'1':'0');}catch(e){}cb.closest('.scene').classList.toggle('done',cb.checked);});});document.querySelectorAll('.copy-btn').forEach(btn=>{btn.addEventListener('click',()=>{const pre=btn.closest('.prompt-block').querySelector('pre.prompt');navigator.clipboard.writeText(pre.textContent).then(()=>{btn.classList.add('copied');const o=btn.textContent;btn.textContent='Copied';setTimeout(()=>{btn.classList.remove('copied');btn.textContent=o;},1500);});});});`;
    const body = scenes.map((s) => `<div class="scene">
  <div class="scene-header">
    <input type="checkbox" data-scene="${s.n}">
    <div class="scene-num">${s.n}.</div>
    <div class="scene-desc">${esc(s.desc)}</div>
  </div>
${s.prompts.map((p) => `  <div class="prompt-block">
    <div class="prompt-label">
      <span>Prompt ${p.tag} · 15s</span>
      <button class="copy-btn">Copy</button>
    </div>
    <pre class="prompt">${esc(p.text)}</pre>
  </div>`).join('\n')}
</div>`).join('\n\n');
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} — Director's Shotlist</title>
<style>${css}</style>
</head>
<body>
<div class="container">
  <h1>${esc(title)}</h1>
  <div class="subtitle">Director's Shotlist · Seedance 2.0</div>
  <div class="howto">Tick scenes as you finish them — your progress saves automatically. Click the Copy button on any prompt to grab the full text (Style Prefix + Characters + Scene + Cuts). Want changes? Tell Claude what to revise and the file updates.</div>
  <details class="style-prefix">
    <summary>Global Style Prefix (applied to every prompt)</summary>
    <pre>${esc(prefix)}</pre>
  </details>

${body}
</div>
<script>${js}<\/script>
</body>
</html>`;
  }
  CB.DIR.register({
    id: 'shotlist', tr: 'Shotlist HTML', sub: 'Seedance 2.0 · 15 sn · onay kutulu', group: GROUP,
    render(main, ctx) {
      const o = load('shotlist', { title: '', src: 'project', concept: 0, seed: 1, per: 1, prefix: PREFIX, anchors: '' });
      const out = el('div', { class: 'dv-out' });
      const run = () => {
        const sc = shotlistScenes(o, ctx);
        const title = o.title || (ctx.project() || {}).name || 'Untitled';
        const html = shotlistHTML(title, o.prefix, sc);
        out.replaceChildren(
          note(o.src === 'project' && !projectShots(ctx).length ? 'Projede çekim yok: güncel arka plan tek sahne olarak kullanıldı.' : `${sc.length} sahne · ${sc.reduce((a, s) => a + s.prompts.length, 0)} prompt (her biri 15 sn).`, o.src === 'project' && !projectShots(ctx).length ? 'warn' : ''),
          el('div', { class: 'row' }, btn('⤓ shotlist.html indir', () => saveText(html, `shotlist_${slug(title)}.html`, 'text/html;charset=utf-8'), 'primary'), btn('HTML\'i kopyala', () => copy(html, 'Shotlist HTML'))),
          ...sc.slice(0, 12).flatMap((s) => s.prompts.map((p) => pcard(`Prompt ${p.tag}`, s.desc.slice(0, 60), p.text))));
      };
      const b = binder('shotlist', o, run);
      head(main, 'Shotlist HTML', 'Yönetmen shotlist\'i: Style Prefix bloğu, numaralı sahneler, sahne başına onay kutusu (tarayıcıda saklanır), her prompt 15 saniye ve CUT bloklarıyla. Proje storyboard\'undan ya da bir yarışma konseptinden kurulur.');
      main.append(el('div', { class: 'section' }, grid(
        b.txt('title', 'Proje adı'), b.sel('src', 'Kaynak', [['project', 'Proje storyboard\'u'], ['concept', 'Yarışma konsepti'], ['current', 'Güncel arka plan']]),
        b.sel('concept', 'Konsept', (CB.CONCEPTS || []).map((k, i) => [String(i), `${k.tr} (${k.f})`])), b.num('seed', 'Konsept tohumu', 1, 9999, 1),
        b.sel('per', 'Sahne başına prompt', [['1', '1 (15 sn)'], ['2', '2 (a, b)'], ['3', '3 (a, b, c)']]),
        wide(b.area('anchors', 'Karakter çapaları (boş = karakter stüdyosundan)', 2)),
        wide(b.area('prefix', 'Style Prefix (aynen her prompt\'un başına)', 6)))), out);
      run();
    },
  });

  /* ======================================================================
     6. CINEDANCE BLOKLARI
     ====================================================================== */
  const CD = [{"code": "FACE", "title": "Karima's face lock", "cat": "CHARACTER", "text": "KARIMA — FACE LOCK, EXACT FEATURES\n\nReferences control the frontal face and the profile 100%. Zero drift. The same individual in every panel and every frame. If any feature listed below contradicts what the generator wants to produce, the reference and this description win.\n\nEthnicity and overall read. A young Kazakh woman of Central Asian appearance, 20 years old. Softly built features — nothing sharp, nothing chiselled, nothing angular. The face reads gentle and rounded, with the visual weight sitting low, in the cheeks and the mouth.\n\nFace shape. A soft oval tending toward round. Widest across the cheekbones, which are broad, high-set and softly padded rather than sculpted. From the cheekbones the face tapers smoothly to a narrow lower face. The jawline is soft and unemphatic with a gently rounded angle — not a defined V, no hollow under the cheekbone. The chin is small, short and softly rounded, no cleft, no point.\n\nForehead and hairline. Moderately high, gently rounded, smooth even curve, no strong brow ridge. The hairline is softly rounded with fine baby hairs feathering at the temples and above the centre of the forehead.\n\nEyes. Almond-shaped, moderately spaced, sitting fairly level. The eye opening is modest in height and elongated horizontally. A clear but shallow upward tilt to the outer corners — the outer canthus sits slightly higher than the inner. A soft partial epicanthic fold covers the inner corner of each eye, so the inner canthus is gently hooded rather than open and pointed. The upper lid has only a shallow, low, partially hidden crease that disappears toward the inner corner — close to a low double lid, never a deep Western crease. The lid surface between crease and lashes is smooth and slightly full. A soft fullness sits directly beneath each lower lash line — a natural low-key under-eye pad, giving warm youthful softness rather than a hollow. Irises deep warm brown, nearly black-brown at the pupil edge, lifting to slightly lighter brown at the outer ring, with a defined dark limbal ring. Lashes dark, thick, long, naturally upward-curling, denser on the upper lid, thinner visible lower lash line. No eyeliner, no mascara clumps, no extensions.\n\nBrows. Full, thick, naturally dense, dark brown with a slightly cooler tone than the hair. They sit LOW, close to the eye, which contributes strongly to her calm, level expression. Nearly straight with only a gentle rise toward the outer third — no high arch, no sharp peak. Inner ends fuller, slightly diffuse, softly feathered upward; the tail tapers and thins just past the outer corner. Individual hairs visible, growing in irregular directions. Unshaped, ungroomed, no drawn or filled outline.\n\nNose. Small to medium and soft. The bridge is LOW and broad, sitting close to the plane of the face with only a slight rise between the eyes — the nasal root is shallow and wide. From the front the dorsum reads as a wide, gently defined soft column rather than a narrow ridge, broadening toward the tip. The tip is rounded, softly bulbous and slightly upturned, with a small amount of definition but no point. Nostrils moderately wide with rounded, slightly flared alae and a soft alar crease. In true profile the line from brow to tip is nearly straight with a very shallow, barely perceptible depression at the bridge, then a gentle convex curve into the tip, which sits at a slightly upward-rotated angle. Short columella, slightly open nasolabial angle.\n\nMouth — a defining feature. Notably full lips, prominent in the face. The lower lip is markedly fuller and deeper than the upper, with a rounded, softly everted body and a well-padded centre. The upper lip is shorter in height but still full, with a soft, low, gently defined cupid's bow — two low rounded peaks with a shallow notch, never sharp, never overdrawn. The vermilion border is soft and slightly diffuse rather than crisply outlined. The philtrum is short with two shallow ridges. Mouth width moderate — it does not extend past the pupil lines. Corners sit level at rest, tucking in with small soft indentations. Natural warm rose-pink, deeper toward the centre, more diffuse at the edges, with a faint natural sheen on the lower lip only. Fine vertical lip texture. No lipstick, no gloss, no liner, no filler-look overinflation.\n\nMid-face and profile. The mid-face is relatively flat and soft in profile, with modest forward projection of the mouth region and only slight projection at the nose tip. The lips sit a little forward of the chin line, so the lower face reads gently convex. Short distance from nose base to upper lip, and from lower lip to chin — a compact, youthful lower third.\n\nEars. Small, close-set, rounded helix, small attached-to-slightly-free lobe. Multiple piercings: several small thin silver hoops in the lobe and lower helix, worn together on each ear. Present but never emphasised.\n\nSkin. Warm light-to-medium tone with a neutral-to-slightly-olive undertone and a genuine soft flush across the cheekbones and nose. Real texture throughout: visible pores across the nose, inner cheeks and chin; slight natural unevenness in tone; a scatter of small faint freckle-like marks across the cheeks and the bridge of the nose; one or two very small blemishes, low-contrast; faint fine down on the outer cheek and along the jaw catching backlight. Slight natural shine on the nose tip, the centre of the forehead and the chin — never a full matte finish, never a plastic gloss. No airbrushing, no skin smoothing, no digital blur, no porcelain surface, no dewy filter.\n\nNeck and shoulders. Slender neck of moderate length with a soft sternocleidomastoid line visible only when the head turns, and a shallow hollow at the base of the throat. Narrow, sloping shoulders, no visible muscularity.\n\nExpression at rest. Level, quiet, unperformed. The low brows and modest eye aperture give a naturally calm, slightly serious neutral, with the fullness of the mouth keeping it soft rather than stern. Any smile is closed-mouth and very small — a few millimetres of lift at the corners at most, more readable in a slight narrowing of the eyes than in the lips.\n\nFACE BANS. No Westernised features: no high narrow nasal bridge, no deep double eyelid crease, no large round wide-open eyes, no sharp chiselled jawline, no high sculpted cheekbones with a hollow beneath. No K-pop or idol styling: no thin over-plucked high-arched brows, no aegyo-sal exaggeration, no pointed V-line chin, no doll eyes, no glass skin. No age drift — she is 20, not a teenager and not thirty. No thinning of the lips, no cartoonish over-inflation. No makeup of any kind. No face-slimming, no eye-enlarging, no nose-narrowing, no jaw-sharpening. No AI-typical symmetry — her face is slightly asymmetric and must stay that way: one brow marginally higher, one eye marginally narrower, the mouth's corners not perfectly matched. No changed ethnicity, no ambiguous mixed-European read, no generic Asian model face."}, {"code": "BODY", "title": "proportions", "cat": "CHARACTER", "text": "Karima, 20 years old, Kazakh-Asian, 163 cm, slim slender build with real adult proportions — head roughly one-seventh of total height, legs roughly half total height, long thigh and long shin, narrow shoulders, natural waist. Not a doll, not chibi, not elongated, not stretched. Weight always readable through her points of contact with the ground or the seat."}, {"code": "MODEST", "title": "coverage", "cat": "CHARACTER", "text": "The neckline stays high and fully closed in every frame. No décolletage, no cleavage, no bare shoulders, no off-shoulder line, no cut-outs, no crop top, no bare midriff, no sheer fabric over skin, no visible undergarments, no body outline showing through the cloth, no suggestive framing. Hems never rise above the knee."}, {"code": "TASK", "title": "a small activity", "cat": "CHARACTER", "text": "The character has one small ongoing physical task that she does not abandon at any point, including during the main event of the shot. She continues it while looking, while reacting, while being interrupted. The task is mundane and unglamorous, and it is never the subject of the shot — it simply keeps running underneath everything else. Her reaction to the event is smaller than her commitment to the task."}, {"code": "CAM-HANDHELD", "title": "handheld filming that can be felt", "cat": "CAMERA", "text": "CAMERA — HANDHELD, AND IT MUST BE FELT\n\nEvery frame is shot by a real person holding a real camera in their hands. No tripod, no gimbal, no stabiliser, no rig, no dolly, no crane, no drone. The handheld character must be clearly and continuously visible — if any second looks locked off or smoothly stabilised, it is wrong.\n\nBaseline, present in every frame:\n\n- Continuous low-frequency wander of roughly 8–14 pixels in both axes, drifting in slow irregular arcs, never repeating and never returning to exactly the same position.\n- On top of it, a fine high-frequency tremble of 2–4 pixels at roughly 6–9 Hz — the constant micro-shake of muscle holding weight.\n- A slow breathing cycle: a 3–5 pixel vertical rise and fall on roughly a four-second period.\n- A slow roll: the horizon drifts one to two degrees off level and back, never sitting perfectly straight.\n- The frame never holds still for longer than about half a second before something moves it.\n\nOperator behaviour that must be visible:\n\n- Weight shifts — two or three per shot, each producing a 10–15 pixel lateral drift and a correction back. One is bigger and comes with a slight dip.\n- Late reframes — the camera responds a beat AFTER the subject moves, overshoots slightly, pulls back. It never anticipates.\n- Footstep bounce — during any walking move, each step gives a small vertical jolt and a brief tilt, so the move carries a walking rhythm rather than a glide.\n- Imperfect starts and stops — every move begins with a small hesitation, has an uneven middle with one brief stall, and ends with a settle that takes a moment to stop wobbling.\n- Breath-holds — during the most important beat the operator holds their breath: the wander drops to about half amplitude while the fine tremble slightly increases, then a released breath produces a visible small vertical drop.\n- Focus that hunts — a human focus puller. Racks arrive a fraction late and make one correction past-and-back, passing through a real transitional beat where nothing is sharp.\n- Wind or impact on the camera — two or three sharper 5–8 pixel jolts across the piece.\n\nForbidden: no zooms, no whip pans, no dolly track, no crane, no orbit, no drone, no digital-stabilisation look, no perfectly smooth arc, no locked-off frame, no snap focus, no camera move that arrives exactly on the beat."}, {"code": "CAM-LIVING-TRIPOD", "title": "a tripod shot with subtle life", "cat": "CAMERA", "text": "A single fixed camera position, locked, level horizon. The framing does not change — no zoom, no push, no pan, no tilt, no dolly, no crane, no orbit.\n\nThe camera is not dead-still but barely alive: a very faint slow organic drift of roughly 2–3 pixels of low-frequency wander with an almost imperceptible micro-tremble, plus a slow breathing rhythm in the vertical. A locked-off tripod shot with a tiny amount of real-world life in it, never handheld, never calling attention to itself. Focus holds and breathes only a hair."}, {"code": "CAM-RIG", "title": "camera attached to an object", "cat": "CAMERA", "text": "THE RIG — THIS IS THE WHOLE IDEA OF THE SHOT: the camera is CLAMPED PHYSICALLY TO [OBJECT] itself, on a short arm, WIDE-ANGLE LENS, mounted just behind it and looking forward past it. IT MOVES WITH [OBJECT] AS ONE RIGID BODY.\n\nTherefore: [OBJECT] DOES NOT MOVE WITHIN THE FRAME AT ALL. It sits in EXACTLY the same position in the frame for every single frame of the shot — locked, nailed, immobile. The hand gripping it is ALSO LOCKED IN FRAME, entering from the same corner and never shifting.\n\nINSTEAD, THE WORLD MOVES. Every movement of the arm is expressed as the environment SWINGING, SLIDING and RUSHING behind the stationary object. When she moves it across the room, the entire room WHEELS AND RUSHES ACROSS THE FRAME. When she lowers it to a surface, the SURFACE COMES RUSHING UP TO MEET IT from below and stops dead beneath it.\n\nTHE LOOK: wide-angle, roughly 18 mm, held very close. The object is HUGE in the near foreground and slightly stretched by the lens. DEEP FOCUS: everything sharp from the near object to the far wall. The opposite of a macro — no shallow depth, no dissolved background, no isolation.\n\nBANS SPECIFIC TO THIS RIG: no object moving within the frame, no object drifting in frame, no object leaving frame, no shifting grip position in frame, no camera following the object from outside, no handheld coverage of the object, no orbiting it, no macro, no shallow depth, no blurred background, no isolated object on a soft background, no telephoto, no static background, no still world behind the object, no world staying still while the object moves."}, {"code": "CAM-POV", "title": "camera = object", "cat": "CAMERA", "text": "THE ONE ABSOLUTE RULE: NO DEVICE IS EVER VISIBLE IN FRAME.\n\nWe are not filming [OBJECT]. We are seeing through one. There is no [OBJECT], no rectangle, no glowing thing anywhere in the picture. Nobody is filmed holding it. There is no third-person angle, no shot from outside. The lens IS the object: it lies where the object lies, it is picked up, it is looked into — and we only ever see the results of that, never the thing itself. If it appears anywhere in the picture, the shot is wrong.\n\nEverything that happens to the object happens to the frame: when it is knocked, the WHOLE FRAME JUDDERS; when it vibrates, the whole view creeps sideways a few millimetres at a time; when it is lifted, the whole world swings in a fast motion-blurred arc and settles.\n\nBANS: no device visible, no product shot, no third-person view, no shot from outside, no wide shot of the space, no cutaway, no reverse angle, no camera leaving the point of view."}, {"code": "CAM-PULLBACK-TURN", "title": "macro → pull-back → turn to the face", "cat": "CAMERA", "text": "One continuous handheld take in three stages, no cut between them.\n\nStage one — macro hold. The frame is filled by the detail, shallow depth, heavy breath-hold character in the handheld.\n\nStage two — the pull-back. The camera draws back, a short modest retreat with visible walking bounce, revealing in stages: the whole object, then its edges, then its support, then the environment blooming into frame around it in soft bokeh. Focus stays on the near plane; the background resolves out of bokeh as the camera retreats.\n\nStage three — the turn. Without cutting, the camera ROTATES — a pan, the operator pivoting on the spot rather than travelling, swinging off the object and around onto her. Her shoulder comes in, then her arm, then her FACE arrives and the camera settles. The pan is not mechanical: a small hesitation at the start, an accelerating middle, a brief overshoot of a few degrees past her, and a correction back. Focus racks with it through a genuine transitional beat where neither plane is sharp, arriving on her eyes a fraction late and settling with one small hunt."}, {"code": "CAM-OVER-SHOULDER", "title": "over the shoulder, focus racking into the distance", "cat": "CAMERA", "text": "A reverse angle from directly behind and slightly above her, close in, with the depth order fully legible in one frame: the back of her head and shoulder sharp in the near foreground occupying roughly the left third; the object she is looking at in the middle; and the thing beyond it in the distance.\n\nHeld on the near plane first. Then the camera drifts slowly sideways — the operator sidestepping, uneven, with a small pause halfway — while the focus racks off her head and the middle object and back into the distance. The middle object slides toward the frame edge and dissolves into a soft blurred vertical shape. The rack is not instant: there is a real transitional second where nothing is sharp. Her blurred head stays in the corner of frame for the whole beat."}, {"code": "CAM-HIGH", "title": "high viewpoint", "cat": "CAMERA", "text": "Camera high above, looking steeply down across the whole space, taking in the full geography of the room or the field at once. The figure is small in the middle of all of it. Locked and level, with only the faintest drift. Everything in the space reads as a plan — the relationships between objects are the subject, not any single object."}, {"code": "CAM-MANUAL-ZOOM", "title": "hand-operated zoom", "cat": "CAMERA", "text": "At a set moment, A HAND-OPERATED ZOOM PUNCHES IN on the detail she is working — the move is fast, slightly uneven, overshoots the intended framing by a few percent and corrects back, then holds. The zoom is mechanical and human, not a smooth digital push, and the handheld tremor increases visibly at the longer focal length."}, {"code": "OPT-ANAMORPHIC", "title": "OPT-ANAMORPHIC", "cat": "OPTICS", "text": "STRONG anamorphic lens character: horizontal squeeze and compression, oval elliptical bokeh, horizontally stretched highlights, curved barrel edge distortion, chromatic aberration toward the edges. NO lens flares, NO light streaks, NO floating bokeh circles. 2.39:1. Fine organic film grain. Mild natural vignetting at the corners."}, {"code": "OPT-PENTAX", "title": "OPT-PENTAX", "cat": "OPTICS", "text": "Pentax 645 medium-format look: creamy rendering with beautiful natural roll-off into the highlights, gentle painterly colour separation, circular bokeh, shallow-but-not-extreme depth of field with a smooth transition into softness, mild natural vignetting, fine organic film grain. No anamorphic squeeze, no oval bokeh, no horizontal streak flares, no barrel distortion. Focus breathes slightly with the movement — real focus pulling with tiny imperfections, never snapping."}, {"code": "OPT-WIDE", "title": "OPT-WIDE", "cat": "OPTICS", "text": "Wide-angle, roughly 18 mm, held very close. The near subject is huge in the foreground and slightly stretched by the lens, with correct wide-angle stretch near the frame edges. DEEP FOCUS: everything sharp, from the nearest object to the far wall. No shallow depth, no dissolved background, no isolation, no telephoto compression."}, {"code": "OPT-MACRO", "title": "OPT-MACRO", "cat": "OPTICS", "text": "True macro rendering with very shallow depth of field. Focus travels along the surface as the camera drifts, only a few millimetres in focus at any moment. Surface texture is the subject — weave, ridges, grain, fibre, all readable at a scale the eye does not normally see."}, {"code": "OPT-NORMAL", "title": "OPT-NORMAL", "cat": "OPTICS", "text": "Normal lens, roughly 45–50° horizontal field of view — natural perspective, no wide-angle stretch, no distortion. Sharp with a natural falloff into the background. Fine organic film grain, mild vignetting."}, {"code": "GRADE-BRIGHT", "title": "GRADE-BRIGHT", "cat": "GRADE", "text": "The whole piece sits in a bright, light, clean high-key register — luminous mid-tones, open shadows full of bounced ambient colour, clean whites in the highlights. Vivid but natural. Real modelling everywhere, nothing flat. No orange-teal grade, no heavy filter, no dark moody grade, no grey washed veil, no lifted milky blacks, no oversaturation."}, {"code": "GRADE-COOL-GREEN", "title": "GRADE-COOL-GREEN", "cat": "GRADE", "text": "Cool and faintly green, but BRIGHT. This is a light-filled space and it reads that way — normal to slightly airy exposure, the whites luminous and open, the shadows soft and shallow, no gloom. But the WHITE BALANCE STAYS COLD: the daylight is blue-grey, never golden, and the walls, cloths and her skin all lose their yellow. A light green tint sits through the midtones and the soft shadows — the character of the light, never a filter. Overall desaturated and quiet.\n\nBUT THE FOLLOWING KEEP THEIR FORCE: [list the exceptions — the one saturated object, the costume colour, whatever must not go grey]. HER SKIN STAYS HUMAN: cooled and slightly dulled, never blue, never grey, never sickly.\n\nFine film grain, lifted milky blacks, very slight vignette."}, {"code": "GRADE-WARM-DARK", "title": "GRADE-WARM-DARK", "cat": "GRADE", "text": "A low-key warm interior: umber, russet, oxblood and dull gold, with one clean cool note in the key light. Deep shadow occupies more of the frame than light does, but every textile and surface must still hold readable detail inside it — no crushed black silhouettes. True blacks in the deepest corners only. One saturated accent. No orange-teal grade, no sepia flattening, no grey veil, no flat evenly lit look."}, {"code": "GRADE-LOCK", "title": "GRADE-LOCK", "cat": "GRADE", "text": "THE GRADE — IDENTICAL IN EVERY SHOT, NO DRIFT ANYWHERE. The same white balance, the same contrast, the same saturation and the same black level from the first frame to the last. No lighting change at a cut, no grade drifting between shots, no style drift.\n\nEXCEPTIONS THAT KEEP THEIR FORCE regardless of the grade: [list]."}, {"code": "WIND", "title": "WIND", "cat": "WORLD", "text": "Strong wind, not a breeze, and every organic surface reacts on its own layer and its own timing.\n\n- Grass is laid over in travelling gusts: waves race across whole fields, flattening blades in a moving band that crosses the frame in under a second, springing back behind.\n- Trees bend as whole masses — trunks flexing, canopies shoved sideways and shivering, leaf clusters flipping to show pale undersides in a rippling flicker. Willow and hanging branches whip and lag hard, trailing, never still.\n- Bushes shudder at a faster, tighter frequency than the trees.\n- Wildflowers whip and nod violently on thin stems, at their own frequency again.\n- Loose material rides the air: seed fluff, pollen, torn grass, dust and scattered leaves streaking past close to the lens at real speed.\n- Clouds are sheared — edges tearing and re-forming, thin veils pulled off their tops, whole shapes deforming as they move.\n- Fabric on the character lags her body by several frames, always.\n- Wind noise bleeds into the audio — a constant pressure hiss rising and falling with the gusts.\n\nNothing gigantic moves quickly. Nothing distant moves at the speed of something near."}, {"code": "WATER", "title": "WATER", "cat": "WORLD", "text": "The water has a real current, flowing in one consistent direction, and this must be readable: long smooth glassy bands broken by fine ripple texture, with two or three places where the water rises over a submerged stone into a low standing riffle that holds position while the water passes through it. Small debris travels downstream at a consistent speed. Along the near bank the water laps and slides against the edge with a thin travelling line of tiny bubbles.\n\nAcross the middle, a broad band of intense glittering specular sparkle — hundreds of small brilliant points appearing and vanishing in fractions of a second as the surface tilts, travelling with the current, the band shifting slowly. Reflections on the surface are broken and trembling, never mirror-clean."}, {"code": "RAIN", "title": "RAIN", "cat": "WORLD", "text": "THE RAIN IS THE DOMINANT ELEMENT OF THIS SHOT, NON-NEGOTIABLE. It falls across the entire location for the entire duration, in five depth zones:\n\n- Directly at the lens — a few large out-of-focus drops streaking past, some striking and running on the glass.\n- Near foreground — individual visible drops with real length and direction, lit hard where they cross a light source.\n- Mid-ground — a dense readable curtain, drops still individually visible.\n- Far ground — a grey haze of falling water softening everything behind it.\n- Impact zone — the ground everywhere is wet, running, splashing, throwing up a low mist of bounce spray, with puddles taking rings continuously.\n\nEvery surface in the location is wet, streaming and reflective. Cloth is soaked, heavy and clinging in weight, not just damp.\n\nBAN: no rain that exists only as water running down the character's body while the background stays dry. No dry ground. No dry architecture. No rain that stops between shots."}, {"code": "LIVING-BACKGROUND", "title": "LIVING-BACKGROUND", "cat": "WORLD", "text": "Every layer of the background is alive, and each moves at its own correct speed for its distance.\n\n- Birds: one or two designated events only — a loose group of five or six crossing the middle distance with real wing-beat speed, banking once together and catching a flash of light; or a single larger bird gliding high on flat wings. Small in frame, clearly distant, never crossing in front of the subject. No flock, no swarm.\n- Cloud shadows travel slowly across distant slopes, dimming a whole area and releasing it.\n- Atmospheric layers shift almost imperceptibly, so the far distance slowly changes density.\n- Dust, pollen and small insects drift through any shaft of light and are visibly disturbed into small vortices by movement near them.\n- The most distant elements — mountains, horizon, the moon — do not move at all. They are the still anchor in a frame full of motion."}, {"code": "INTEGRATION", "title": "INTEGRATION", "cat": "WORLD", "text": "INTEGRATION LOCK. The character is physically in this place.\n\n- Her cast shadow falls on the real ground and on the objects around her, correctly angled to the fixed key light, and it moves when she moves.\n- The ground is compressed, splayed or marked where her weight presses into it, and it stays marked.\n- Architecture, foliage and foreground objects OVERLAP HER where the geometry demands it — she is occluded, not pasted in front.\n- She is reflected in every reflective surface present.\n- Bounce light from the nearest bright surface fills her shadow side.\n- Airborne dust, spray, pollen and haze pass in FRONT of her as well as behind.\n- She shares the shot's exposure, grain, haze and lens softness at her depth plane.\n\nIf any frame shows her sharper, brighter, cleaner or flatter than her depth plane — that frame is wrong."}, {"code": "SCALE", "title": "SCALE", "cat": "WORLD", "text": "SCALE — WORLD AS HUGE. Do not describe her as small. Describe the world as enormous, measured in units of her body.\n\nGive at least THREE independent cross-checks against her body, e.g.: the object is taller than her torso; it is wider than three of her shoulder-widths; its edge sits at her mid-thigh.\n\nPlus ONE physical contact test: where she touches something, describe exactly what happens — her fingers wrap it and the tips do not meet, her palm compresses against it, the surface dents under her weight.\n\nBAN SIZE DRIFT IN BOTH DIRECTIONS: she never becomes larger and never becomes smaller than the locked measurements at any point in the piece."}, {"code": "PEOPLE-LAW", "title": "a global rule overriding assets", "cat": "RULES", "text": "THERE IS ONLY ONE PERSON IN THIS ENTIRE PIECE, AND SHE COMES ONLY FROM [asset]. All other references supply framing, staging, location and camera position ONLY. TAKE NO PEOPLE FROM THEM — no faces, no heads, no bodies, no hands, no arms, no fingers, no clothing, no skin. Every hand and every arm seen in the piece is hers."}, {"code": "COUNT", "title": "COUNT", "cat": "RULES", "text": "CONTINUITY / COUNT LOCK: exactly [N] of [X], exactly [N] of [Y], exactly one of [Z]. These counts hold in every single frame. No duplicates, no second copy appearing in the background, no extra appearing at a cut, no crowd, no swarm, no herd. If more than the stated number is visible at any point, the shot is wrong."}, {"code": "FAIL", "title": "FAIL", "cat": "RULES", "text": "FAIL CONDITION: IF [the predicted failure] HAPPENS, THE SHOT IS WRONG."}, {"code": "NO-FREEZING", "title": "NO-FREEZING", "cat": "RULES", "text": "NOBODY FREEZES. In every shot there is continuous movement from its first frame to its last — hands, breathing, weight shifting, fabric moving, hair moving. No shot begins or ends on a still figure. No frozen poses, no motionless hands, no dead frames. The last second of the piece has as much life in it as the first."}, {"code": "CONTAMINATION", "title": "a ban on carrying over elements from assets", "cat": "RULES", "text": "For every reference: take ONLY what is named, and take nothing else. Specifically DO NOT inherit from any reference image: its people, its hands, its clothing, its lighting, its colour temperature, its grade, its depth of field, its framing, its aspect ratio, its background, its studio backdrop, its sheet layout, its props, or any object visible in it that is not explicitly requested."}, {"code": "TEXT-ON", "title": "when text is needed", "cat": "RULES", "text": "The text reads exactly \"[WORDS]\" — [how many] words, [case], correctly and legibly spelled, no other words, no numbers, no extension, no punctuation.\n\nIT SITS [exact position relative to the object], separated by [gap]. It is [weight, colour, case, typeface] with [treatment], sized to match [reference scale] — subordinate to the object, never a headline, never a title card.\n\nIT IS NEVER ON the object, NEVER INSIDE it, NEVER ACROSS its face, NEVER ABOVE it, NEVER BESIDE it, NEVER OVERLAPPING it, and never floating free of it. It travels with the object as one unit.\n\nTHIS IS THE ONLY TEXT ANYWHERE IN THE PIECE. No other words, no file names, no captions, no subtitles, no watermarks, no gibberish or misspelled lettering."}, {"code": "ANATOMY", "title": "ANATOMY", "cat": "RULES", "text": "ANATOMY — CRITICAL. Every hand has exactly five correct fingers with real knuckles, nails and creases and correct thumb opposition, holding its shape throughout. Two arms, two legs, correct joint directions. No melting, no fusing, no extra digits, no backwards joints, no morphing.\n\nFor animals: build the limb as a real skeleton — shoulder, upper limb, elbow, forearm, wrist, paw or hoof — with separate digits, pads and claws where they exist. The limb bends ONLY at real joints. No blob, no rubber, no fused toes, no shapeless mass of fur."}, {"code": "ACTING", "title": "the full acting-task block", "cat": "ACTING", "text": "ACTING TASK — HER (the whole performance is in the eyes; the task produces the emotion, it is not the absence of one):\n\nSCENE DIRECTION (unspoken, played for herself): [what she is trying to do in these seconds]\nMOTIVE (her fuel): [why it matters to her right now]\nGOAL: [the concrete thing she wants from this moment]\nOBSTACLE: [what stops her]\nTACTIC: [how she works around it — this is what we actually see]\n\nMoment to moment: [beat by beat, mapped to the timecodes, describing what the EYES are doing at each point — the face is a side effect of the eyes, never the point of the beat]\n\n(Safety: gaze never into the lens; eyes always mid-task — searching, checking, receiving, refusing — never a blank hold, never a locked glassy stare.)"}, {"code": "RESTRAINED", "title": "RESTRAINED", "cat": "ACTING", "text": "EMOTIONAL REGISTER — restrained throughout. Every peak reads through the BODY, not the face: a tightened grip, a caught step, a hand on a surface, a held stillness. Calibrated substitutions: a shout becomes a quiet exhale; a scream becomes a closed-mouth flinch; shock becomes a physical recoil that happens BEFORE any expression; delight becomes a two-millimetre brow lift and a slow blink.\n\nBanned completely: wide grins, open mouth, gasps, hands over the mouth, theatrical shock, giggling, tears, trembling lip, eyebrow acting, hair-flip posing, any expression larger than a real person would actually make alone."}, {"code": "GAZE", "title": "GAZE", "cat": "ACTING", "text": "She never looks into the lens — except at the designated moments listed below, which are deliberate events with exact timecodes: [list of moments]. Outside those moments, not for a single frame.\n\nHer head and her eyes always agree: when her head turns, her EYES GO THE SAME WAY. No over-the-shoulder glance into the lens, no head rotation past 90 degrees.\n\nReal gaze behaviour throughout: small involuntary micro-movements, irregular blinks at uneven intervals, smooth tracking when following something, brief downward glances. Never a fixed stare."}, {"code": "SOUND", "title": "SOUND", "cat": "SOUND", "text": "AUDIO — SFX ONLY, NO MUSIC. No music of any kind, no score, no ambient pads, no swells, nothing melodic, no dialogue.\n\nOnly real diegetic sound, layered by distance: the room tone or open ambience of this specific space with its correct reverb; the near sounds of the character's body, clothing and contact with objects; the mid sounds of the location; the distant sounds at the edge of audibility. Her breathing present throughout. Every physical impact in the picture has its sound, and no sound exists without a visible cause."}, {"code": "SOUND-SWITCH", "title": "SOUND-SWITCH", "cat": "SOUND", "text": "The soundscape changes perspective with the camera: when the point of view is lifted, moved or turned, the whole sound field swings with it — near sounds recede, new near sounds arrive, the reverb changes. At a hard cut or a wipe, the sound flips instantly and completely to the new space, on the exact frame, with no crossfade."}, {"code": "STOP-BASE", "title": "general hygiene", "cat": "NEGATIVE", "text": "No painterly or brushstroke rendering, no oil-painting look, no varnish sheen, no craquelure, no canvas weave, no aged-artwork colour cast, no illustration, no anime, no cartoon, no comic style, no 3D or CG look, no game-engine surfaces, no fur shader, no plastic or waxy skin, no beauty filter, no AI-smooth face, no smoothed pores, no glow overlay, no bloom, no glowing particles, no magical sparkles, no lens-flare graphics, no light streaks, no HDR, no teal-and-orange grade, no heavy colour filter, no oversaturation, no crushed blacks, no grey washed veil, no style drift.\n\nNo text, no letters, no numerals, no readable handwriting, no inscriptions, no captions, no subtitles, no watermarks, no logos, no brand names, no visible clothing labels.\n\nNo extra people, no crowds, no second face, no other hands entering frame, no extra limbs, no warped hands, no missing fingers, no six fingers, no morphing face, no glitch.\n\nNo slow motion, no speed ramp, no freeze frame, no fisheye, no visible rig, no visible camera arm."}, {"code": "STOP-INVERSION", "title": "tailored to the specific video", "cat": "NEGATIVE", "text": "Automatically: I take the TRICK line from your brief and ban 8–10 ways of reversing it. You do not need to write this separately.\n\nPrinciple: if the rule is \"the object stays still, the world moves\", we ban \"the object moves\", \"the world stays still\", \"the camera follows the object from outside\", \"the camera orbits the object\", \"the object leaves the frame\", \"the hand changes its grip in frame\". One idea — ten negative formulations."}];
  const CD_ORDER = ['FACE', 'BODY', 'MODEST', 'TASK', 'CAM-HANDHELD', 'CAM-LIVING-TRIPOD', 'CAM-RIG', 'CAM-POV', 'CAM-PULLBACK-TURN', 'CAM-OVER-SHOULDER', 'CAM-HIGH', 'CAM-MANUAL-ZOOM', 'OPT-ANAMORPHIC', 'OPT-PENTAX', 'OPT-WIDE', 'OPT-MACRO', 'OPT-NORMAL', 'GRADE-BRIGHT', 'GRADE-COOL-GREEN', 'GRADE-WARM-DARK', 'GRADE-LOCK', 'WIND', 'WATER', 'RAIN', 'LIVING-BACKGROUND', 'INTEGRATION', 'SCALE', 'PEOPLE-LAW', 'COUNT', 'FAIL', 'NO-FREEZING', 'CONTAMINATION', 'TEXT-ON', 'ANATOMY', 'ACTING', 'RESTRAINED', 'GAZE', 'SOUND', 'SOUND-SWITCH', 'STOP-BASE', 'STOP-INVERSION'];
  const INVERT = {
    'CAM-RIG': ['the object moves within the frame', 'the world stays still while the object moves', 'the camera follows the object from outside', 'the camera orbits the object', 'the object leaves the frame', 'the hand changes its grip in frame'],
    'CAM-POV': ['the device appears anywhere in frame', 'a third-person view of the device', 'someone is filmed holding the device', 'a cutaway or reverse angle', 'the view leaves the point of view'],
    'CAM-LIVING-TRIPOD': ['the framing changes', 'a zoom, push, pan or tilt', 'handheld wobble', 'a dead-still frozen frame'],
    'CAM-HANDHELD': ['a locked-off frame', 'a smooth stabilised glide', 'a move that arrives exactly on the beat', 'a gimbal or drone look'],
    'SCALE': ['she becomes larger than the locked measurements', 'she becomes smaller than the locked measurements', 'the object shrinks when touched'],
  };
  function cinedance(o) {
    const pick = new Set(o.blocks);
    const by = (c) => CD.find((b) => b.code === c);
    const sub = (t) => t
      .replace(/\[OBJECT\]/g, o.object || 'the object')
      .replace(/\[asset\]/g, (o.assets.match(/@\w+/) || ['@1'])[0])
      .replace(/\[list the exceptions[^\]]*\]|\[list\]/g, o.except || 'none named')
      .replace(/\[list of moments\]/g, o.gaze || 'none')
      .replace(/\[WORDS\]/g, o.text || 'WORDS');
    const P = [];
    const add = (code, override) => { if (!pick.has(code)) return; const b = by(code); if (b || override) P.push(override || sub(b.text)); };
    P.push(`SCENE CONTEXT: ${o.trick || '[one sentence — the trick]'}`);
    P.push(`FORMAT: ${o.format || '[duration, shots, cuts with timecodes, aspect ratio]'}${pick.has('SOUND') ? ', no music' : ''}.`);
    add('PEOPLE-LAW');
    if (o.main) P.push(`THESE RULES ARE THE MOST IMPORTANT IN THE SHOT: ${o.main}`);
    if (o.fail || pick.has('FAIL')) P.push(lines(o.fail).map((f) => `FAIL CONDITION: IF ${f.replace(/\.$/, '').toUpperCase()} HAPPENS, THE SHOT IS WRONG.`).join('\n') || 'FAIL CONDITION: IF [the predicted failure] HAPPENS, THE SHOT IS WRONG.');
    if (o.assets) P.push('ACTIVE REFERENCES:\n' + lines(o.assets).join('\n'));
    add('CONTAMINATION');
    add('BODY'); add('SCALE'); add('FACE');
    if (o.layout) P.push('SPATIAL LAYOUT (by depth): ' + o.layout);
    if (o.timing) P.push('ACTION TIMING:\n' + lines(o.timing).join('\n'));
    if (pick.has('ACTING')) {
      const b = by('ACTING');
      P.push(b ? sub(b.text).replace(/\[what she is trying to do in these seconds\]/, o.acting || '[what she is trying to do]').replace(/\[why it matters to her right now\]/, '[why it matters right now]') : '');
    }
    add('RESTRAINED'); add('GAZE');
    if (pick.has('TASK')) P.push(sub(by('TASK').text) + (o.task ? `\nHER TASK: ${o.task}.` : ''));
    ['CAM-HANDHELD', 'CAM-LIVING-TRIPOD', 'CAM-RIG', 'CAM-POV', 'CAM-PULLBACK-TURN', 'CAM-OVER-SHOULDER', 'CAM-HIGH', 'CAM-MANUAL-ZOOM'].forEach((c) => add(c));
    ['OPT-ANAMORPHIC', 'OPT-PENTAX', 'OPT-WIDE', 'OPT-MACRO', 'OPT-NORMAL'].forEach((c) => add(c));
    ['WIND', 'WATER', 'RAIN', 'LIVING-BACKGROUND'].forEach((c) => add(c));
    add('ANATOMY');
    if (o.light) P.push('LIGHTING: ' + o.light);
    add('INTEGRATION');
    ['GRADE-BRIGHT', 'GRADE-COOL-GREEN', 'GRADE-WARM-DARK', 'GRADE-LOCK'].forEach((c) => add(c));
    add('NO-FREEZING');
    if (pick.has('COUNT')) P.push(o.count ? `CONTINUITY / COUNT LOCK: ${o.count.split(',').map((x) => 'exactly ' + x.trim()).join(', ')}. These counts hold in every single frame. No duplicates, no second copy appearing in the background, no extra appearing at a cut, no crowd, no swarm, no herd. If more than the stated number is visible at any point, the shot is wrong.` : sub(by('COUNT').text));
    add('MODEST'); add('TEXT-ON');
    add('SOUND'); add('SOUND-SWITCH');
    if (pick.has('STOP-INVERSION')) {
      const inv = lines(o.inv).length ? lines(o.inv) : [...pick].flatMap((c) => INVERT[c] || []);
      P.push('STOP-INVERSION: ' + (inv.length ? inv.map((x) => 'no ' + x.replace(/^no\s+/i, '')).join(', ') + '.' : '[8–10 inversions of the trick]'));
    }
    add('STOP-BASE');
    const txt = P.filter(Boolean).join('\n\n');
    const ck = [
      [!!o.trick && !/[.;].+[.;]/.test(o.trick.trim().replace(/\.$/, '')), 'Tek numara, tek cümle'],
      [/\d/.test(o.format), 'Format sayılarla (süre, çekim, kesme, oran)'],
      [!!o.main, '1–2 kırılmaz kural adlandırıldı'],
      [!!o.fail.trim(), '"X olursa çekim yanlıştır" satırı var'],
      [!/\b(beautiful|slightly|a little|a bit|somewhat)\b/i.test([o.trick, o.main, o.timing, o.layout].join(' ')), '"beautiful / slightly / a little" yok, yerine sayı'],
      [pick.has('PEOPLE-LAW'), 'İnsanlar ve eller için küresel kural (PEOPLE-LAW)'],
      [pick.has('CONTAMINATION') || /not|ignore|don't/i.test(o.assets), 'Her asset için ne ALINMAYACAĞI yazılı'],
      [pick.has('COUNT'), 'COUNT satırı var'],
      [!!o.task, 'Karakterin bırakmadığı küçük görevi var'],
      [pick.has('STOP-INVERSION'), 'Yasak listesinin yarısı numaranın tersine çevrilmesi'],
      [pick.has('NO-FREEZING'), 'NO-FREEZING bloğu var'],
      [['GRADE-BRIGHT', 'GRADE-COOL-GREEN', 'GRADE-WARM-DARK'].filter((g) => pick.has(g)).length <= 1, 'Tüm çekimlere tek grade'],
    ];
    return { txt, ck };
  }
  CB.DIR.register({
    id: 'cinedance', tr: 'CINEDANCE Blokları', sub: `${CD.length || 41} blok · brief → prompt`, group: GROUP,
    render(main, ctx) {
      const o = load('cinedance', { trick: '', format: '8 sec, one shot, 16:9', assets: '', main: '', fail: '', count: '', task: '', acting: '', object: '', layout: '', timing: '', light: '', except: '', gaze: '', text: '', inv: '', blocks: ['BODY', 'CAM-RIG', 'OPT-WIDE', 'GRADE-BRIGHT', 'WIND', 'LIVING-BACKGROUND', 'INTEGRATION', 'NO-FREEZING', 'COUNT', 'FAIL', 'ACTING', 'RESTRAINED', 'SOUND', 'STOP-BASE', 'STOP-INVERSION', 'PEOPLE-LAW', 'CONTAMINATION'] });
      const out = el('div', { class: 'dv-out' });
      const run = () => {
        const r = cinedance(o);
        out.replaceChildren(el('div', { class: 'section' }, el('h3', { text: 'PART 6 kontrol listesi' }), checks(r.ck)),
          pcard('CINEDANCE prompt', `${o.blocks.length} blok · PART 4 sırası`, r.txt));
      };
      const b = binder('cinedance', o, run);
      const cats = [...new Set(CD.map((x) => x.cat))];
      const blockBox = el('div', { class: 'dv-blocks' }, ...cats.map((c) => el('fieldset', null, el('legend', { text: c }),
        ...CD.filter((x) => x.cat === c).map((x) => {
          const cb = el('input', { type: 'checkbox', id: 'dv-cd-' + x.code }); cb.checked = o.blocks.includes(x.code);
          cb.addEventListener('change', () => { o.blocks = CD_ORDER.filter((k) => (k === x.code ? cb.checked : o.blocks.includes(k))); keep('cinedance', o); run(); });
          return el('label', { class: 'dv-chk', for: 'dv-cd-' + x.code, title: x.text.slice(0, 300) }, cb, el('span', null, el('b', { text: x.code }), ' ' + x.title));
        }))));
      head(main, 'CINEDANCE Blokları', 'Kısa brief + blok kodları → tam video promptu. Bir video, bir numara; kural ve sonuçları; sayılar sıfat yerine; başarısızlık önceden tarif edilir; yasakların yarısı numaranın tersidir.');
      main.append(el('div', { class: 'section' }, grid(
        wide(b.txt('trick', 'TRICK — tek cümle numara', 'the camera sits on the palette and looks up at her')),
        b.txt('format', 'FORMAT', '8 sec, one shot, 16:9'), b.txt('object', 'Nesne (CAM-RIG / CAM-POV)', 'the palette'),
        wide(b.area('assets', 'ASSETS: @1 = ne, ne ALINMAZ', 2, '@1 meadow location — take only the geography; not its light or people')),
        wide(b.txt('main', 'MAIN — 1–2 kırılmaz kural')), wide(b.area('fail', 'FAIL — bir satıra bir zayıf nokta', 2, 'the camera starts flying around the palette')),
        b.txt('count', 'COUNT (virgülle)', '1 woman, 1 palette, 3 brushes'), b.txt('task', 'TASK — bırakmadığı küçük görev', 'she keeps mixing paint'),
        wide(b.txt('acting', 'ACTING — içten oynadığı şey', 'it is not working, but she has not given up yet')),
        wide(b.txt('layout', 'SPATIAL LAYOUT (derinliğe göre)')), wide(b.area('timing', 'ACTION TIMING (zaman kodlu)', 2)),
        wide(b.txt('light', 'LIGHTING')), b.txt('except', 'Grade istisnaları (gücünü koruyan)'), b.txt('gaze', 'GAZE: lense bakılan anlar'),
        b.txt('text', 'TEXT-ON kelimeleri'), wide(b.area('inv', 'STOP-INVERSION (boş = kamera bloklarından otomatik)', 2)))),
      el('details', { class: 'dv-details' }, el('summary', { text: 'Sekiz kural' }), el('ol', { class: 'checks' },
        ...['Videoda tek numara: her şey ona hizmet eder.', 'Resmi tarif etme: mekanik bir kural ver, 3–4 sonucunu türet.', 'Öncelik koy: "BU İKİ KURAL EN ÖNEMLİSİ".', 'Sıfat yerine sayı: aynı şeyin üç bağımsız ölçüsü.', 'Başarısızlığı önceden yaz: "X OLURSA ÇEKİM YANLIŞ".', 'Negatif, kendi fikrinin tersidir.', 'Asset\'lerden bulaşmayı yasakla: ışık, alan derinliği, renk, yerleşim.', 'Karaktere bırakmadığı küçük bir görev ver.'].map((t) => el('li', { text: t })))),
      el('div', { class: 'section' }, el('h3', { text: 'Bloklar' }), blockBox), out);
      run();
    },
  });

  /* ======================================================================
     7. SOUL CINEMA REKLAM
     ====================================================================== */
  const RECIPES = {
    burger: ['Burger / sandviç', 'three-quarter camera, structured stack, visible real ingredients, crisp edges, faint heat, restrained crumbs and a single cheese stretch'],
    pizza: ['Pizza', 'low three-quarter angle, baked crust blistering, visible specified toppings, one pulled slice or light oven steam'],
    coffee: ['Kahve / sıcak içecek', 'recognizable vessel and beverage surface, one curl of steam, warm side light and truthful crema or foam'],
    cold: ['Soğuk içecek', 'crisp glass contour, believable condensation, accurate liquid color, one small splash or falling ice cube'],
    dessert: ['Tatlı', 'clear layers and texture, one cut or pour, rich but controlled highlights, food realism preserved'],
    beauty: ['Güzellik / parfüm', 'bottle silhouette, cap, finish and label placement preserved; controlled caustics and a single mist or liquid ribbon behind the product'],
    apparel: ['Giyim / aksesuar', 'recognizable construction, stitching and material; a dynamic fabric fold, one directional light source and clean product edges'],
    packaged: ['Paketli ürün', 'container count kept at one; authentic proportions, label location and color prioritized over invented printed copy'],
    tech: ['Teknoloji', 'precise industrial edges, true material finish, one controlled reflection sweep across the surface, screen kept dark or as supplied'],
  };
  const HEADLINES = {
    burger: [['Built Layer By Layer', 'Every bite stacked with care'], ['Heat You Can See', 'Fresh off the grill tonight']],
    pizza: [['Pulled Straight From Fire', 'One slice never stays alone'], ['Crust Worth Waiting For', 'Baked hot, shared fast']],
    coffee: [['Your First Quiet Minute', 'Slow mornings start here'], ['Steam Before Sunrise', 'Poured warm, every single day']],
    cold: [['Cold Enough To Hear', 'Open, pour, breathe out'], ['Ice Meets Glass', 'Made for the hottest hour']],
    dessert: [['One More Spoonful', 'Layers made to be shared'], ['Sweet Things Take Time', 'Cut it slowly tonight']],
    beauty: [['Light On Skin', 'A quiet ritual for evenings'], ['Wear The Evening', 'One drop, one long night']],
    apparel: [['Made To Move', 'Built for the long way'], ['Every Stitch Counts', 'Wear it for years']],
    packaged: [['Open Something Good', 'The pantry favourite returns'], ['Small Box, Big Habit', 'Keep one within reach']],
    tech: [['Quiet Power, Clean Lines', 'Designed for focused hours'], ['Less Noise, More Work', 'Built for your desk']],
  };
  const POS = [['top-left', 'Sol üst'], ['top-center', 'Üst orta'], ['top-right', 'Sağ üst'], ['bottom-left', 'Sol alt'], ['bottom-center', 'Alt orta'], ['bottom-right', 'Sağ alt'], ['left-third', 'Sol üçte bir'], ['right-third', 'Sağ üçte bir']];
  const TYPE = [['bold condensed sans-serif in all caps', 'Kalın dar sans (büyük harf)'], ['elegant high-contrast serif', 'Zarif yüksek kontrast serif'], ['clean geometric sans-serif', 'Temiz geometrik sans'], ['heavy editorial serif with tight leading', 'Ağır editoryal serif'], ['refined thin sans-serif with wide letter-spacing', 'İnce geniş aralıklı sans']];
  function adPrompt(o, ctx) {
    const sc = scene(ctx);
    const rc = RECIPES[o.cat] || RECIPES.packaged;
    const sug = (HEADLINES[o.cat] || HEADLINES.packaged)[(o.sug | 0) % 2];
    const H = (o.headline || sug[0]).trim(), T = (o.tagline || sug[1]).trim();
    const hw = words(H), tw = words(T);
    const asp = o.aspect || (ctx.aspect() || {}).id || '4:5';
    const photo = o.mode === 'photo';
    const setting = o.useBg && sc.ok ? `set in ${sc.loc}, the location kept simple and soft behind the hero` : o.setting || 'a clean premium tabletop set with a single seamless backdrop';
    const p = [
      `Cinematic advertising still, one hero composition. ${photo ? `The product from the attached image reference (role: image): ${o.product || 'the product'} — preserve its exact shape, color, material${o.keepF ? ', ' + o.keepF : ''} and label placement.` : `A concrete dish: ${o.product || 'the dish'}, ${o.ingredients ? 'with visible ' + o.ingredients : 'with every ingredient visible and plausible'}.`}`,
      `Recipe: ${rc[1]}. One motion event only: ${o.motion || (photo ? 'a single fine mist drifting behind the product' : 'one appetising action caught mid-moment')}.`,
      `Composition: ${o.angle || '50–85 mm product photography look'}, the hero occupies roughly half the frame, tack sharp, background simpler than the subject, ${setting}. Believable contact shadows and reflections on the surface, controlled shadows, premium textures, intentional negative space ${o.hpos.includes('top') ? 'in the upper area' : 'beside the hero'} for the headline. Any motion stays behind or beside the product.`,
      `Light: ${o.light || 'one directional key from the side, soft fill, a thin rim separating the hero from the backdrop'}.`,
      `In-image text, rendered as part of the ad composition with visible, legible lettering: the headline reads exactly "${H}" in the ${o.hpos} area, ${o.type}, ${o.color || 'warm off-white'}, large scale, high contrast, deliberate line breaks; the tagline reads exactly "${T}" in the ${o.tpos} area, smaller, same typeface family, ${o.color2 || o.color || 'warm off-white'}. Neither line overlaps the ${photo ? 'product' : 'dish'}.`,
      `Final constraints: only the specified headline "${H}" and tagline "${T}" appear as text; no extra words, gibberish or watermark${photo ? '; packaging labels stay faithful to the uploaded image and are not replaced with invented words' : '; no invented logos, prices, certification marks or claims'}. Aspect ${asp}.`,
    ].join('\n');
    const settings = [`Model: Soul Cinema (soul_cinematic) — never substituted silently`, `Quality: 1.5k (1k is not offered at creation; 1.5k is the cheapest tier ≥1K) · Count: 1 · Ratio: ${asp}`, photo ? 'Reference: product photo uploaded as type image → medias:[{role:"image", value:"<media_id>"}]' : 'Reference: none (food described in text, no source image implied)', 'Before generating: check the model\'s current options and estimate the exact cost; one job, no automatic retries.', 'After: check every text line; misspelled or missing copy = unfinished ad.'].join('\n');
    return { p, settings, H, T, hw, tw };
  }
  CB.DIR.register({
    id: 'soul-ad', tr: 'Soul Cinema Reklam', sub: 'Ürün / yemek · görsel içi başlık', group: GROUP,
    render(main, ctx) {
      const o = load('ad', { mode: 'photo', cat: 'beauty', product: '', keepF: '', ingredients: '', motion: '', angle: '', light: '', headline: '', tagline: '', hpos: 'top-center', tpos: 'bottom-center', type: TYPE[0][0], color: '', color2: '', aspect: '', useBg: false, setting: '', sug: 0 });
      const out = el('div', { class: 'dv-out' });
      const run = () => {
        const r = adPrompt(o, ctx);
        out.replaceChildren(
          checks([[r.hw >= 3 && r.hw <= 5, `Başlık 3–5 kelime: "${r.H}" (${r.hw})`], [r.tw >= 3 && r.tw <= 6, `Slogan 3–6 kelime: "${r.T}" (${r.tw})`], [o.hpos !== o.tpos, 'Başlık ve slogan ayrı konumda'], [!!o.product, o.product ? 'Ürün tarif edildi' : 'Ürün/yemek tarifini yaz'], [!/\b(best|#1|number one|clinically|proven|guaranteed|cures?|organic|award)\b/i.test(r.H + ' ' + r.T), 'Desteksiz iddia yok (best, #1, proven…)']]),
          pcard('Soul Cinema reklam prompt', 'görsel içi metin', r.p),
          pcard('Ayarlar ve kurallar', 'üretim yapılmaz', r.settings, 'Bu araç üretim çalıştırmaz. Soul Cinema metni yanlış yazabilir ya da atlayabilir: çıkan görselde her satırı kontrol et.'));
      };
      const b = binder('ad', o, run);
      head(main, 'Soul Cinema Reklam', 'Görsel içinde başlık ve slogan olan tek kare sinematik ürün/yemek reklamı. Tek kahraman, tek hareket olayı, metin için boş alan; metin her satırda tırnak içinde, konum ve stil ile.');
      main.append(el('div', { class: 'section' }, grid(
        b.sel('mode', 'Kaynak', [['photo', 'Ürün fotoğrafı eklenecek'], ['food', 'Yemek tarifle']]), b.sel('cat', 'Kategori tarifi', Object.entries(RECIPES).map(([k, v]) => [k, v[0]])),
        wide(b.txt('product', 'Ürün / yemek', 'a frosted glass perfume bottle with a brass cap')),
        b.txt('keepF', 'Korunacak özellikler', 'faceted shoulders, label on the front'), b.txt('ingredients', 'Görünen malzemeler (yemek)'),
        wide(b.txt('motion', 'Tek hareket olayı', 'a single liquid ribbon curling behind the bottle')),
        b.txt('angle', 'Kamera', '85 mm, low three-quarter'), b.txt('light', 'Işık'),
        b.txt('headline', 'Başlık (boş = öneri)', 'Light On Skin'), b.txt('tagline', 'Slogan (boş = öneri)'),
        b.sel('hpos', 'Başlık konumu', POS), b.sel('tpos', 'Slogan konumu', POS), wide(b.sel('type', 'Yazı stili', TYPE)),
        b.txt('color', 'Başlık rengi', 'warm off-white'), b.txt('color2', 'Slogan rengi'),
        b.sel('aspect', 'Oran', [['', 'Seçili oran'], ['4:5', '4:5'], ['1:1', '1:1'], ['9:16', '9:16'], ['16:9', '16:9'], ['3:4', '3:4']]),
        b.chk('useBg', 'Arka plan sekmesindeki sahneyi set olarak kullan'), wide(b.txt('setting', 'Set (kutu işaretli değilse)')))),
      el('div', { class: 'row' }, btn('Yeni başlık önerisi', () => { o.sug = (o.sug | 0) + 1; keep('ad', o); run(); })), out);
      run();
    },
  });

  /* ======================================================================
     8. ANİMASYON & GENJUTSU
     ====================================================================== */
  const ANTI = [{"group": "Movement and camera", "symptom": "The clip is dead, the model held nothing but style and runtime", "cause": "more than one event in 5 s", "cure": "split it across several generations; count the events before writing any text"}, {"group": "Movement and camera", "symptom": "The event played, but the clip reads like an animated postcard", "cause": "no continuous layer", "cure": "something has to live from first frame to last at its own rhythm, out of sync with the actions; at least one exit from frame"}, {"group": "Movement and camera", "symptom": "Everything froze except the event I ordered", "cause": "a wall of prohibitions in Locks/Geometry", "cure": "Geometry down to two lines; unlock the living layers by name; write exceptions for scripted events into Locks"}, {"group": "Movement and camera", "symptom": "Third pass on the text and the number of details/highlights won't change", "cause": "text does not control quantity", "cure": "change the reference or fix it in post; or set the budget as a number (\"only TWO faces catch light\")"}, {"group": "Movement and camera", "symptom": "The camera is locked off even though movement was ordered", "cause": "the formula was paraphrased and a phrase was lost", "cure": "copy the camera formula character for character; check that every part is there (agent + target + linearity + anchor stated as a consequence + parallax)"}, {"group": "Movement and camera", "symptom": "The object grows instead of the camera moving", "cause": "the checkpoint was given to the object, not the camera", "cure": "the camera is the actor; the object's position is written as a CONSEQUENCE (\"by the last frame X sits one fifteenth higher\")"}, {"group": "Movement and camera", "symptom": "The move is limp, drifting", "cause": "speed was set in words", "cure": "numbers only — a fraction of the frame or a percentage of displacement"}, {"group": "Movement and camera", "symptom": "The camera ramps at the ends", "cause": "the model applies easing by default", "cure": "strictly linear speed, constant like a conveyor, no ease-in and no ease-out; CUT OFF by the end of the shot, not finished by it"}, {"group": "Movement and camera", "symptom": "A flat/layered frame came back with a 3D rotation", "cause": "\"crane up/down\" with no per-plane breakdown", "cure": "spell out the displacement percentage for every plane + the mandatory parallax phrase"}, {"group": "Movement and camera", "symptom": "The camera drove past the edge of the composition", "cause": "a push with no last-frame anchor", "cure": "not \"ends on the chest\", but \"the last frame's framing matches the first\" / \"the head stays in frame in every frame\""}, {"group": "Movement and camera", "symptom": "The orbit didn't make it around, stalled at 180°", "cause": "no production corpus has 360° (their ceiling is 180°), yet ours made it — so it comes down to construction", "cure": "camera clause first + a waypoint route + explicit duration (the orbit takes the full N seconds) + the character's action as a separate clause + the route repeated three times; plan B — two 180° passes chained on the last frame"}, {"group": "Movement and camera", "symptom": "The camera movement disappeared during the orbit", "cause": "action and camera in one clause", "cure": "camera and character are independent clauses; action from the upper body only"}, {"group": "Movement and camera", "symptom": "The character walks into depth and breaks the style", "cause": "the Z axis in a flat world", "cure": "exits in-plane only: sideways, past the edge, behind an occluder, or by merging the silhouette into a black mass"}, {"group": "Character and continuity", "symptom": "The hidden hand got filled in as \"neutral\" / copied off the other one", "cause": "it was never declared", "cure": "declare anything hidden in five places (the inventory, the beat where it appears, the second frame's inventory, Locks, Consistency)"}, {"group": "Character and continuity", "symptom": "The prop from the reference vanished", "cause": "the verb said the prop isn't there yet (\"whips out\")", "cure": "check every verb against the \"before\" state: \"raises\", \"shifts\", \"already holding\""}, {"group": "Character and continuity", "symptom": "A second/new copy of the object appeared", "cause": "negation plants the object; `no cloning` doesn't work", "cure": "a positive counting formula: exactly one X … never spawns a new, second or different X"}, {"group": "Character and continuity", "symptom": "Left and right swapped", "cause": "the model doesn't hold left/right", "cure": "specify by position in frame (\"the one further left of the pair\") or proximity to camera (\"the near arm is bare\")"}, {"group": "Character and continuity", "symptom": "The shadow flipped", "cause": "the model doesn't hold shadow orientation", "cure": "build it by hand; on an empty background use the shadow as a fixed-in-world anchor"}, {"group": "Character and continuity", "symptom": "Fingers of two interlocked hands come out as slop", "cause": "a hand-to-hand interlock never holds at all", "cure": "one hand works, the other hangs along the body as a flat shape"}, {"group": "Character and continuity", "symptom": "Proportions drifted, a giant next to a dwarf", "cause": "the only reference is a close-up", "cure": "only a turnaround sheet holds full-body proportions"}, {"group": "Character and continuity", "symptom": "The character is \"not the same one\" after swapping references", "cause": "a rejected frame or our own draft was fed in", "cure": "only approved material as a reference; a draft goes in only for a spot edit on that same draft"}, {"group": "Character and continuity", "symptom": "The asymmetry jumped to the other side", "cause": "a mirrored reference in the set", "cure": "scope it: defines silhouette and arm only, do not copy its hair; lock the asymmetry against the frontal reference"}, {"group": "Character and continuity", "symptom": "The angle didn't change even though the text ordered it", "cause": "the reference outweighs the text", "cure": "change the reference, not the text"}, {"group": "Character and continuity", "symptom": "A defining trait didn't hold (the toothpick started smoking like a cigarette)", "cause": "the trait already reads ambiguously in the first frame", "cure": "fix the image, the prompt won't help"}, {"group": "Character and continuity", "symptom": "Fast hands morph", "cause": "the model's ceiling on fine mechanics", "cure": "a separate pass on a separate close-up first frame; write the mechanics as a sequence of states of the detail"}, {"group": "Cadence and style", "symptom": "The on twos never showed up", "cause": "the Cadence block drowned in the volume of text, or clashes with a second cadence", "cure": "one cadence per prompt; cut events down; fallback — do the on twos in post with fps=12"}, {"group": "Cadence and style", "symptom": "Everything got stepped, including the smoke and the camera", "cause": "no exceptions declared", "cure": "only the smoke and the ambient air move smoothly + the camera glides continuously — the cadence lives in the drawings, never in the camera"}, {"group": "Cadence and style", "symptom": "The movement smoothed out into interpolation", "cause": "enemy words in the beats", "cure": "drop smoothly, one slow certain movement → stepping through its drawn poses"}, {"group": "Cadence and style", "symptom": "The image drifted into photorealism", "cause": "2.5 drifts harder than 2.0", "cure": "the exact style name + a repeat at the end + Strictly exclude + bring the reference to the target style beforehand"}, {"group": "Cadence and style", "symptom": "The fabric shivers in tiny ripples", "cause": "high-frequency ripple is a glitch", "cure": "wind in gusts: gust → one slow swell over 2–3 s → hangs; NEVER ripples rapidly"}, {"group": "Editing and sound", "symptom": "The cut jumps, and it's ugly", "cause": "the cut caught the character mid-move", "cure": "stop before the cut, settle into reference B's pose, cut in the middle of a gesture"}, {"group": "Editing and sound", "symptom": "A dissolve instead of a cut", "cause": "the cut was declared once", "cure": "declare it three times: header, body, Consistency"}, {"group": "Editing and sound", "symptom": "The inventory changed across the cut", "cause": "the hidden items weren't declared in both shots", "cure": "Locks carried across the cut + the glove count never changes across the cut"}, {"group": "Editing and sound", "symptom": "Music showed up", "cause": "a rising sub reads to the model as score", "cure": "ban it with a list, including swelling or rising tones, sub-bass builds"}, {"group": "Editing and sound", "symptom": "An object that existed only in the sound turned up in frame", "cause": "sound drags the picture with it", "cure": "don't order sound for anything that isn't in frame (\"wingbeats\" will draw in wings)"}, {"group": "Editing and sound", "symptom": "The hit reads as late", "cause": "the transient sits exactly on the contact frame", "cure": "put it 1–2 frames before contact"}, {"group": "Editing and sound", "symptom": "The whoosh reads as a miss", "cause": "the whoosh keeps going past the hit", "cure": "cut it off with the hit itself"}, {"group": "Content moderation", "symptom": "\"Not eligible\" in the UI", "cause": "one pipeline's pre-check on a recognizable likeness", "cure": "other engines don't filter it; check whether it's the RESULT being blocked, not the words"}, {"group": "Content moderation", "symptom": "The generation fails 4/4 at the end", "cause": "the filter is on the result, not the prompt", "cure": "change the design/pose, not the wording; the same thing may pass on the video pipeline"}, {"group": "Content moderation", "symptom": "A pose with a lift/violence won't pass", "cause": "contact violence", "cure": "write it **without contact**: an object torn away (hand–object), the victim sinks down on their own; a hit/shove = a failed take and the filter"}, {"group": "Discipline", "symptom": "The take that came back can't be read", "cause": "several variables changed at once", "cure": "one variable per pass"}, {"group": "Discipline", "symptom": "\"The model can't do this\" after a single generation", "cause": "no sample size", "cure": "production corpora run 3–4 generations per submit and repeat the prompt up to 7 times; on long precise prompts it's the opposite — one submit and edit the line"}, {"group": "Discipline", "symptom": "The whole prompt got rewritten over one defect", "cause": "whatever was working got lost", "cure": "edit only the physical state where the failed take starts, and the state it has to arrive at"}];
  const SEND_CHECK = ['5 saniyede en fazla bir olay', 'İlk kare sabitlendi (ya da referans modu gerekçeli)', 'Her fiil "önceki" durum için kontrol edildi', 'Kameradan gizlenen her şey beş yerde beyan edildi', 'Çekim başına tek tip kamera hareketi', 'Kamera komutu her aşamada tekrar edildi', 'Sürekli bir katman var: ilk kareden son kareye yaşayan bir şey, biri kadrajdan çıkıyor', 'Nesne sayıları olumlu formülle kapandı ("exactly one X … never spawns a second X")', 'Kilitler hareketi boğmadı: canlı katmanlar adıyla serbest', 'Stil tam adıyla verildi ve sonda tekrarlandı', 'Ses: diegetik liste verildi, müzik ve altyazı açıkça yasak', 'Bu çalıştırmanın test ettiği tek değişken belli'];
  const HAZARD = [[/\bcarts?\b/i, '"cart" → "car" okunuyor: "supermarket trolley" yaz'], [/security guard|\bstaff\b|checkout/i, '"security guard / staff / checkout" polis üretti'], [/\bfrozen\b/i, '"frozen" heykel üretir'], [/armband|insignia|\bflags?\b|emblem/i, 'Üniformalı dönem: "no flag, no patch, no badge, no armband, no insignia of any kind" ekle'], [/"[^"]+"/, 'Tırnaklı metin altyazı çağırır: "no subtitles, no on-screen text anywhere in the clip" eklendi']];
  function genjutsu(o) {
    let p;
    const keepList = o.keep || 'the set, the light, the camera and its motion, every cut';
    if (o.gmode === 'swap') {
      p = `Replace ${o.src || '[the source element]'} with ${o.target || '[the target]'} from @Image 1, ${o.size || 'the same overall size as the source element'}, ${o.path || 'in exactly its place, following the same path and the same rotation as the source object'}, ${o.adds || '[one or two behaviours the target adds]'}. ${o.person ? 'She herself does not change in any way: the same face, skin, hair, body, height, expression, gaze, walk. ' : ''}Everything else stays exactly identical to the original video — ${keepList}.`;
    } else if (o.gmode === 'recast') {
      const maps = lines(o.maps).map((m) => { const [a, b2] = m.split(/→|->/).map((x) => x.trim()); return b2 ? `where ${a} stood there is ${b2}` : m; }).join('; ');
      p = `Keep ${o.beats || 'the camera movement, every cut, the timing and the subject\'s every movement'}; recast ${o.src || '[the subject]'} as ${o.target || '[target]'} from @Image 1 doing the same beats in ${o.loc || '[location]'} from @Image 2. ${maps ? cap(maps) + '. ' : ''}${o.light ? cap(o.light) + '. ' : ''}${o.bans ? cap(o.bans) + '. ' : ''}Photoreal, cinematic anamorphic, film grain, no on-screen text.`;
    } else {
      const blocks = lines(o.shots).map((l, i) => { const [t, fr, ch] = l.split('|').map((x) => (x || '').trim()); return `Shot ${i + 1}, ${t || '[t0] s to [t1] s'}, ${fr || '[the recognisable framing]'}: ${ch || '[FIRST the object change with its silhouette; then the person; then the world; then the light]'}.`; });
      p = [`Keep the camera movement, the framing, the timing, every hard cut, ${o.beats || 'the subject\'s exact positions and movements'} in every shot; rebuild the world, the costumes and ${o.src || 'the object'} so that each shot is ${o.target || '[a later century / a different place]'}.`, ...blocks, `${o.bans ? cap(o.bans) + ' ' : ''}Photoreal, cinematic anamorphic, film grain, no on-screen text.`].join('\n');
    }
    const hz = HAZARD.filter(([re]) => re.test(p + ' ' + o.target + ' ' + o.src));
    if (/"[^"]+"/.test(p) && !/no subtitles/.test(p)) p += ' No subtitles, no on-screen text anywhere in the clip.';
    return { p, hz };
  }
  CB.DIR.register({
    id: 'anim', tr: 'Animasyon & Genjutsu', sub: 'Belirti → çare · Motion Transfer · Object Swap', group: GROUP,
    render(main, ctx) {
      const o = load('anim', { dur: 10, events: '', sym: [], gmode: 'swap', src: '', target: '', size: '', path: '', adds: '', person: false, keep: '', beats: '', loc: '', maps: '', light: '', bans: '', shots: '' });
      const out = el('div', { class: 'dv-out' });
      const run = () => {
        const ev = lines(o.events).length;
        const cap5 = Math.max(1, Math.floor(o.dur / 5));
        const fixes = ANTI.filter((a, i) => o.sym.includes(i));
        const g = genjutsu(o);
        out.replaceChildren(
          el('div', { class: 'section' }, el('h3', { text: 'Olay bütçesi' }), checks([[ev <= cap5, `${ev} olay / ${o.dur} sn → tavan ${cap5} (5 sn'de bir; mutlak üst sınır ${cap5 * 2})`], [ev <= cap5 * 2, ev > cap5 * 2 ? 'Birden çok üretime böl: metni sıkıştırma' : 'Yoğunluk sınırın içinde']])),
          fixes.length ? pcard('Düzeltme listesi', `${fixes.length} belirti`, fixes.map((f) => `• ${f.symptom}\n  cause: ${f.cause}\n  cure: ${f.cure}`).join('\n\n')) : note('Belirti seçersen çare listesi burada oluşur.'),
          el('div', { class: 'section' }, el('h3', { text: 'Genjutsu ön kontrolü' }), ...(g.hz.length ? g.hz.map(([, t]) => note(t, 'warn')) : [note('Tehlikeli kelime yok.', 'okk')]),
            note('Girdi 4–30 sn · çıktı kaynak çözünürlük/fps/sesiyle · çok çekimli kaynakta her çekim 4.0 sn\'ye yeniden zamanlanır: kaynağı 4.0 sn çekimlerle kur.')),
          pcard('Genjutsu prompt', { swap: 'Object Swap · değişim emri', recast: 'Motion Transfer · yeniden oyuncu', blocks: 'Motion Transfer · çekim blokları' }[o.gmode], g.p,
            'Onarım merdiveni: aynı promptla bir kez yeniden dene → kalanı ve yerine geçeni adlandır → nesne satırını bloğun başına al → mod değiştir → kimlik için kare yakalama → dur.'));
      };
      const b = binder('anim', o, run);
      const groups = [...new Set(ANTI.map((a) => a.group))];
      const symBox = el('div', { class: 'dv-blocks' }, ...groups.map((gname) => el('fieldset', null, el('legend', { text: gname }),
        ...ANTI.map((a, i) => [a, i]).filter(([a]) => a.group === gname).map(([a, i]) => {
          const cb = el('input', { type: 'checkbox', id: 'dv-sym' + i }); cb.checked = o.sym.includes(i);
          cb.addEventListener('change', () => { o.sym = cb.checked ? [...o.sym, i] : o.sym.filter((x) => x !== i); keep('anim', o); run(); });
          return el('label', { class: 'dv-chk', for: 'dv-sym' + i }, cb, el('span', { text: a.symptom }));
        }))));
      head(main, 'Animasyon & Genjutsu', 'AI animasyon yönetimi: önce olayları say (5 sn\'de bir olay), ilk kareyi sabitle, tek değişkenle dene. Belirti seç, çaresini al. Higgsfield Genjutsu için Object Swap / Motion Transfer dilbilgisi.');
      main.append(
        el('div', { class: 'section' }, el('h3', { text: 'Olay sayacı' }), grid(b.num('dur', 'Süre (sn)', 2, 30, 1), wide(b.area('events', 'Olaylar (dünyanın fiziksel durumu her değiştiğinde bir satır)', 3, 'flicks the cigarette away\npicks up the hat\nturns his head')))),
        el('details', { class: 'dv-details' }, el('summary', { text: 'Göndermeden önce kontrol listesi' }), el('ol', { class: 'checks' }, ...SEND_CHECK.map((t) => el('li', { text: t })))),
        el('div', { class: 'section' }, el('h3', { text: 'Belirtiler' }), symBox),
        el('div', { class: 'section' }, el('h3', { text: 'Genjutsu' }), grid(
          b.sel('gmode', 'Mod', [['swap', 'Object Swap (tek öğe)'], ['recast', 'Motion Transfer (yeniden oyuncu)'], ['blocks', 'Motion Transfer (çekim başına dünya)']]),
          b.txt('src', 'Kaynaktaki öğe / özne', 'the sneaker'), b.txt('target', 'Hedef', 'the live lobster'),
          b.txt('size', 'Boyut cümlesi', 'the same overall size as the sneaker'), wide(b.txt('path', 'Konum / yol', 'sitting on the plinth in exactly the sneaker\'s place and orientation')),
          wide(b.txt('adds', 'Hedefin eklediği 1–2 davranış', 'its antennae sweep slowly')), b.chk('person', 'Kişi hiç değişmesin (giysi değişimi)'),
          wide(b.txt('keep', 'Dokunulmayanlar (adıyla)')), wide(b.txt('beats', 'Korunan vuruşlar (adıyla)', 'the jab, the pivot turn, the sunglasses lift')),
          b.txt('loc', 'Yeni konum (@Image 2)'), wide(b.area('maps', 'Pratik eşlemeleri: kaynak → yeni (bir satıra bir)', 2, 'the parked car → a long oak table')),
          b.txt('light', 'Işık kaydı'), b.txt('bans', 'Yasaklar', 'no flags, no emblems, no armbands, no insignia in any shot'),
          wide(b.area('shots', 'Çekim blokları: zaman | çerçeve | değişim (önce nesne → kişi → dünya → ışık)', 3, '0s to 3.9s | the wide two-shot of the throw | unchanged'))))
        , out);
      run();
    },
  });
})();
