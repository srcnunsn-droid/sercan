/* CineBG Studio — Yönetmen Masası: Sahne Motoru (GOTRV), Oyunculuk Görevi (ACTING TASK), Blocking Haritası.
   Tanımlar tig-scene-engine, tig-acting-task ve tig-blocking-map skill'lerinden — ders kitabı tanımları değil, birebir. */
(function () {
  const CB = window.CB;
  if (!CB || !CB.DIR) return;
  const U = CB.UI;
  const { el } = U;
  const cap = (t) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : '');
  const up = (t) => (t || '').toLocaleUpperCase('en');
  const slug = (t) => (t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, ' ').trim().split(' ').map((w, i) => (i ? cap(w.toLowerCase()) : w.toLowerCase())).join('');
  const charNames = (ctx) => ctx.chars().map((c) => c.name).filter(Boolean);

  /* ======================================================================
     1) SAHNE MOTORU — Goal · Obstacle · Tactic · Reversal · Value Shift
     ====================================================================== */
  const FORMS = [['none', '— yok (tırmanma) —'], ['flip', 'Kendi hamlem bana döner'], ['hidden', 'Gizli fail ortaya çıkar'], ['general', 'Genel: durum tersine döner']];
  const FORM_EN = { flip: 'my own action flips on me', hidden: 'hidden agency revealed', general: 'the situation turns opposite to what the tactic intended' };
  const SCALES = [['local', 'Yerel — bu aşamayı tehdit eder'], ['global', 'Küresel — tüm hedefi tehdit eder']];
  const beat = (o) => Object.assign({ obstacle: '', risk: '', scale: 'local', tactic: '', info: '', form: 'none', reversal: '', before: '', after: '', speaker: '', paren: '', line: '' }, o);
  const PRESETS = {
    pitch: {
      tr: 'Örnek: kirli gömlekle sunum',
      storyGoal: 'Marcus saves his failing studio by closing the buyer deal today.',
      past: 'The night before, Marcus slept in his car; he arrives smelling of it.',
      goal: 'Get into the pitch room and make the pitch before the buyer leaves.',
      chain: true, resolves: true, hero: 'MARCUS', partner: 'BUYER', slug: 'INT. CORPORATE TOWER LOBBY - DAY', genre: 'psychological drama / thriller',
      beats: [
        beat({ obstacle: 'Security stops him at the gate: he stinks and looks homeless.', risk: 'the pitch stage — no entry, no pitch', scale: 'local', tactic: 'He runs to the gym across the street to shower and change.', info: 'Clean, he can pass security — but the clock is now against him.', speaker: 'MARCUS', paren: 'to the guard, smiling too hard', line: 'Ten minutes. I will be back in ten minutes.' }),
        beat({ obstacle: 'The shower made him twelve minutes late; the buyer is already in the elevator.', risk: 'the whole deal — the buyer leaves the city tonight', scale: 'global', tactic: 'He takes the stairs to intercept the elevator on the lobby floor.', info: 'He learns the buyer was told he cancelled.', form: 'flip', reversal: 'The shower he took FOR the pitch is what made him miss it.', before: 'a hustler who always finds a way', after: 'a man sabotaged by his own carefulness' }),
        beat({ obstacle: 'The buyer will not hear a pitch in a lobby.', risk: 'the deal', scale: 'global', tactic: 'He asks only for the buyer\'s ride to the airport.', info: 'The buyer agrees too fast.', form: 'hidden', reversal: 'The buyer arranged the cancellation message to test whether Marcus would chase the deal.', before: 'a cold, indifferent money man', after: 'a secret champion who wanted proof of hunger', speaker: 'BUYER', paren: 'not looking up', line: 'Short notice is the only kind you give.' }),
      ],
    },
    photo: {
      tr: 'Örnek: kayıp fotoğraf / bitik pil',
      storyGoal: 'Elif proves her brother was not at the crime scene.',
      past: 'The police say a photo places her brother at the scene at 21:40.',
      goal: 'Find the original photo with the true timestamp on the old laptop.',
      chain: true, resolves: true, hero: 'ELIF', partner: 'MURAT', slug: 'INT. ELIF\'S FLAT - NIGHT', genre: 'thriller',
      beats: [
        beat({ obstacle: 'Thousands of unsorted folders and only one night before the hearing.', risk: 'the search stage — time runs out', scale: 'local', tactic: 'She checks Pictures/Family first, where photos usually live.', info: 'It is not there — so it was never imported by her.' }),
        beat({ obstacle: 'The laptop dies: dead battery, no charger in the flat.', risk: 'the whole search — a dead machine cannot be searched', scale: 'local', tactic: 'She calls Murat, the only neighbour with the same model.', info: 'Murat has the charger — and asks why she needs that laptop tonight.', speaker: 'MURAT', paren: 'at the door, charger behind his back', line: 'That old thing? Why tonight?' }),
        beat({ obstacle: 'Murat insists on staying while she searches.', risk: 'the proof — he can see what she finds', scale: 'global', tactic: 'She lets him stay and searches the camera import folder.', info: 'The original is there with the true timestamp, 20:15.', form: 'hidden', reversal: 'Murat deleted the copy from the shared drive: he was the one who sent the police the edited photo.', before: 'the kind, helpful neighbour', after: 'the hidden hand framing her brother' }),
      ],
    },
  };
  const DEFS = Object.assign({ hero: 'HERO', partner: 'PARTNER', slug: '', genre: 'psychological drama / thriller', storyGoal: '', past: '', goal: '', chain: false, resolves: true, beats: [beat({}), beat({})] }, {});
  let SE = Object.assign({}, JSON.parse(JSON.stringify(DEFS)), U.store.get('dirScene', {}));
  const saveSE = () => U.store.set('dirScene', SE);

  function slugFromBg(ctx) {
    const cur = ctx.cur() || {}; const s = cur.spec;
    if (!s) return 'INT. LOCATION - NIGHT';
    const io = s.ctx === 'int' || s.ctx === 'studio' ? 'INT.' : 'EXT.';
    const night = /night|midnight|moon|blue hour|dusk/i.test(s.time.en);
    const name = up(s.cat.en.split(/[,(]/)[0]).slice(0, 48);
    return `${io} ${name} - ${night ? 'NIGHT' : 'DAY'}`;
  }

  function audit() {
    const B = SE.beats;
    const rev = B.filter((b) => b.form !== 'none');
    const issues = [];
    /* Goal */
    let goalV;
    if (!SE.goal.trim()) { goalV = 'FAIL — sahne hedefi yazılmamış.'; issues.push({ w: 5, k: 'goal', t: 'Sahne hedefi yok' }); }
    else if (!SE.storyGoal.trim()) { goalV = 'EKSİK — hikâye hedefi yok; çıkarma testi yapılamaz.'; issues.push({ w: 2, k: 'goal', t: 'Hikâye hedefi verilmedi' }); }
    else if (!SE.chain) { goalV = 'RİSK — çıkarma testi işaretlenmedi: sahne çıkarılırsa hikâye hedefine giden zincir kopuyor mu?'; issues.push({ w: 4, k: 'goal', t: 'Sahne zincirde nedensel halka değil (yetim sahne riski)' }); }
    else goalV = `GEÇER — "${SE.goal.trim()}" hikâye hedefine nedensel bir halka; çıkarılırsa zincir kopar.`;
    /* Obstacle */
    const fake = B.map((b, i) => (!b.obstacle.trim() || !b.risk.trim() ? i + 1 : 0)).filter(Boolean);
    const obsV = fake.length ? `GEVŞEK — ${fake.join(', ')}. beat'te ne riske girdiği adlandırılmamış (sahte engel).` : B.map((b, i) => `${i + 1}: ${b.risk} (${b.scale === 'global' ? 'küresel' : 'yerel'})`).join(' · ') + ' — GEÇER';
    if (fake.length) issues.push({ w: 4, k: 'obstacle', t: `Sahte engel (beat ${fake.join(', ')})`, i: fake[0] - 1 });
    /* Tactic */
    const spins = B.map((b, i) => (b.tactic.trim() && !b.info.trim() ? i + 1 : 0)).filter(Boolean);
    const noTac = B.map((b, i) => (!b.tactic.trim() ? i + 1 : 0)).filter(Boolean);
    let tacV = 'GEÇER — her taktik engelin zorladığı makul bir tahmin ve sonucu bilgi döndürüyor.';
    if (noTac.length) { tacV = `EKSİK — ${noTac.join(', ')}. beat'te taktik yok: tehdit hamle zorlamıyorsa sahne yok.`; issues.push({ w: 3, k: 'tactic', t: 'Taktik yok', i: noTac[0] - 1 }); }
    if (spins.length) { tacV = `ZAYIF — ${spins.join(', ')}. beat'te taktik sıfır bilgi döndürüyor (boşa dönen tekerlek; arama daralmıyor).`; issues.push({ w: 3.5, k: 'tactic', t: 'Bilgi döndürmeyen taktik', i: spins[0] - 1 }); }
    /* Reversal */
    let revV;
    if (!rev.length) {
      revV = SE.resolves ? 'FAIL — çözülen sekansta hiç dönüş yok (her sekansta en az bir dönüş şart).' : 'Dönüş yok — sekans burada çözülmüyorsa saf tırmanma olarak kabul; sekans çözülürken en az bir dönüş şart.';
      if (SE.resolves) issues.push({ w: 6, k: 'reversal', t: 'Çözülen sekansta sıfır dönüş' });
    } else revV = `${rev.length} dönüş — ` + rev.map((b) => `${B.indexOf(b) + 1}: ${FORMS.find((f) => f[0] === b.form)[1].toLocaleLowerCase('tr')}`).join(' · ') + ' — GEÇER';
    /* Value shift */
    const inert = rev.filter((b) => !b.before.trim() || !b.after.trim() || b.before.trim().toLowerCase() === b.after.trim().toLowerCase());
    let vsV;
    if (!rev.length) vsV = 'Dönüş olmadığı için değer kayması yok.';
    else {
      vsV = rev.map((b) => (inert.includes(b) ? `${B.indexOf(b) + 1}: ATIL — seyircinin önceki/sonraki hükmü adlandırılamıyor` : `${B.indexOf(b) + 1}: ${b.before} → ${b.after}`)).join(' · ');
      const verdicts = []; rev.forEach((b) => { if (b.before.trim()) verdicts.push(b.before.trim().toLowerCase()); if (b.after.trim()) verdicts.push(b.after.trim().toLowerCase()); });
      const flip = rev.some((b, i) => i > 0 && b.after.trim() && verdicts.slice(0, verdicts.lastIndexOf(b.after.trim().toLowerCase())).includes(b.after.trim().toLowerCase()));
      vsV += flip ? ' · GİDİŞAT: hüküm eski bir hükme geri dönüyor — derinleşen tasarlanmış yay değil, rastgele gidip gelme.' : rev.length > 1 ? ' · GİDİŞAT: her dönüş yeni bir hüküm kuruyor — derinleşen yay.' : '';
      if (inert.length) issues.push({ w: 7, k: 'value', t: 'Atıl dönüş: değer kayması yok', i: B.indexOf(inert[0]) });
      if (flip) issues.push({ w: 2.5, k: 'value', t: 'Değer kayması gidip geliyor' });
    }
    issues.sort((a, b) => b.w - a.w);
    const weakest = issues[0];
    return { goalV, obsV, tacV, revV, vsV, weakest, issues };
  }

  function whatIf(a) {
    const w = a.weakest;
    const H = SE.hero || 'the hero';
    if (!w) return ['1. (Minimal) Zincir sağlam. En güçlü dönüşün değer kaymasını bir sahne daha erken tohumla ki seyircinin ilk hükmü daha net kurulsun.', '2. (Temiz) Son dönüşü "gizli fail" biçimine çevir: güvenilen kişi baştan beri kahramana göre hareket ediyor olsun; hakikat açığı tam o anda kapansın.'];
    const B = SE.beats; const b = w.i != null ? B[w.i] : B[B.length - 1];
    const n = w.i != null ? w.i + 1 : B.length;
    switch (w.k) {
      case 'value': return [
        `1. (Minimal) ${n}. beat'teki dönüşü olduğu gibi bırak; yalnızca seyircinin hükmünü değiştirecek tek bir bilgi ekle: dönüş ${H} hakkında neyi ortaya çıkarıyor? Önceki hüküm "${b.before || '…'}", sonraki hüküm adı konmuş yeni bir hüküm olsun (ör. "yardımsever" → "hesapçı").`,
        `2. (Temiz) Dönüşü karakterin seçimine bağla: ${H}'ın taktiği geri tepsin ve ${H} bunun bedelini bilerek ödesin — seyirci onu "şanssız" değil "kararlı ama kendini sabote eden" olarak yeniden yargılasın.`,
        '3. (İsteğe bağlı) Dönüşü ikinci karakterin gizli failliğiyle çift katmanlı yap: hem olay tersine döner hem de ortağın hükmü değişir.'];
      case 'reversal': return [
        `1. (Minimal) Son beat'teki taktiği koru, sonucu tersine çevir: ${H}'ın hamlesi tam amaçladığı şeyin aleyhine çalışsın (kendi hamlem bana döner).`,
        `2. (Temiz) Sekansın ortasına gizli fail koy: ${SE.partner || 'ortak'} baştan beri ${H} üzerinde iş görüyor olsun; hakikat açığı kapanırken ortaya çıksın ve seyirci ikisini de yeniden yargılasın.`];
      case 'obstacle': return [
        `1. (Minimal) ${n}. beat'teki engeli koru ama neyi riske attığını ve ölçeğini adlandır: kaybedilirse hangi aşama ya da tüm hedef çöker?`,
        `2. (Temiz) Engeli tek bir sert duvara çevir (ör. bitik pil): yeni bir alt hedef doğursun ve kendi arazisini getirsin.`];
      case 'tactic': return [
        `1. (Minimal) ${n}. beat'teki taktiği koru; başarısızlığı bir bilgi döndürsün: ${H} artık neyin orada OLMADIĞINI biliyor ve bir sonraki hamlesi buna göre değişiyor.`,
        `2. (Temiz) Taktiği hakikat açığından türet: ${H} engeli yanlış okuyor ama makul bir tahminde bulunuyor; her yanlış tahmin arama alanını daraltıyor.`];
      default: return [
        `1. (Minimal) Sahne hedefini hikâye hedefine bağla: "${SE.storyGoal || '…'}" için bu sahne olmadan hangi halka kopar? Bunu sahne hedefi olarak yaz.`,
        '2. (Temiz) Sahneyi "önceden kurulan bir şeyi düzeltme" üzerine kur: bir önceki sahnenin sonucu (ör. koku) bu sahnenin geçmişi olsun ve hedef onu en hızlı şekilde çözmek olsun.'];
    }
  }

  function screenplay() {
    const B = SE.beats;
    const out = [];
    out.push(SE.slug || 'INT. LOCATION - NIGHT', '');
    if (SE.past.trim()) out.push(SE.past.trim(), '');
    B.forEach((b) => {
      const action = [b.obstacle, b.tactic, b.form !== 'none' ? b.reversal : ''].map((x) => x.trim()).filter(Boolean).join(' ');
      if (action) out.push(action, '');
      if (b.line.trim()) {
        out.push(up(b.speaker || SE.hero || 'HERO'));
        if (b.paren.trim()) out.push(`(${b.paren.trim().replace(/^\(|\)$/g, '').toLowerCase()})`);
        out.push(b.line.trim(), '');
      }
    });
    return out.join('\n').trim() + '\n';
  }

  function renderScene(main, ctx) {
    if (!SE.slug) SE.slug = slugFromBg(ctx);
    const out = el('div', { class: 'dtool-out' });
    const form = el('div', { class: 'dtool-form' });
    main.append(el('div', { class: 'section' }, el('h3', { text: 'Sahne Motoru — Goal · Obstacle · Tactic · Reversal · Value Shift' }),
      el('p', { class: 'hint', text: 'Tanımlar özel: hedef asla değişmez; engel tehdit eder (yalnızca maliyet çıkarmaz); taktik eksik bilgiyle makul bir tahmindir ve bilgi döndürür; her çözülen sekansta en az bir dönüş; değer kayması olmayan dönüş atıldır.' })),
      el('div', { class: 'dtool' }, form, out));
    const reOut = () => { saveSE(); renderOut(); };
    const re = () => { saveSE(); renderForm(); renderOut(); };
    function renderForm() {
      form.replaceChildren(
        U.section('Zincir',
          el('div', { class: 'row' },
            U.select('ds_pre', [['', 'Örnek yükle…'], ...Object.entries(PRESETS).map(([k, v]) => [k, v.tr])], '', (v) => { if (!v) return; SE = Object.assign({}, JSON.parse(JSON.stringify(PRESETS[v]))); delete SE.tr; re(); }),
            U.btn('Arka plandan slugline', () => { SE.slug = slugFromBg(ctx); re(); }),
            U.btn('Temizle', () => { SE = JSON.parse(JSON.stringify(DEFS)); SE.slug = slugFromBg(ctx); re(); })),
          U.field('Hikâye hedefi (değişmez büyük hedef)', U.textarea('ds_sg', SE.storyGoal, (v) => { SE.storyGoal = v; reOut(); }, 2)),
          U.field('Geçmiş — bu sahnenin düzelttiği şey (az önceki sahne de sayılır)', U.textarea('ds_past', SE.past, (v) => { SE.past = v; reOut(); }, 2)),
          U.field('Sahne hedefi (hikâye hedefine nedensel halka)', U.textarea('ds_goal', SE.goal, (v) => { SE.goal = v; reOut(); }, 2)),
          el('label', { class: 'dcheck' }, checkbox(SE.chain, (v) => { SE.chain = v; reOut(); }), ' Çıkarma testi: bu sahne çıkarılırsa zincir kopar'),
          el('label', { class: 'dcheck' }, checkbox(SE.resolves, (v) => { SE.resolves = v; reOut(); }), ' Bu sekans burada çözülüyor (tehlike açıldı → kapandı)'),
          el('div', { class: 'chips' },
            U.field('Kahraman', U.input('ds_h', SE.hero, (v) => { SE.hero = up(v); reOut(); })),
            U.field('Ortak / karşı taraf', U.input('ds_p', SE.partner, (v) => { SE.partner = up(v); reOut(); })),
            U.field('Slugline', U.input('ds_slug', SE.slug, (v) => { SE.slug = up(v); reOut(); })),
            U.field('Tür', U.input('ds_genre', SE.genre, (v) => { SE.genre = v; reOut(); }))),
          charNames(ctx).length ? el('p', { class: 'hint', text: 'Kayıtlı karakterler: ' + charNames(ctx).join(', ') }) : null),
        U.section('Beat\'ler',
          ...SE.beats.map((b, i) => beatBox(b, i)),
          el('div', { class: 'row' }, U.btn('＋ Beat ekle', () => { SE.beats.push(beat({})); re(); }))));
      function beatBox(b, i) {
        const f = (k, label, rows) => U.field(label, U.textarea(`ds_b${i}_${k}`, b[k], (v) => { b[k] = v; reOut(); }, rows || 2));
        const fi = (k, label, ph) => U.field(label, U.input(`ds_b${i}_${k}`, b[k], (v) => { b[k] = v; reOut(); }, ph));
        return el('div', { class: 'dbeat' },
          el('div', { class: 'dbeat-h' }, el('b', { text: `Beat ${i + 1}` }),
            U.btn('↑', () => { if (i) { SE.beats.splice(i - 1, 0, SE.beats.splice(i, 1)[0]); re(); } }),
            U.btn('Sil', () => { SE.beats.splice(i, 1); if (!SE.beats.length) SE.beats.push(beat({})); re(); })),
          f('obstacle', 'Engel — güçlü koşul'),
          el('div', { class: 'chips' }, fi('risk', 'Riske giren', 'aşama / hedef'), U.field('Ölçek', U.select(`ds_b${i}_sc`, SCALES, b.scale, (v) => { b.scale = v; reOut(); }))),
          f('tactic', 'Taktik — tehdidin zorladığı makul tahmin'),
          f('info', 'Döndürdüğü bilgi (aramayı nasıl daraltıyor)'),
          U.field('Dönüş biçimi', U.select(`ds_b${i}_f`, FORMS, b.form, (v) => { b.form = v; re(); })),
          b.form !== 'none' ? f('reversal', 'Dönüş') : null,
          b.form !== 'none' ? el('div', { class: 'chips' }, fi('before', 'Seyircinin hükmü — önce', 'ör. yardımsever'), fi('after', 'Seyircinin hükmü — sonra', 'ör. hesapçı')) : null,
          el('details', null, el('summary', { text: 'Diyalog (isteğe bağlı)' }),
            el('div', { class: 'chips' }, fi('speaker', 'Konuşan', SE.hero), fi('paren', 'Parantez', 'not looking up')),
            f('line', 'Replik', 2)));
      }
    }
    function renderOut() {
      const a = audit();
      const audText = [
        `SCENE/SEQUENCE: ${SE.slug || '—'} — ${SE.goal.trim() || 'hedef yok'}`,
        '',
        'CHAIN CHECK',
        `• Goal — ${a.goalV}`,
        `• Obstacle — ${a.obsV}`,
        `• Tactic — ${a.tacV}`,
        `• Reversal — ${a.revV}`,
        `• Value Shift — ${a.vsV}`,
        '',
        `WEAKEST POINT: ${a.weakest ? a.weakest.t : 'belirgin zayıf nokta yok'}`,
        '',
        'WHAT IF…',
        ...whatIf(a),
      ].join('\n');
      const fd = screenplay();
      const rev = SE.beats.filter((b) => b.form !== 'none' && b.before && b.after);
      const engine = rev.length ? `Motor notu: ${rev.map((b) => `dönüş (${FORM_EN[b.form]}) → seyirci ${SE.hero} hakkındaki hükmünü "${b.before}" → "${b.after}" olarak değiştirir`).join('; ')}.` : '';
      out.replaceChildren(
        el('article', { class: 'pcard dlint ' + (a.issues.some((x) => x.w >= 4) ? 'bad' : 'ok') },
          el('header', null, el('strong', { text: 'Zincir durumu' }), el('span', { text: a.issues.length ? `${a.issues.length} bulgu` : 'zincir sağlam' })),
          el('ul', null, ...(a.issues.length ? a.issues.map((x) => el('li', { class: x.w >= 4 ? 'e' : 'w', text: x.t })) : [el('li', { class: 'okl', text: 'Beş elemanın hepsi adlandırıldı.' })]))),
        U.pcard('Denetim (AUDIT)', 'CHAIN CHECK · WEAKEST · WHAT IF', audText, 'Öneriler taslaktır; yeniden yazılan satırları Final Draft biçiminde ekle.'),
        U.pcard('Senaryo · Final Draft biçimi', 'Fountain uyumlu', fd, engine || null),
        el('div', { class: 'row' },
          U.btn('⤓ .fountain', () => U.saveText(fd, `sahne_${slug(SE.hero) || 'scene'}.fountain`)),
          U.btn('⤓ .txt (denetim + senaryo)', () => U.saveText(audText + '\n\n' + fd, `sahne_${slug(SE.hero) || 'scene'}_audit.txt`))));
    }
    renderForm(); renderOut();
  }
  function checkbox(v, on) { const c = el('input', { type: 'checkbox' }); c.checked = !!v; c.addEventListener('change', () => on(c.checked)); return c; }

  /* ======================================================================
     2) OYUNCULUK GÖREVİ — ACTING TASK blokları
     ====================================================================== */
  const EYE = [
    'checks both of the partner\'s eyes for a sparkle of trust',
    'registers after each point whether it landed — interested, or about to smirk',
    'steals a look and snaps back before being caught',
    'measures the partner, memorizing the face',
    'compares what is felt with what the partner shows',
    'hunts the partner\'s face for the lie',
    'decides if the partner is serious',
    'waits for the punchline, ready to protect the mood',
    'holds the partner\'s eyes to make the point impossible to dodge',
    'watches the partner\'s hands, not the face — the face is where the danger is',
    'searches the partner\'s eyes for permission to stop pretending',
    'tests whether the partner noticed the slip',
  ];
  const VERBS = ['reassures', 'teases', 'pins down', 'begs', 'humiliates', 'disarms', 'tests', 'flatters', 'warns', 'distracts', 'comforts', 'dares', 'deflects', 'wins back', 'probes', 'shields'];
  const PRON = { he: ['he', 'his'], she: ['she', 'her'], they: ['they', 'their'] };
  const emp = (o) => Object.assign({ name: '', pron: 'he', channel: '', motive: '', goal: '', obstacle: '', tactic: '', plus: '', minus: '', listen: '' }, o);
  const AT_PRE = {
    suitcase: {
      tr: 'Örnek: anne oğlunun valizini hazırlıyor',
      event: 'Parting without pain', terrain: 'packing the army suitcase, an hour before he leaves', direction: 'make it painless — hide the feeling, never lose the positiveness', ending: 'He zips the suitcase and says he will call on Sunday.', axis: '',
      dialogue: 'MOTHER: Three pairs of socks. Wool ones, they say it gets cold.\nSON: Mom, they give us socks.\nMOTHER: Theirs are not mine.\nSON: I\'ll call on Sunday.',
      chars: [
        emp({ name: 'MOTHER', pron: 'she', channel: 'packing "ordinarily" — folding, counting, smoothing every item', motive: 'superstition — tears before a journey are a bad omen', goal: 'send him off strong, don\'t make him carry her fear', obstacle: 'the real feeling pressing every second; one wet look and the scene\'s line collapses', tactic: 'packs as if it were any trip, eyes stealing to him, measuring, memorizing, snapping back to the socks the moment he looks up' }),
        emp({ name: 'SON', pron: 'he', channel: 'eating "casually" at the table', motive: 'for mom', goal: 'leave her calm, show he is ready', obstacle: 'her hands slowing down — the moment she stops packing, the feeling wins', tactic: 'eats casually, watching her hands, not her face — because her face is where the danger is' }),
      ],
      lineTasks: {},
    },
    lab: {
      tr: 'Örnek: laboratuvar vizitesi (doktor / sağlıkçı)',
      event: 'The search for self-forgiveness', terrain: 'routine rounds at the bedside of a wired convict patient', direction: 'keep it routine work', ending: 'MEDIC (under his breath): Poor bastard. Just can\'t forgive himself.', axis: 'care for the patient',
      dialogue: 'MEDIC: Pulse is up again. Same as yesterday.\nDOCTOR: Write it down.\nMEDIC: He\'s crying. In his sleep.\nDOCTOR: REM. Write that down too.\nMEDIC: Poor bastard. Just can\'t forgive himself.',
      chars: [
        emp({ name: 'MEDIC', pron: 'he', channel: 'CARING — patient-care gestures beyond the checklist, checking the man, not the chart', motive: 'routine professionalism is his way of not betraying his oath — his penance, his path to self-forgiveness', goal: 'get through the round without the doctor seeing that it gets to him', obstacle: 'the case is too horrifying to stay routine; one crack and the line collapses', tactic: 'reports the numbers flat while his eyes keep going back to the patient\'s face, then checking whether the doctor noticed', plus: 'CARING', minus: 'Compromised' }),
        emp({ name: 'DOCTOR', pron: 'he', channel: 'OBLIGATED ACTIONS DONE RIGHT — correct metrics, on time, double-checking an entry', motive: 'the quiet experiment — feeding the test and observing whether the young one survives conscience', goal: 'keep the round on schedule and see what the young medic does', obstacle: 'the medic\'s care, which could pull him back into a hope he lost long ago', tactic: 'answers flat and watches the medic sideways, curious, registering every hesitation', plus: 'Corporate Loyal', minus: 'CARELESS' }),
      ],
      lineTasks: {},
    },
  };
  let AT = Object.assign({ event: '', terrain: '', direction: '', ending: '', axis: '', dialogue: '', chars: [emp({ name: 'A' }), emp({ name: 'B', pron: 'she' })], lineTasks: {}, breakAt: '' }, U.store.get('dirActing', {}));
  const saveAT = () => U.store.set('dirActing', AT);

  function parseDialogue() {
    return AT.dialogue.split('\n').map((l) => l.trim()).filter(Boolean).map((l, i) => {
      const m = /^([^:]{1,40}):\s*(?:\(([^)]*)\)\s*)?(.+)$/.exec(l);
      return m ? { i, who: m[1].trim().toUpperCase(), paren: m[2] || '', text: m[3].trim() } : { i, who: '', paren: '', text: l };
    });
  }
  const EMO_ADJ = /\b(sadly|nervously|angrily|happily|anxiously|tearfully|bitterly|joyfully|fearfully|sad|nervous|angry|happy|scared|upset|emotional)\b/i;
  const FACE = /\b(brows?|eyebrows?|lips? tremble|mouth trembles?|eyes? flick|eyes? widen|smiles?|frowns?|jaw clenches?|nostrils?|blinks? rapidly)\b/i;
  function actingBlocks() {
    const lines = parseDialogue();
    const warns = [];
    if (!lines.length) warns.push('Önce sahnenin TÜM diyaloğunu yaz — görev tek replikten kurulmaz.');
    if (!AT.ending.trim()) warns.push('Sahnenin sonunu yaz: olayın adı sondan okunur.');
    if (!AT.event.trim()) warns.push('Olayı adlandır — sahnedeki HER karakteri (sessiz olanları da) içermeli.');
    if (!AT.terrain.trim()) warns.push('Fiziksel eylemi (arazi) yaz — görünmez görev kameranın okuyacağı bir kanaldan geçer.');
    const blocks = AT.chars.filter((c) => c.name.trim()).map((c) => {
      const [p, pp] = PRON[c.pron] || PRON.he;
      const N = up(c.name);
      const mine = lines.filter((l) => l.who === N);
      const others = lines.filter((l) => l.who && l.who !== N);
      [c.tactic, c.motive, c.goal, c.channel].forEach((t) => { if (EMO_ADJ.test(t)) warns.push(`${N}: duygu sıfatı yönerge olarak kullanılmış ("${(t.match(EMO_ADJ) || [])[0]}") — onu üreten görevi yaz.`); if (FACE.test(t)) warns.push(`${N}: yüz koreografisi ("${(t.match(FACE) || [])[0]}") — gözü amaçlı bir eylem olarak yaz.`); });
      if (!c.channel.trim()) warns.push(`${N}: fiziksel kanal yok — her karakter aynı olayı kendi görünür davranışıyla oynar.`);
      const m2m = [];
      lines.forEach((l) => {
        const task = AT.lineTasks[`${N}|${l.i}`];
        if (l.who === N) {
          const t = task || { v: VERBS[0], e: EYE[1] };
          m2m.push(`— "${l.text}" — ${t.v} the partner; ${t.e}`);
        } else if (task && task.e) {
          m2m.push(`— (listening) "${l.text}" — ${task.e}`);
        }
        if (AT.breakAt && AT.breakAt === `${N}|${l.i}`) m2m.push(`— the line breaks here: "${l.text}" — ${pp} fuel runs out; the break IS the delivery of the scene`);
      });
      if (!mine.length && !m2m.length) m2m.push(`— (silent listener) ${c.listen || `${p} keeps a real task on the partner: decides if the partner is serious, protects the mood`}`);
      const contrast = c.plus || c.minus ? `\nCONTRAST: ${c.plus || '?'} (+) / ${c.minus || '?'} (−)${AT.axis ? ` — essential axis: ${AT.axis}` : ''}` : '';
      if (!others.length && lines.length && mine.length === lines.length) { /* tek karakter */ }
      return `ACTING TASK — ${N} (${p} is fully invested in ${pp} tactic; the work happens in ${pp} eyes):
SCENE DIRECTION (shared, unspoken): ${AT.direction || '…'}
MOTIVE (${pp} fuel): ${c.motive || '…'}
GOAL: ${c.goal || '…'}
OBSTACLE: ${c.obstacle || '…'}
TACTIC: ${c.tactic || '…'}${c.channel ? ` — through ${c.channel}` : ''}${contrast}
Moment to moment:
${m2m.join('\n')}
(Safety: gaze always engaged in the task — never a frozen, glassy, unfocused stare; natural blink cadence, actors blink now and then to moisturize their eyes.)`;
    });
    const named = AT.chars.filter((c) => c.name.trim()).map((c) => up(c.name));
    const speakers = [...new Set(lines.map((l) => l.who).filter(Boolean))];
    speakers.filter((s) => !named.includes(s)).forEach((s) => warns.push(`${s} diyalogda var ama görev listesinde yok — olay herkesi içermeli.`));
    const motives = AT.chars.map((c) => c.motive.trim().toLowerCase()).filter(Boolean);
    if (motives.length > 1 && new Set(motives).size < motives.length) warns.push('İki karakterin motivi aynı — aynı yön, farklı yakıt olmalı.');
    if (AT.direction && AT.chars.some((c) => c.goal.trim() && c.goal.trim().toLowerCase() === AT.direction.trim().toLowerCase())) warns.push('Karakter hedefi sahne yönüyle aynı kelimeler — karakter hedefi kişisel olmalı.');
    const head = `EVENT: ${AT.event || '…'} · PHYSICAL ACTION (terrain): ${AT.terrain || '…'}\nENDING (read the scene backward from it): ${AT.ending || '…'}`;
    return { blocks, warns: [...new Set(warns)], head };
  }

  function renderActing(main, ctx) {
    const out = el('div', { class: 'dtool-out' });
    const form = el('div', { class: 'dtool-form' });
    main.append(el('div', { class: 'section' }, el('h3', { text: 'Oyunculuk Görevi — ACTING TASK' }),
      el('p', { class: 'hint', text: 'Görev, karakterin hedefe giden taktiğine yatırım yapmasıdır — dış davranış tarifi değil. Merdiven: tüm diyalog → sahnenin tek yönü → son olayı adlandırır → herkes tek olayda → fiziksel kanal → motiv → hedef → engel → taktik (göz işi eylem olarak).' })),
      el('div', { class: 'dtool' }, form, out));
    const reOut = () => { saveAT(); renderOut(); };
    const re = () => { saveAT(); renderForm(); renderOut(); };
    function renderForm() {
      const lines = parseDialogue();
      const chars = ctx.chars();
      form.replaceChildren(
        U.section('Sahne',
          el('div', { class: 'row' },
            U.select('at_pre', [['', 'Örnek yükle…'], ...Object.entries(AT_PRE).map(([k, v]) => [k, v.tr])], '', (v) => { if (!v) return; AT = JSON.parse(JSON.stringify(AT_PRE[v])); delete AT.tr; AT.breakAt = v === 'lab' ? 'MEDIC|4' : ''; re(); }),
            chars.length ? U.btn('Karakterlerimden doldur', () => { AT.chars = chars.slice(0, 4).map((c) => emp({ name: up(c.name), pron: c.gender === 'woman' ? 'she' : c.gender === 'man' ? 'he' : 'they' })); re(); }) : null),
          U.field('0 · Tüm diyalog (İSİM: replik, satır satır)', U.textarea('at_dlg', AT.dialogue, (v) => { AT.dialogue = v; saveAT(); }, 6, 'MOTHER: Three pairs of socks.\nSON: Mom, they give us socks.')),
          el('div', { class: 'row' }, U.btn('Diyaloğu işle', () => re())),
          U.field('1a · Son — olayın anahtarı', U.textarea('at_end', AT.ending, (v) => { AT.ending = v; reOut(); }, 2)),
          U.field('1 · Sahnenin yönü (ortak, söylenmeyen)', U.input('at_dir', AT.direction, (v) => { AT.direction = v; reOut(); })),
          el('div', { class: 'chips' },
            U.field('1b · Olay (herkesi içerir)', U.input('at_ev', AT.event, (v) => { AT.event = v; reOut(); })),
            U.field('1c · Fiziksel eylem (arazi)', U.input('at_ter', AT.terrain, (v) => { AT.terrain = v; reOut(); })),
            U.field('Temel eksen (kontrast çifti)', U.input('at_axis', AT.axis, (v) => { AT.axis = v; reOut(); }, 'care for the patient')))),
        ...AT.chars.map((c, ci) => charBox(c, ci, lines)),
        el('div', { class: 'row' }, U.btn('＋ Karakter', () => { AT.chars.push(emp({ name: String.fromCharCode(65 + AT.chars.length) })); re(); })));
    }
    function charBox(c, ci, lines) {
      const N = up(c.name);
      const f = (k, label, ph) => U.field(label, U.textarea(`at_c${ci}_${k}`, c[k], (v) => { c[k] = v; reOut(); }, 2, ph));
      const lineRows = lines.map((l) => {
        const key = `${N}|${l.i}`;
        const t = AT.lineTasks[key] || (l.who === N ? { v: VERBS[0], e: EYE[1] } : { v: '', e: '' });
        const setT = (k, v) => { AT.lineTasks[key] = Object.assign({}, t, { [k]: v }); reOut(); };
        return el('div', { class: 'dline' + (l.who === N ? ' mine' : '') },
          el('span', { class: 'dline-t', text: `${l.who ? l.who + ': ' : ''}${l.text}` }),
          l.who === N ? U.select(`at_v${ci}_${l.i}`, VERBS.map((v) => [v, v]), t.v, (v) => setT('v', v)) : null,
          U.select(`at_e${ci}_${l.i}`, [['', l.who === N ? EYE[1] : '— dinlerken görev yok —'], ...EYE.map((e) => [e, e])], t.e, (v) => setT('e', v)),
          l.who === N ? el('label', { class: 'dcheck' }, checkbox(AT.breakAt === key, (v) => { AT.breakAt = v ? key : ''; reOut(); }), ' kırılma') : null);
      });
      return U.section(`Karakter ${ci + 1}`,
        el('div', { class: 'chips' },
          U.field('İsim (diyalogdaki gibi)', U.input(`at_c${ci}_n`, c.name, (v) => { c.name = v; saveAT(); })),
          U.field('Zamir', U.select(`at_c${ci}_p`, [['he', 'he'], ['she', 'she'], ['they', 'they']], c.pron, (v) => { c.pron = v; reOut(); }))),
        f('channel', '1c · Fiziksel kanal (olayı neyle oynar)'),
        f('motive', '2 · Motiv (yakıtı)'),
        f('goal', '3 · Kişisel hedef'),
        f('obstacle', '4 · Engel (çizgiye bastıran)'),
        f('tactic', '5 · Taktik — partnere ne yapıyor (göz işi eylem)'),
        el('div', { class: 'chips' }, U.field('Artı (+)', U.input(`at_c${ci}_pl`, c.plus, (v) => { c.plus = v; reOut(); })), U.field('Eksi (−)', U.input(`at_c${ci}_mi`, c.minus, (v) => { c.minus = v; reOut(); }))),
        lines.length ? el('details', { open: '' }, el('summary', { text: 'An be an (replik replik)' }), el('div', { class: 'dlines' }, ...lineRows), el('div', { class: 'row' }, U.btn('Bu karakterin işini yenile', () => re()))) : f('listen', 'Sessiz dinleyicinin görevi', 'decide if he is serious'),
        el('div', { class: 'row' }, U.btn('Karakteri sil', () => { AT.chars.splice(ci, 1); re(); })));
    }
    function renderOut() {
      const r = actingBlocks();
      const all = [r.head, '', ...r.blocks].join('\n\n');
      out.replaceChildren(
        el('article', { class: 'pcard dlint ' + (r.warns.length ? 'bad' : 'ok') },
          el('header', null, el('strong', { text: 'Yaygın hatalar' }), el('span', { text: r.warns.length ? `${r.warns.length} uyarı` : 'temiz' })),
          el('ul', null, ...(r.warns.length ? r.warns.map((w) => el('li', { class: 'w', text: w })) : [el('li', { class: 'okl', text: 'Kimse duyguyu oynamıyor; herkes yönü oynuyor.' })]))),
        U.pcard('Olay', 'sondan okunur', r.head),
        ...r.blocks.map((b, i) => U.pcard(`ACTING TASK ${i + 1}`, 'Seedance / Higgsfield prompt bloğu', b)),
        r.blocks.length > 1 ? U.pcard('Tümü', 'prompta yapıştır', all) : null);
    }
    renderForm(); renderOut();
  }

  /* ======================================================================
     3) BLOCKING HARİTASI — konumlandırma referansı (yalnızca geometri)
     ====================================================================== */
  const COLS = [['BLUE', 'muted blue', '#5b7fa6'], ['ORANGE', 'muted orange', '#c98a4b'], ['YELLOW', 'muted yellow', '#b9a54a'], ['PURPLE', 'muted purple', '#8a6fa8'], ['RED', 'muted red', '#b3605d'], ['GREEN', 'muted green', '#6b9a6e']];
  const POSES = [['standing', 'Ayakta'], ['seated', 'Oturuyor'], ['kneeling', 'Diz çökmüş'], ['lying', 'Yatıyor'], ['leaning', 'Yaslanmış'], ['head tilted back', 'Baş geriye']];
  const FACING = [['facing camera', 'Kameraya dönük'], ['facing frame-left', 'Kadraj soluna'], ['facing frame-right', 'Kadraj sağına'], ['back to camera', 'Sırtı kameraya'], ['three-quarter to frame-left', '3/4 sola'], ['three-quarter to frame-right', '3/4 sağa']];
  const VIS = [['full body', 'Tam boy'], ['torso and arms only', 'Gövde ve kollar'], ['head and shoulders only', 'Baş ve omuzlar']];
  const fig = (o) => Object.assign({ x: 0.5, y: 0.8, s: 0.55, pose: 'standing', facing: 'facing camera', vis: 'full body', prop: '', propAt: '', tag: '', note: '', path: false, px: 0.8, py: 0.8, trigger: '' }, o);
  let BM = Object.assign({ project: 'PROJECT', locName: '', scene: 's01', ver: 'v1', ar: '16:9', furniture: '', extras: '', cam: '', figs: [fig({ x: 0.33 }), fig({ x: 0.66, facing: 'facing frame-left' })], labels: true, sel: 0 }, U.store.get('dirBlock', {}));
  const saveBM = () => U.store.set('dirBlock', BM);
  const AR = { '16:9': 16 / 9, '21:9': 21 / 9, '2.39:1': 2.39, '9:16': 9 / 16, '4:3': 4 / 3, '1:1': 1 };

  /* bir figürün kutusu (normalize, y = ayak hattı) */
  function figBox(f) {
    const h = f.s; const w = h * 0.36;
    let top = f.y - h, bottom = f.y;
    if (f.pose === 'seated') top = f.y - h * 0.72;
    if (f.pose === 'kneeling') top = f.y - h * 0.74;
    if (f.pose === 'lying') { return { x0: f.x - h * 0.5, x1: f.x + h * 0.5, y0: f.y - h * 0.18, y1: f.y }; }
    return { x0: f.x - w / 2, x1: f.x + w / 2, y0: top, y1: bottom };
  }
  function cropped(f) { const b = figBox(f); const e = []; if (b.x0 < 0) e.push('left'); if (b.x1 > 1) e.push('right'); if (b.y0 < 0) e.push('top'); if (b.y1 > 1) e.push('bottom'); return e; }

  function drawMap(cv, opts) {
    const g = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H);
    /* çok soluk ızgara — yazar için */
    g.strokeStyle = 'rgba(160,160,160,0.18)'; g.lineWidth = Math.max(1, W / 1920);
    const step = W / 32;
    for (let x = step; x < W; x += step) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
    for (let y = step; y < H; y += step) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    const lw = Math.max(2, W / 520);
    BM.figs.forEach((f, i) => {
      const col = COLS[i % COLS.length][2];
      g.strokeStyle = col; g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round';
      drawFigure(g, f, W, H);
      if (f.path) {
        g.save(); g.setLineDash([lw * 4, lw * 3]);
        g.beginPath(); g.moveTo(f.x * W, (f.y - f.s * 0.5) * H); g.lineTo(f.px * W, f.py * H); g.stroke();
        const a = Math.atan2(f.py * H - (f.y - f.s * 0.5) * H, f.px * W - f.x * W); const L = lw * 7;
        g.setLineDash([]); g.beginPath(); g.moveTo(f.px * W, f.py * H); g.lineTo(f.px * W - L * Math.cos(a - 0.45), f.py * H - L * Math.sin(a - 0.45));
        g.moveTo(f.px * W, f.py * H); g.lineTo(f.px * W - L * Math.cos(a + 0.45), f.py * H - L * Math.sin(a + 0.45)); g.stroke(); g.restore();
      }
      if (opts && opts.labels) {
        const b = figBox(f);
        g.fillStyle = col; g.font = `600 ${Math.round(W / 40)}px sans-serif`; g.textAlign = 'center';
        g.fillText(String.fromCharCode(65 + i), Math.min(Math.max(f.x, 0.03), 0.97) * W, Math.max(b.y0 * H - W / 80, W / 30));
        if (opts.sel === i) { g.save(); g.setLineDash([4, 4]); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1; g.strokeRect(b.x0 * W - 6, b.y0 * H - 6, (b.x1 - b.x0) * W + 12, (b.y1 - b.y0) * H + 12); g.restore(); }
      }
    });
    if (BM.cam) {
      /* kamera yolu oku */
      g.save(); g.strokeStyle = 'rgba(90,90,90,.75)'; g.lineWidth = lw; const y = H * 0.94; const dir = BM.cam === 'right' ? 1 : BM.cam === 'left' ? -1 : 0;
      if (dir) { const x0 = W * (dir > 0 ? 0.35 : 0.65), x1 = W * (dir > 0 ? 0.65 : 0.35); g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.lineTo(x1 - dir * lw * 6, y - lw * 4); g.moveTo(x1, y); g.lineTo(x1 - dir * lw * 6, y + lw * 4); g.stroke(); }
      else { const cx = W / 2; g.beginPath(); g.moveTo(cx, H * 0.97); g.lineTo(cx, H * 0.86); g.lineTo(cx - lw * 4, H * 0.86 + lw * 6); g.moveTo(cx, H * 0.86); g.lineTo(cx + lw * 4, H * 0.86 + lw * 6); g.stroke(); }
      g.restore();
    }
  }
  function drawFigure(g, f, W, H) {
    const px = (x) => x * W, py = (y) => y * H;
    const h = f.s * H; const cx = px(f.x), foot = py(f.y);
    const headR = h * 0.075;
    const back = f.facing === 'back to camera';
    const side = /left/.test(f.facing) ? -1 : /right/.test(f.facing) ? 1 : 0;
    const shoulderW = h * (side && !/three/.test(f.facing) ? 0.12 : 0.2);
    const vis = f.vis;
    let headY, shY, hipY, kneeY;
    if (f.pose === 'lying') {
      /* yatay gövde */
      const L = h * 0.85; const x0 = cx - L / 2;
      g.beginPath(); g.arc(x0 + headR, foot - headR * 1.1, headR, 0, Math.PI * 2); g.stroke();
      roundRect(g, x0 + headR * 2.3, foot - headR * 1.9, L * 0.45, headR * 1.6, headR * 0.6); g.stroke();
      g.beginPath(); g.moveTo(x0 + headR * 2.3 + L * 0.45, foot - headR * 1.4); g.lineTo(x0 + L, foot - headR * 1.2);
      g.moveTo(x0 + headR * 2.3 + L * 0.45, foot - headR * 0.6); g.lineTo(x0 + L, foot - headR * 0.4); g.stroke();
      propShape(g, f, x0 + L * 0.4, foot - headR * 2.2, headR);
      return;
    }
    const tilt = f.pose === 'head tilted back' ? -headR * 0.6 : 0;
    if (f.pose === 'seated') { headY = foot - h * 0.66; shY = headY + headR * 1.8; hipY = foot - h * 0.3; kneeY = foot - h * 0.3; }
    else if (f.pose === 'kneeling') { headY = foot - h * 0.68; shY = headY + headR * 1.8; hipY = foot - h * 0.3; kneeY = foot; }
    else { headY = foot - h + headR; shY = headY + headR * 1.8; hipY = foot - h * 0.48; kneeY = foot - h * 0.24; }
    const lean = f.pose === 'leaning' ? h * 0.06 * (side || 1) : 0;
    /* baş */
    g.beginPath(); g.ellipse(cx + lean + side * headR * 0.15, headY + tilt, headR, headR * 1.12, 0, 0, Math.PI * 2); g.stroke();
    if (side && !back) { g.beginPath(); g.moveTo(cx + lean + side * headR * 1.0, headY + tilt - headR * 0.1); g.lineTo(cx + lean + side * headR * 1.35, headY + tilt + headR * 0.2); g.lineTo(cx + lean + side * headR * 0.95, headY + tilt + headR * 0.35); g.stroke(); }
    if (back) { g.beginPath(); g.moveTo(cx + lean - headR * 0.6, headY + headR * 0.55); g.quadraticCurveTo(cx + lean, headY + headR * 0.9, cx + lean + headR * 0.6, headY + headR * 0.55); g.stroke(); }
    /* boyun + gövde */
    g.beginPath(); g.moveTo(cx + lean, headY + headR * 1.12 + tilt); g.lineTo(cx + lean, shY); g.stroke();
    const torsoBottom = vis === 'head and shoulders only' ? shY + headR * 1.6 : hipY;
    roundRect(g, cx + lean - shoulderW / 2, shY, shoulderW, torsoBottom - shY, shoulderW * 0.25); g.stroke();
    if (vis === 'head and shoulders only') { propShape(g, f, cx + lean, shY + headR, headR); return; }
    /* kollar */
    const armL = (hipY - shY) * 1.0;
    g.beginPath();
    g.moveTo(cx + lean - shoulderW / 2, shY + headR * 0.3); g.lineTo(cx + lean - shoulderW / 2 - headR * 0.5, shY + armL);
    g.moveTo(cx + lean + shoulderW / 2, shY + headR * 0.3); g.lineTo(cx + lean + shoulderW / 2 + headR * 0.5, shY + armL);
    g.stroke();
    if (vis === 'torso and arms only') { propShape(g, f, cx + lean, (shY + hipY) / 2, headR); return; }
    /* bacaklar */
    const hw = shoulderW * 0.28;
    g.beginPath();
    if (f.pose === 'seated') {
      const kx = (side || 1) * h * 0.16;
      g.moveTo(cx - hw, hipY); g.lineTo(cx - hw + kx, kneeY); g.lineTo(cx - hw + kx, foot);
      g.moveTo(cx + hw, hipY); g.lineTo(cx + hw + kx, kneeY); g.lineTo(cx + hw + kx, foot);
    } else if (f.pose === 'kneeling') {
      g.moveTo(cx - hw, hipY); g.lineTo(cx - hw, foot); g.lineTo(cx - hw - (side || 1) * h * 0.12, foot);
      g.moveTo(cx + hw, hipY); g.lineTo(cx + hw + (side || 1) * h * 0.08, foot - h * 0.15); g.lineTo(cx + hw + (side || 1) * h * 0.08, foot);
    } else {
      g.moveTo(cx - hw, hipY); g.lineTo(cx - hw * 1.3, foot);
      g.moveTo(cx + hw, hipY); g.lineTo(cx + hw * 1.3, foot);
    }
    g.stroke();
    propShape(g, f, cx + lean, (shY + hipY) / 2, headR);
  }
  function propShape(g, f, x, y, r) {
    if (!f.prop.trim()) return;
    const at = f.propAt;
    let px = x + r * 2.6, py = y;
    if (/throat|chin|neck/i.test(at)) { px = x; py = y - r * 1.6; }
    else if (/chest/i.test(at)) { px = x; py = y - r * 0.6; }
    else if (/left/i.test(at)) { px = x - r * 2.6; }
    else if (/head|above/i.test(at)) { px = x; py = y - r * 4; }
    else if (/ground|floor|feet/i.test(at)) { py = y + r * 7; }
    roundRect(g, px - r * 0.9, py - r * 0.45, r * 1.8, r * 0.9, r * 0.2); g.stroke();
  }
  function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

  function where(f) {
    const hx = f.x < 0.36 ? 'frame-left' : f.x > 0.64 ? 'frame-right' : 'centre';
    const dep = f.s > 0.7 ? 'foreground' : f.s < 0.38 ? 'background' : 'midground';
    return `${hx} ${dep}`;
  }
  function tags() {
    const P = (BM.project || 'PROJECT').toUpperCase().replace(/[^A-Z0-9]/g, '') || 'PROJECT';
    const name = BM.locName || 'location';
    return { staging: `@staging_${P}_${BM.scene || 's01'}_${BM.ver || 'v1'}`, loc: `@loc_${P}_${name}_${BM.scene || 's01'}_${BM.ver || 'v1'}`, P };
  }
  function blockingTexts(ctx) {
    const T = tags();
    const n = BM.figs.length;
    const figLines = BM.figs.map((f, i) => {
      const c = COLS[i % COLS.length];
      const cr = cropped(f);
      const crop = cr.length ? `, CROPPED by the ${cr.join(' and ')} frame edge${cr.length > 1 ? 's' : ''} — draw it cut exactly there, do NOT complete the body` : '';
      const prop = f.prop.trim() ? `; holds ${f.prop.trim()} as a simple outlined shape${f.propAt ? `, ${f.propAt}` : ''}` : '';
      return `${cap(where(f))} — a ${c[1].toUpperCase()} outline figure, ${f.vis} visible${crop}, ${f.pose}${f.pose === 'head tilted back' ? ', face angled up' : ''}, ${f.facing}${prop}.`;
    });
    const paths = BM.figs.map((f, i) => (f.path ? `A dashed ${COLS[i % COLS.length][1]} line from the ${COLS[i % COLS.length][1]} figure to the ${f.px < 0.36 ? 'left' : f.px > 0.64 ? 'right' : 'centre'} of the frame, ending in a small arrowhead.` : null)).filter(Boolean);
    const ar = BM.ar === '2.39:1' ? '239:100' : BM.ar;
    const diag = `@[Image 1](image_1) — use the attached image ONLY as the compositional guide: copy its exact framing, camera angle, crop, and the positions, poses and scale of every person — but do NOT copy its photographic look: no photo textures, no realistic lighting, no realistic faces, no colors from the image. Do NOT add anything that is not in the attached image. Do NOT complete cropped bodies — if a body part is cut off by the frame edge in the image, cut it off in the drawing. The OUTPUT is a flat schematic:
Flat minimalist technical LINE DRAWING, a staging plan for a film scene — an obviously schematic, non-photographic drawing on a white background with a very faint, thin, light-grey graph-paper grid. Figures are drawn as clean THIN OUTLINES in muted colors — NO fills, NO solid color blocks, NO shading, NO texture, NO realism, NO text, NO letters, NO labels anywhere.
Front view matching the attached image's framing exactly: ${n} outline figure${n === 1 ? '' : 's'}.
${figLines.join('\n')}
${BM.furniture.trim() ? `${cap(BM.furniture.trim())}, as simple thin-outline shapes.` : 'No furniture, open background.'}
${BM.extras.trim() ? `${cap(BM.extras.trim())}, as tiny faint grey silhouettes.\n` : ''}${paths.length ? paths.join('\n') + '\n' : ''}Nothing else — no ground line, no extra props, no extra figures. Simple, readable, diagrammatic — flat 2D line drawing, minimal detail, only who is where. --ar ${ar} --style raw --stylize 30 --v 8.1 --no photorealism, photo texture, realistic lighting, realistic faces, shading, solid color fills, color blocks, text, letters, labels, typography`;
    const key = BM.figs.map((f, i) => `${COLS[i % COLS.length][0]} = ${f.note.trim() || f.tag.trim() || 'figure ' + String.fromCharCode(65 + i)}, ${where(f)}`).join(' · ');
    const legend = BM.figs.map((f, i) => {
      const L = String.fromCharCode(65 + i);
      const pos = `${where(f)}, ${f.pose}, ${f.facing}${f.prop.trim() ? `, ${f.prop.trim()}${f.propAt ? ' ' + f.propAt : ''}` : ''}`;
      return `@${L} = the ${COLS[i % COLS.length][0]} figure on the staging reference = ${f.tag.trim() || `[your character reference for ${L}]`} → ${pos}.`;
    });
    const pathLegend = BM.figs.map((f, i) => (f.path ? `Dashed ${COLS[i % COLS.length][0]} line = @${String.fromCharCode(65 + i)}'s cross: START at ${where(f)}, PATH straight, END at the ${f.px < 0.36 ? 'frame-left' : f.px > 0.64 ? 'frame-right' : 'centre'} mark, TRIGGER ${f.trigger.trim() || '[the beat that starts the move]'}.` : null)).filter(Boolean);
    const camLegend = BM.cam ? [`The arrow at the bottom = camera path only: ${BM.cam === 'push' ? 'a push-in toward the figures' : `a lateral move toward frame-${BM.cam}`}.`] : [];
    const conn = `${T.staging} — POSITION REFERENCE ONLY
Use this reference solely to read where each figure is placed, its pose, and its facing direction inside ${T.loc}. Every visual quality of the shot — style, light, color grade, faces, wardrobe, environment, props — comes exclusively from ${T.loc} and the character references. The shot is a fully photoreal live-action frame.

LETTER LEGEND (letters exist only in this prompt; they do not appear on the reference)
${legend.join('\n')}${pathLegend.length || camLegend.length ? '\n' + [...pathLegend, ...camLegend].join('\n') : ''}

RENDER RULE: place the real, photoreal characters (from their own references) into the real location ${T.loc} at the positions this reference defines, and take nothing else from it.

LOCKS: All style, light, and texture come exclusively from ${T.loc} and the character references; ${T.staging} defines positions only. The colors on the staging reference identify WHO IS WHO on that reference only — wardrobe and grading come from the character and location references. Everyone stays in their staging-locked position until their scripted action.`;
    const qa = `DİYAGRAM (etiketi vermeden önce)
☐ 1. Yalnızca ince çizgiler — dolgu, renk bloğu, gölge yok
☐ 2. Haritada hiçbir yazı, harf, etiket yok
☐ 3. Kırpılan gövdeler kırpılı kaldı (eklenen baş, kask, mobilya, figür yok)
☐ 4. Prop'lar karedeki anatomik yükseklikte (boğaz ≠ göğüs)
☐ 5. Pozlar birebir: baş açısı, bakış yönü, alışılmadık duruşlar
☐ 6. Kadraj / kırpma kaynak karenin kompozisyonu ve oranıyla aynı

VİDEO (bağlayıcıyı kullandıktan sonra)
☐ 1. Tamamen fotogerçekçi — hiçbir yerde grafik görünüm yok
☐ 2. Beyaz/ızgara arka plan ya da çizgi kenarı kalıntısı yok
☐ 3. Harita renkleri kostüme, zırha ya da grade'e geçmedi
☐ 4. Kadrajda harf ya da tipografi yok
☐ 5. Herkes senaryodaki eylemine kadar haritadaki yerinde ve yönünde
☐ 6. Bir madde tutmadıysa: onu besleyen katmanda düzelt (görsel → daha soluk çizgi; metin → grafik kelimeleri çıkar; yapı → haritayı EN SONA ekle) ve sürüm etiketini artır (${BM.ver} → v${(parseInt((BM.ver || 'v1').slice(1), 10) || 1) + 1})`;
    return { diag, key, conn, qa, T };
  }

  function renderBlocking(main, ctx) {
    if (!BM.locName) { const s = (ctx.cur() || {}).spec; BM.locName = s ? slug(s.cat.en.split(/[,(]/)[0]).slice(0, 28) : 'location'; }
    const out = el('div', { class: 'dtool-out' });
    const form = el('div', { class: 'dtool-form' });
    main.append(el('div', { class: 'section' }, el('h3', { text: 'Blocking Haritası — staging reference' }),
      el('p', { class: 'hint', text: 'Harita yalnızca geometri taşır: beyaz zemin, çok soluk ızgara, ince soluk renkli dış çizgiler; dolgu, harf ve etiket yok. Harfler (A, B…) yalnızca prompt metninde renge bağlanır. Video promptunda harita EN SON eklenir.' })),
      el('div', { class: 'dtool' }, form, out));
    const cv = el('canvas', { class: 'bmap', width: '960', height: '540' });
    let drag = -1, dragPath = false;
    function size() { const r = AR[BM.ar] || 16 / 9; cv.width = r >= 1 ? 960 : Math.round(540 * r); cv.height = r >= 1 ? Math.round(960 / r) : 540; }
    function paint() { drawMap(cv, { labels: BM.labels, sel: BM.sel }); }
    const pt = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; };
    cv.addEventListener('pointerdown', (e) => {
      const [x, y] = pt(e);
      drag = -1; dragPath = false;
      BM.figs.forEach((f, i) => { if (f.path && Math.hypot(f.px - x, (f.py - y) / (AR[BM.ar] || 1.78)) < 0.03) { drag = i; dragPath = true; } });
      if (drag < 0) {
        let best = 1e9;
        BM.figs.forEach((f, i) => { const b = figBox(f); const inside = x > b.x0 - 0.02 && x < b.x1 + 0.02 && y > b.y0 - 0.02 && y < b.y1 + 0.02; const d = Math.abs(x - f.x) + Math.abs(y - (b.y0 + b.y1) / 2); if (inside && d < best) { best = d; drag = i; } });
      }
      if (drag >= 0) { BM.sel = drag; cv.setPointerCapture(e.pointerId); e.preventDefault(); paint(); }
    });
    cv.addEventListener('pointermove', (e) => {
      if (drag < 0) return;
      const [x, y] = pt(e); const f = BM.figs[drag];
      if (dragPath) { f.px = Math.min(1, Math.max(0, x)); f.py = Math.min(1, Math.max(0, y)); }
      else { const b = figBox(f); const cyOff = f.y - (b.y0 + b.y1) / 2; f.x = Math.min(1.1, Math.max(-0.1, x)); f.y = Math.min(1.25, Math.max(0.05, y + cyOff)); }
      paint();
    });
    const end = () => { if (drag >= 0) { drag = -1; saveBM(); renderForm(); renderOut(); } };
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
    const reOut = () => { saveBM(); paint(); renderOut(); };
    const re = () => { saveBM(); size(); paint(); renderForm(); renderOut(); };
    function renderForm() {
      const chars = ctx.chars();
      form.replaceChildren(
        U.section('Harita',
          el('div', { class: 'bmap-wrap' }, cv),
          el('p', { class: 'hint', text: 'Figürü sürükle: konum. Kesikli yolun ucunu sürükle: hareket yönü. Harf etiketleri yalnızca düzenleyicide görünür; indirilen PNG\'de yok.' }),
          el('div', { class: 'chips' },
            U.field('Oran', U.select('bm_ar', Object.keys(AR).map((k) => [k, k]), BM.ar, (v) => { BM.ar = v; re(); })),
            U.field('Kamera yolu oku', U.select('bm_cam', [['', 'yok'], ['left', 'sola kayış'], ['right', 'sağa kayış'], ['push', 'ileri itme']], BM.cam, (v) => { BM.cam = v; reOut(); }))),
          el('label', { class: 'dcheck' }, checkbox(BM.labels, (v) => { BM.labels = v; reOut(); }), ' Düzenleyicide harf etiketlerini göster'),
          el('div', { class: 'row' },
            U.btn('⤓ Haritayı indir (PNG)', () => download(), 'primary'),
            BM.figs.length < 6 ? U.btn('＋ Figür', () => { BM.figs.push(fig({ x: 0.2 + 0.12 * BM.figs.length, s: 0.45 })); BM.sel = BM.figs.length - 1; re(); }) : null)),
        U.section('Etiketler',
          el('div', { class: 'chips' },
            U.field('Proje (BÜYÜK HARF)', U.input('bm_p', BM.project, (v) => { BM.project = v.toUpperCase(); reOut(); })),
            U.field('Mekân adı', U.input('bm_l', BM.locName, (v) => { BM.locName = v.replace(/\s+/g, ''); reOut(); })),
            U.field('Sahne', U.input('bm_s', BM.scene, (v) => { BM.scene = v; reOut(); })),
            U.field('Sürüm', U.input('bm_v', BM.ver, (v) => { BM.ver = v; reOut(); })))),
        U.section('Sahne öğeleri',
          U.field('Mobilya / mimari (sabitleyici)', U.input('bm_fu', BM.furniture, (v) => { BM.furniture = v; reOut(); }, 'a long table across the lower third')),
          U.field('Arka plan figüranları', U.input('bm_ex', BM.extras, (v) => { BM.extras = v; reOut(); }, 'three tiny figures at the far right'))),
        ...BM.figs.map((f, i) => {
          const c = COLS[i % COLS.length];
          const cr = cropped(f);
          return el('div', { class: 'dbeat' + (BM.sel === i ? ' cur' : '') },
            el('div', { class: 'dbeat-h' }, el('i', { class: 'dsw', style: `border-color:${c[2]}` }), el('b', { text: `@${String.fromCharCode(65 + i)} · ${c[0]}` }), cr.length ? el('span', { class: 'hint', text: `kırpık: ${cr.join(', ')}` }) : null,
              U.btn('Seç', () => { BM.sel = i; reOut(); renderForm(); }), BM.figs.length > 1 ? U.btn('Sil', () => { BM.figs.splice(i, 1); BM.sel = 0; re(); }) : null),
            el('div', { class: 'chips' },
              U.field('Karakter etiketi', chars.length ? U.select(`bm_t${i}`, [['', '— elle yaz —'], ...chars.map((ch) => [`@char_${slug(ch.name)}`, ch.name])], f.tag, (v) => { f.tag = v; reOut(); renderForm(); }) : U.input(`bm_t${i}`, f.tag, (v) => { f.tag = v; reOut(); }, '@char_name')),
              U.field('Kaynak karedeki tarif', U.input(`bm_n${i}`, f.note, (v) => { f.note = v; reOut(); }, 'the captive soldier')),
              U.field('Poz', U.select(`bm_po${i}`, POSES, f.pose, (v) => { f.pose = v; reOut(); })),
              U.field('Yön', U.select(`bm_fa${i}`, FACING, f.facing, (v) => { f.facing = v; reOut(); })),
              U.field('Görünen', U.select(`bm_vi${i}`, VIS, f.vis, (v) => { f.vis = v; reOut(); })),
              U.field('Ölçek (derinlik)', range(`bm_sc${i}`, f.s, 0.2, 1.2, (v) => { f.s = v; reOut(); })),
              U.field('Prop', U.input(`bm_pr${i}`, f.prop, (v) => { f.prop = v; reOut(); }, 'a short blade')),
              U.field('Prop nerede (anatomiye göre)', U.input(`bm_pa${i}`, f.propAt, (v) => { f.propAt = v; reOut(); }, 'across the throat, under the chin — not the chest'))),
            el('label', { class: 'dcheck' }, checkbox(f.path, (v) => { f.path = v; reOut(); renderForm(); }), ' Hareket yolu (kesikli çizgi)'),
            f.path ? U.field('Tetikleyici beat', U.input(`bm_tr${i}`, f.trigger, (v) => { f.trigger = v; reOut(); }, 'on the line "Let\'s go"')) : null);
        }));
    }
    function range(id, v, a, b, on) { const r = el('input', { id, type: 'range', min: String(a), max: String(b), step: '0.01' }); r.value = String(v); r.addEventListener('input', () => on(+r.value)); return r; }
    function download() {
      const r = AR[BM.ar] || 16 / 9; const big = el('canvas'); big.width = r >= 1 ? 1920 : Math.round(1920 * r); big.height = r >= 1 ? Math.round(1920 / r) : 1920;
      drawMap(big, { labels: false });
      const T = tags();
      big.toBlob((blob) => { if (!blob) return U.toast('PNG oluşturulamadı'); const name = `${T.staging.slice(1)}.png`; if (CB.app && CB.app.saveFile) CB.app.saveFile(blob, name); else { const a = el('a', { href: URL.createObjectURL(blob), download: name }); document.body.append(a); a.click(); a.remove(); } }, 'image/png');
    }
    function renderOut() {
      const t = blockingTexts(ctx);
      out.replaceChildren(
        el('p', { class: 'note', text: `Bu PNG doğrudan ${t.T.staging} olarak kullanılabilir. Kendi karenden ürettireceksen önce 1. adım promptunu kullan; sonuç gelince bu etiketi ver.` }),
        U.pcard('Etiketler', 'üretilen haritaya / kaynak kareye', `${t.T.staging}   ← harita\n${t.T.loc}   ← kaynak kare (mekân)\nRenk anahtarı: ${t.key}`),
        U.pcard('1. adım · Diyagram promptu', 'kaynak kare image_1 olarak eklenir', t.diag, 'Grafik kelimeleri YALNIZCA bu promptta geçer; video bağlamına hiç girmez.'),
        U.pcard('2. adım · Bağlayıcı blok', 'video promptunun referanslarına tek yapıştırma', t.conn, 'Ekleme sırası: önce mekân ve karakter referansları, staging referansı EN SON.'),
        U.pcard('QA kontrol listesi', 'her testte', t.qa));
    }
    size(); renderForm(); paint(); renderOut();
  }

  CB.DIR.register({ id: 'gotrv', tr: 'Sahne Motoru', sub: 'Goal · Obstacle · Tactic · Reversal · Value', group: 'Aksiyon & Sahne', render: renderScene });
  CB.DIR.register({ id: 'acting', tr: 'Oyunculuk Görevi', sub: 'ACTING TASK blokları', group: 'Aksiyon & Sahne', render: renderActing });
  CB.DIR.register({ id: 'blocking', tr: 'Blocking Haritası', sub: '@staging_ · @loc_ · bağlayıcı', group: 'Aksiyon & Sahne', render: renderBlocking });
  CB.TIG = { drawMap, blockingTexts: () => blockingTexts(CB.DIR.ctx), audit, actingBlocks };
})();
