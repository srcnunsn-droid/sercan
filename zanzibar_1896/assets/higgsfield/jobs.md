# Higgsfield üretim kaydı

## Yüklenen yerel stil kareleri (referans)
| dosya | media_id |
|---|---|
| style_frames/harbor_dawn.png | 8f488c80-c5c0-4ca2-9e16-82d0f9b22c8e |
| style_frames/harbor_bombard.png | 8adfe8e6-16bf-4380-9a73-8d95ff2d7868 |
| style_frames/harbor_final.png | c768c807-c76c-42da-b83c-7daa3d8eefc6 |
| style_frames/clock.png | 09dec27e-4240-4844-85c0-880506b25be9 |

## Görseller (istenen: nano_banana_pro 2k; sunucu nano_banana_2 ile üretti, 16:9)
| # | amaç | referans | job_id |
|---|---|---|---|
| 0 | deniz seviyesinden liman | harbor_dawn | 0fcac8b7-0b0c-441e-9470-547dcaaedaa4 |
| 1 | saray cephesi | harbor_dawn | 78016071-42de-4195-9e69-20ed6bbc917a |
| 2 | top namlusu yakın plan | harbor_dawn | 59b9a991-ad0f-40b2-9b64-f72d78d515e1 |
| 3 | bombardıman | harbor_bombard | 99097008-9af6-46fb-acd1-0fad1a2894b5 |
| 4 | hasarlı liman (final) | harbor_final | 2535de5e-6589-4586-98c7-6b353a282e2a |
| 2b | top namlusu — düzeltme (1890'lar QF topu, kalkanlı) | harbor_dawn | 5f052a1f-0690-4ab7-a43b-ffaee6492df5 |
| 4b | final — düzeltme denemesi | harbor_final | 30f1669b-a502-49ef-ab66-0e28c9601bba |

Notlar:
- img2: model 1890'lar kruvazör topu yerine eski tip namlu ağızdan dolma top çizdi → istemde "pedestal mount, gun shield, breech" açıkça belirtilerek tek düzeltme yapıldı (img2b kullanılıyor).
- img4: yatın gövdesi fazla görünüyordu → tek düzeltme denendi (img4b) ama ikinci bir yat ekledi. Kural gereği yeniden denenmedi; özgün img4 kullanıldı, yerel animasyondaki yatın son batma durumu img4 ile uyumlu olacak şekilde ayarlandı.

## Videolar (model: wan3_0, 480p, 16:9, generate_audio=false)
| # | amaç | girdi | süre | job_id |
|---|---|---|---|---|
| A | açılış sekansı (4 çekim) | image_references: img0, img1, img2b | 30 sn | 2d26af54-e80a-456f-9364-5fa66b9b8722 |
| B | bombardıman destek | start_image: img3 | 8 sn | 76a0d2cc-812e-46fc-9bb4-240fd0879e98 |
| C | final hasarlı liman | start_image: img4 | 7 sn | a53877ee-c978-435c-b7fd-081e205dd9d8 |
| C2 | final — düzeltme (kilitli kamera; ilk denemede geri çekilişte kadraja yeni gemiler girdi) | start_image: img4 | 7 sn | 275711b4-1ba5-4572-aa91-f8088ac57f19 |

Sonuç notları:
- A: kullanılabilir. Kullanılan aralıklar: 0.3–4.5 (gemiler), 8.0–12.2 (saray), 16.0–18.4 (top), 22.0–25.1 (geniş liman). 14–16 sn aralığındaki taret görünümü ve 25 sn sonrası (geniş planda gemi sırası kalabalıklaşıyor) kullanılmadı.
- B: kullanılabilir (7 sn kullanıldı).
- C: ilk deneme ~2.5 sn'den sonra kadraja yeni gemiler soktu; düzeltme (C2) kamerayı yine hareket ettirdi ve sağ kenara saray kimliğiyle uyumsuz kubbeli bir yapı ekledi. Kural gereği ikinci düzeltme yapılmadı: C'nin temiz ilk 2.4 sn'si kullanıldı, finalin geri kalanı yerel animasyonla tamamlandı.
