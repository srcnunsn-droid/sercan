# BACKLOG (kapsam dışı ya da sonraki fazlar)

## Faz 3 kalanları
- `.glb` dışa aktarma (three/examples GLTFExporter) ve Blender `bpy` betiği.
- Nesne seçme + taşı/döndür/ölçekle gizmosu, ızgaraya yapışma.
- Hazır mekân setleri (peron, sokak, oda, orman, taht salonu, köprü, mağara), proplar, yağmur/kar parçacıkları.
- Derinlik haritası ve poz çizimi çıktısı; replik/hareket/ses şeritli zaman çizelgesi.
- 16:9 / 9:16 / 2.39:1 çerçeve seçici ve güvenli alan çizgileri 3D görünümde.

## Faz 4 kalanları
- Varlık sürüm geçmişi ve yeni projede yeniden kullanma.
- Aynı sahne grafının farklı model çıktıları yan yana; sınırı aşan yerlerin işaretlenmesi.
- Düzenlenebilir kredi fiyat tablosu.
- Model kartlarını Ayarlar’dan düzenleme ve “Model kartını güncelle” (Claude taslağı + onay).

## Faz 5
- Düzeltme laboratuvarı (`sample` + `images: true`), `diagnoseResult`.
- “Yeni sistem ekle” sihirbazı, çalışan promptlardan öğrenme (deneyim defteri).
- Güvenlik/telif linterinin genişletilmesi.

## Faz 6
- M3–M10 içerikleri, aralıklı tekrar kartları, yayın paketi, kataloğun 100+ kayda tamamlanması, model kartları test seti.

## Fikirler
- SECO Director OS’taki “seri bible” ve LensLab’in kamera/lens seçicisi modül olarak yeniden kurulabilir (kod gerekirse kullanıcıdan istenecek).
- İngilizce arayüz (`src/i18n/en.json` hazır, doldurulacak).
- `legacy/mj-prompt-havuz/` içindeki eski stil ve negatif havuzları kataloğa taşınabilir.
