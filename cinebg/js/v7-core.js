/* CineBG Studio v7 — çekirdek eklemeler: yeni türler ve motor ön ayarı kaydı.
   Kategori dosyaları (cat-v7-*.js) bu türleri kullanır; motor dosyaları CB.ENGINE_PRESETS'e 10'ar görünüm ekler. */
(function () {
  const CB = window.CB;
  CB.GENRES.push({ id: 'world', tr: 'Dünya Kültürleri' }, { id: 'cine', tr: 'Sinema Türleri' }, { id: 'season', tr: 'Mevsim & Atmosfer' }, { id: 'work', tr: 'Meslek & Mekân' });
  // { motorId: [{ tr, p: [8 parametre 0..1] }] } — makeSpec seed'e göre bir görünüm seçip hafifçe oynatır
  CB.ENGINE_PRESETS = CB.ENGINE_PRESETS || {};
})();
