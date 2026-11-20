// Geliştirici testi için sunucu (Windows'taki araclar/sunucu.ps1 ile aynı davranır).
// Kullanım: node araclar/test/gelistirici-sunucu.js [port]
const http = require("http"), fs = require("fs"), path = require("path");
const kok = path.resolve(__dirname, "..", "..");
const port = Number(process.argv[2] || 8787);
const mime = { ".html": "text/html; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".mp4": "video/mp4", ".webm": "video/webm", ".mp3": "audio/mpeg", ".ogg": "audio/ogg", ".wav": "audio/wav" };
http.createServer((q, r) => {
  const yol = decodeURIComponent(new URL(q.url, "http://x").pathname);
  r.setHeader("Cache-Control", "no-store");
  if (yol === "/api/durum") return r.end('{"ok":true}');
  if (yol === "/api/resim") { // geliştirme sunucusu: sadece önbellekte varsa verir, yoksa 404 (oyun emojiye düşer)
    const url = new URL(q.url, "http://x").searchParams.get("url") || "";
    const ad = require("crypto").createHash("sha1").update(url).digest("hex");
    const yer = path.join(kok, "assets", "hediye");
    const bul = fs.existsSync(yer) ? fs.readdirSync(yer).find((d) => d.startsWith(ad)) : null;
    if (!bul) { r.statusCode = 404; return r.end("yok"); }
    r.setHeader("Content-Type", "image/" + path.extname(bul).slice(1).replace("jpg", "jpeg"));
    return fs.createReadStream(path.join(yer, bul)).pipe(r);
  }
  if (yol === "/api/muzik") {
    const k = new URL(q.url, "http://x").searchParams.get("klasor") === "oyun" ? "oyun" : "liste";
    const yer = path.join(kok, "assets", "muzik", k);
    const adlar = fs.existsSync(yer) ? fs.readdirSync(yer).filter((d) => /\.(mp3|ogg|wav|m4a|aac|opus|webm)$/i.test(d)).sort() : [];
    r.setHeader("Content-Type", "application/json; charset=utf-8");
    return r.end(JSON.stringify(adlar));
  }
  if (yol === "/api/kaydet" && q.method === "POST") {
    let g = ""; q.on("data", (c) => (g += c)); q.on("end", () => {
      try { JSON.parse(g); fs.mkdirSync(path.join(kok, "veri"), { recursive: true }); fs.writeFileSync(path.join(kok, "veri", "kayit.json"), g); r.end('{"ok":true}'); }
      catch (e) { r.statusCode = 400; r.end("{}"); }
    }); return;
  }
  const tam = path.resolve(kok, "." + (yol === "/" ? "/index.html" : yol));
  if (!tam.startsWith(kok) || !fs.existsSync(tam) || !fs.statSync(tam).isFile()) { r.statusCode = 404; return r.end("Yok"); }
  const boyut = fs.statSync(tam).size;
  r.setHeader("Content-Type", mime[path.extname(tam).toLowerCase()] || "application/octet-stream");
  r.setHeader("Accept-Ranges", "bytes");
  let bas = 0, son = boyut - 1;
  const m = /bytes=(\d*)-(\d*)/.exec(q.headers.range || "");
  if (m) { if (m[1]) { bas = +m[1]; if (m[2]) son = Math.min(+m[2], boyut - 1); } else if (m[2]) bas = Math.max(0, boyut - +m[2]);
    r.statusCode = 206; r.setHeader("Content-Range", `bytes ${bas}-${son}/${boyut}`); }
  r.setHeader("Content-Length", son - bas + 1);
  if (q.method === "HEAD") return r.end();
  fs.createReadStream(tam, { start: bas, end: son }).pipe(r);
}).listen(port, () => console.log("http://localhost:" + port));
