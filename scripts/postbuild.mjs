// Turns dist/index.html (a full single-file document) into the Artifact page body:
// claude.ai wraps the page in its own <!doctype><html><head><body> skeleton, so we emit
// title, metas, font link, inline <style> and inline module <script> without those tags.
import { readFileSync, writeFileSync, statSync } from 'node:fs';

const html = readFileSync('dist/index.html', 'utf8');
const pick = (re) => [...html.matchAll(re)].map((m) => m[0]);
const title = pick(/<title>[\s\S]*?<\/title>/g)[0] ?? '<title>SECO Film Atölyesi</title>';
const metas = pick(/<meta name="claude:[^>]*>/g);
const links = pick(/<link rel="(?:preconnect|stylesheet)"[^>]*>/g);
const styles = pick(/<style[^>]*>[\s\S]*?<\/style>/g);
const scripts = pick(/<script type="module"[^>]*>[\s\S]*?<\/script>/g);
if (!scripts.length) throw new Error('No inline module script found; did vite-plugin-singlefile run?');
const body = scripts.join('\n').replace(/<\/script>$/, '');
if (body.slice(0, -1).includes('</script')) throw new Error('Inline script contains </script>; refusing to emit a broken page.');

const out = [title, ...metas, ...links, ...styles, '<div id="root"></div>', ...scripts].join('\n');
writeFileSync('dist/seco-film-atolyesi.html', out);
const kb = (f) => (statSync(f).size / 1024).toFixed(0);
console.log(`dist/index.html ${kb('dist/index.html')} KB (open locally)`);
console.log(`dist/seco-film-atolyesi.html ${kb('dist/seco-film-atolyesi.html')} KB (Artifact page, limit 16384 KB)`);

// performance budget: the Artifact limit is 16 MB; we keep the page under 3 MB so phones load it fast
const BUDGET_KB = 3072;
if (statSync('dist/seco-film-atolyesi.html').size / 1024 > BUDGET_KB) { console.error(`Over the ${BUDGET_KB} KB budget`); process.exit(1); }
