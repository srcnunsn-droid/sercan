// Write storyboard/epXX.md from the episode data (shot id, start-end, size, camera, dialogue).
// Usage: node tools/storyboard.cjs 01
const vm = require("vm"), fs = require("fs"), path = require("path");
const EP = process.argv[2] || "01", R = path.join(__dirname, "..");
const ctx = { window: {}, console }; ctx.window.window = ctx.window; vm.createContext(ctx);
vm.runInContext("window.GS={};", ctx);
const m = fs.readFileSync(R + "/sets/morgue.js", "utf8").match(/const M = \(GS\.MORGUE = (\{[\s\S]*?\n  \})\);/);
ctx.window.GS.MORGUE = vm.runInContext("(" + m[1] + ")", ctx);
for (const f of [`data/ep-${EP}-voice.js`, `data/ep-${EP}.js`]) vm.runInContext(fs.readFileSync(R + "/" + f, "utf8"), ctx);
const E = ctx.window.GS_EP, V = ctx.window.GS_VOICE;
const size = (s) => s.scene && s.scene !== "world" ? "INSERT/ECU (" + s.scene + ")" : s.cam.w <= 460 ? "ECU" : s.cam.w <= 600 ? "CU" : s.cam.w <= 1200 ? "MS" : s.cam.w <= 1600 ? "MS/two-shot" : "WS";
let out = `# Storyboard — Bölüm ${EP} (generated from data/ep-${EP}.js)\n\nVertical 1080x1920 and horizontal 1920x1080 use the same shots; the camera frames each aspect from the same target.\n\n| Shot | Start–End (s) | Size | Camera | Dialogue (line: start–end) |\n|---|---|---|---|---|\n`;
for (const s of E.shots) {
  const ls = E.lines.filter((l) => l.start < s.t1 && l.start + V[l.n].dur > s.t0).map((l) => `${l.n} ${l.speaker.toLocaleUpperCase("tr-TR")}: "${l.text || l.cards.join(" ")}" (${l.start.toFixed(2)}–${(l.start + V[l.n].dur).toFixed(2)})`);
  const cam = s.cam.on ? `on ${s.cam.on}` : `at ${s.cam.at.map((v) => Math.round(v)).join(",")}`;
  const mv = s.cam.pan ? "pan" : (s.cam.push || 0) < 0 ? `pull-out ${Math.round(-s.cam.push * 100)}%` : `push-in ${Math.round((s.cam.push === undefined ? 0.06 : s.cam.push) * 100)}%`;
  out += `| ${s.id} | ${s.t0.toFixed(2)}–${s.t1.toFixed(2)} | ${size(s)} | ${cam}, ${mv}${s.shake ? ", impact shake" : ""} | ${ls.join("<br>")} |\n`;
}
fs.writeFileSync(R + `/storyboard/ep${EP}.md`, out);
console.log("wrote storyboard/ep" + EP + ".md,", E.shots.length, "shots");
