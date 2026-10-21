/* CineBG Studio — Yönetmen Masası iskeleti (v5).
   Araçlar ayrı dosyalarda CB.DIR.register({ id, tr, sub, group, render(main, ctx) }) ile eklenir.
   ctx: { cur() → arka plan sekmesindeki sahne (cat, seed, spec, prompts…), chars() → karakter listesi,
          project() → proje çekimleri, aspect() → seçili oran, ui → ortak arayüz yardımcıları } */
(function () {
  const CB = window.CB;
  const $ = (id) => document.getElementById(id);
  const el = (tag, attrs, ...kids) => {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (attrs[k] == null) continue;
      if (k === 'class') n.className = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else if (k === 'value') n.value = attrs[k];
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    }
    kids.flat().forEach((c) => c != null && c !== false && n.append(c));
    return n;
  };
  const store = {
    get(k, d) { try { const v = localStorage.getItem('cinebg.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('cinebg.' + k, JSON.stringify(v)); } catch (e) { /* depolama yok */ } },
  };
  const toast = (m) => (CB.app ? CB.app.toast(m) : console.log(m));
  function copy(text, label) {
    const ok = () => toast(label + ' kopyalandı');
    try { navigator.clipboard.writeText(text).then(ok, () => fb()); } catch (e) { fb(); }
    function fb() { const ta = el('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.append(ta); ta.select(); let k = false; try { k = document.execCommand('copy'); } catch (e) { k = false; } ta.remove(); toast(k ? label + ' kopyalandı' : 'Kopyalanamadı. Metni seçip elle kopyala.'); }
  }
  const words = (t) => (t.trim() ? t.trim().split(/\s+/).length : 0);
  function pcard(title, sub, text, foot) {
    return el('article', { class: 'pcard' },
      el('header', null, el('strong', { text: title }), el('span', { text: sub || '' }), el('span', { class: 'count', text: `${words(text)} kelime` }),
        el('button', { class: 'btn small', type: 'button', text: 'Kopyala', onclick: () => copy(text, title) })),
      el('pre', { text }), foot ? el('footer', { text: foot }) : null);
  }
  /* items: [[değer, etiket], …] */
  function select(id, items, cur, onchange) {
    const s = el('select', { id });
    items.forEach(([v, t]) => s.append(el('option', { value: v, text: t })));
    s.value = cur == null ? (items[0] ? items[0][0] : '') : cur;
    s.addEventListener('change', () => onchange && onchange(s.value));
    return s;
  }
  function input(id, value, onchange, ph) {
    const i = el('input', { id, type: 'text', value: value || '', placeholder: ph || '' });
    i.addEventListener('input', () => onchange && onchange(i.value));
    return i;
  }
  function textarea(id, value, onchange, rows, ph) {
    const t = el('textarea', { id, class: 'notes', rows: String(rows || 4), placeholder: ph || '' });
    t.value = value || '';
    t.addEventListener('input', () => onchange && onchange(t.value));
    return t;
  }
  const field = (label, ctl) => el('div', { class: 'field' }, el('label', { for: ctl.id || null, text: label }), ctl);
  const btn = (text, onclick, cls) => el('button', { class: 'btn small' + (cls ? ' ' + cls : ''), type: 'button', text, onclick });
  const section = (title, ...kids) => el('div', { class: 'section' }, el('h3', { text: title }), ...kids);
  async function saveText(text, name, type) {
    const blob = new Blob([text], { type: type || 'text/plain;charset=utf-8' });
    if (CB.app && CB.app.saveFile) return CB.app.saveFile(blob, name);
    const a = el('a', { href: URL.createObjectURL(blob), download: name }); document.body.append(a); a.click(); a.remove();
  }
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const ui = { el, $, store, copy, pcard, select, input, textarea, field, btn, section, saveText, toast, words, pick };
  CB.UI = ui;

  const TOOLS = [];
  const ST = { tool: store.get('dirTool', '') };
  const ctx = {
    cur: () => (CB.app ? CB.app.current() : {}),
    chars: () => store.get('chars', []),
    project: () => store.get('project', { name: '', shots: [] }),
    aspect: () => (CB.app ? CB.app.aspect() : { id: '16:9', r: 16 / 9 }),
    ui,
  };

  function render() {
    const list = $('dirList'), main = $('dirMain');
    if (!list || !main) return;
    if (!TOOLS.length) { main.replaceChildren(el('p', { class: 'hint', text: 'Araç yüklenmedi.' })); return; }
    if (!TOOLS.find((t) => t.id === ST.tool)) ST.tool = TOOLS[0].id;
    const groups = [...new Set(TOOLS.map((t) => t.group || 'Araçlar'))];
    list.replaceChildren(
      el('div', { class: 'section' }, el('h3', { text: 'Yönetmen Masası' }),
        el('p', { class: 'hint', text: 'Kurgu, aksiyon, oyunculuk, faceless video ve çekim listesi araçları. Hepsi arka plan sekmesindeki güncel sahneyi ve karakterlerini kullanır.' })),
      ...groups.map((g) => el('div', { class: 'section' }, el('h3', { text: g }),
        el('div', { class: 'chlist' }, ...TOOLS.filter((t) => (t.group || 'Araçlar') === g).map((t) => el('button', {
          type: 'button', class: 'chitem' + (t.id === ST.tool ? ' cur' : ''),
          onclick: () => { ST.tool = t.id; store.set('dirTool', t.id); render(); },
        }, el('i', { style: 'background:var(--accent)' }), el('b', { text: t.tr }), el('span', { text: t.sub || '' })))))));
    const tool = TOOLS.find((t) => t.id === ST.tool);
    main.replaceChildren();
    try { tool.render(main, ctx); } catch (e) { console.error(e); main.append(el('p', { class: 'hint', text: 'Araç açılamadı: ' + e.message })); }
  }

  CB.DIR = {
    tools: TOOLS,
    register(t) { if (!TOOLS.find((x) => x.id === t.id)) TOOLS.push(t); },
    render,
    ctx,
  };
})();
