# Hedef platform: claude.ai Artifact (doğrulanmış notlar)

Kaynak: bu oturumda okunan güncel Artifact sözleşmesi ve runtime tip tanımları (contract 0.2.96). Tahmin yok; her madde belgede yazıyor.

1. **Sayfa iskeleti platformdan gelir.** Yayınlanan dosyaya `<!doctype>`, `<html>`, `<head>`, `<body>` yazılmaz; `<title>` ilk 8 KB içinde olmalı. Bu yüzden `scripts/postbuild.mjs` Vite çıktısından yalnızca title, meta, font bağlantısı, satır içi stil ve modül betiğini alır.
2. **Boyut sınırı 16 MB**, gömülü `data:` URI’ler dahil. Bizim tek dosya yaklaşık 1 MB (React + Three.js + tüm içerik).
3. **İçerik Güvenliği Politikası (CSP):** harici betik yalnızca cdnjs, jsDelivr, unpkg, cdn.tailwindcss.com, code.jquery.com; harici stil yalnızca Google Fonts. Diğer her şey (fetch/XHR/WebSocket dahil) sessizce engellenir. Biz hiçbir betiği dışarıdan yüklemiyoruz; yalnızca Google Fonts kullanıyoruz (yedek yazı tipleriyle).
4. **Doğrudan API çağrısı Artifact içinde çalışmaz** (CSP). `ApiKeyProvider` yalnızca dosya kullanıcının kendi tarayıcısında açılınca işe yarar; claude.ai içinde `sample` yeteneği kullanılır.
5. **`localStorage` güvenilmez:** her artifact kendi kaynağında, boş dönebilir veya hata fırlatabilir. Tüm erişimler try/catch içinde (`src/lib/storage.ts`). Kalıcı veri için `db`.
6. **Runtime yetenekleri `window.claude.use(name)` ile alınır**; görüntüleyici izin vermezse veya yetenek yoksa `null` döner (10 sn sonra). Uygulama her yetenek yokken de çalışacak şekilde yazıldı.
7. **`db`**: belge deposu. `data/users/<id>/…` yolu yalnızca o kişiye özel (sahibinden bile gizli); `<id>` `user.id()` ile alınır. Belge başına 256 KiB sınırı, çağrı hızı sınırı var. Biz projeleri ve ilerlemeyi `data/users/<id>/workspace/kv/{projects,progress}` belgelerinde tutuyoruz.
8. **`sample`**: sayfa, görüntüleyenin kendi Claude hesabıyla Claude’a sorar. İlk çağrıda izin ister; `sample.json()` JSON döndürür; hata kodları (`not_granted`, `rate_limited`, `invalid_json`…) tek bir reddedilen nesneyle gelir; aynı girdi 5 dk önbellekten döner. Görsel göndermek için ayrıca `images: true` beyanı gerekir (Faz 5 düzeltme laboratuvarı).
9. **Dosya indirme**: `<a download>` engelli; `downloads.save({filename, data})` görüntüleyiciye onay sorar. `alert/confirm/prompt` ve `window.print` çalışmaz; onaylar sayfa içinde yapılır. Panoya yazma yalnızca tıklama içinde, başarısızsa metin seçilir.
10. **Hash yönlendirme**: yalnızca düz `#ad` taşınır; `#settings`, `#sidebar`, `#customize`, `#upgrade`, `#downloads`, `#comment-*` claude.ai’ye ayrılmış. Rotalarımız: `#ana-sayfa`, `#akademi`, `#studyo`, `#fabrika`, `#kutuphane`, `#ayarlar`.

Ek: telefon güvenli alanları (`env(safe-area-inset-*)`), tema üç durumlu (`data-theme` + `prefers-color-scheme`), `prefers-reduced-motion` desteklenir.
