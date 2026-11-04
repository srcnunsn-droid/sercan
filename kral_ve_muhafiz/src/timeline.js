// ORTAK ZAMAN ÇİZELGESİ — çizim (JS), altyazı ve ses (Python) aynı kaynaktan okur.
// Python tarafı "TIMELINE =" sonrasındaki JSON gövdesini okur; geçerli JSON olarak tut (yorum yok, sondaki virgül yok).
var TIMELINE = {
  "fps": 30,
  "width": 1080,
  "height": 1920,
  "duration": 72.2,
  "voiceover": "yok (yerel Türkçe TTS aracı bulunamadı) — satır zamanları doğal okuma hızına göre geçici",
  "shots": [
    {"id": "s1a", "start": 0.0,  "end": 3.2,  "set": "ext", "desc": "YAKIN: mızrağı kavrayan titrek el"},
    {"id": "s1b", "start": 3.2,  "end": 7.0,  "set": "ext", "desc": "ORTA: kapıda yalnız nöbet"},
    {"id": "s2",  "start": 7.0,  "end": 17.2, "set": "ext", "desc": "Kapı açılır, kral çıkar, soru-cevap"},
    {"id": "s3a", "start": 17.2, "end": 23.0, "set": "ext", "desc": "İkili: kral sözü verir"},
    {"id": "s3b", "start": 23.0, "end": 27.0, "set": "ext", "desc": "YAKIN yüz: yumuşama"},
    {"id": "s4a", "start": 27.0, "end": 29.6, "set": "ext", "desc": "Kral döner, içeri girer"},
    {"id": "s4b", "start": 29.6, "end": 34.4, "set": "int", "desc": "İç: kâtip belge uzatır, kral okuyarak yürür"},
    {"id": "s4c", "start": 34.4, "end": 37.0, "set": "ext", "desc": "Kapı kapanır, ışık çekilir"},
    {"id": "s5a", "start": 37.0, "end": 41.6, "set": "ext", "desc": "Umutla kapıya bakış"},
    {"id": "s5b", "start": 41.6, "end": 46.0, "set": "ext", "desc": "Ayak oynatma, el ısıtma"},
    {"id": "s5c", "start": 46.0, "end": 50.0, "set": "ext", "desc": "Girintiye yaslanma, meşale kısılır"},
    {"id": "s6a", "start": 50.0, "end": 52.6, "set": "ext", "desc": "Diz çöker, kömür alır"},
    {"id": "s6b", "start": 52.6, "end": 56.0, "set": "ext", "desc": "YAKIN: duvara yazar"},
    {"id": "s7",  "start": 56.0, "end": 62.4, "set": "morning", "desc": "Sabah: iki nöbetçi bulur"},
    {"id": "s8",  "start": 62.4, "end": 72.2, "set": "morning", "desc": "YAKIN: duvar yazısı"}
  ],
  "lines": [
    {"id": "L1",  "start": 3.6,  "end": 5.8,  "voice": "anlatıcı", "text": "Dondurucu bir kış gecesiydi.", "sub": ["Dondurucu bir kış gecesiydi."]},
    {"id": "L2",  "start": 9.4,  "end": 12.9, "voice": "anlatıcı", "text": "Kral, sarayın kapısında nöbet tutan muhafıza sordu:", "sub": ["Kral, sarayın kapısında", "nöbet tutan muhafıza sordu:"]},
    {"id": "L3",  "start": 13.3, "end": 14.5, "voice": "kral (hafif sıcak ton)", "text": "“Üşüyor musun?”", "sub": ["“Üşüyor musun?”"]},
    {"id": "L4",  "start": 15.0, "end": 17.0, "voice": "anlatıcı + muhafız (alçak, sakin)", "text": "Muhafız, “Alışığım kralım,” dedi.", "sub": ["Muhafız,", "“Alışığım kralım,” dedi."]},
    {"id": "L5a", "start": 17.6, "end": 18.9, "voice": "kral + anlatıcı", "text": "“Olsun,” dedi kral.", "sub": ["“Olsun,” dedi kral."]},
    {"id": "L5b", "start": 19.2, "end": 22.7, "voice": "kral (samimi)", "text": "“Sana sıcak tutacak elbise getirmelerini emredeceğim.”", "sub": ["“Sana sıcak tutacak elbise", "getirmelerini emredeceğim.”"]},
    {"id": "L6",  "start": 23.6, "end": 25.8, "voice": "anlatıcı", "text": "Muhafızın yüzü bir an yumuşadı.", "sub": ["Muhafızın yüzü", "bir an yumuşadı."]},
    {"id": "L7a", "start": 27.2, "end": 28.6, "voice": "anlatıcı", "text": "Kral saraya döndü.", "sub": ["Kral saraya döndü."]},
    {"id": "L7b", "start": 30.4, "end": 33.4, "voice": "anlatıcı", "text": "Fakat içeri girince verdiği sözü unuttu.", "sub": ["Fakat içeri girince", "verdiği sözü unuttu."]},
    {"id": "L8",  "start": 37.4, "end": 38.6, "voice": "anlatıcı", "text": "Muhafız bekledi.", "sub": ["Muhafız bekledi."]},
    {"id": "L9",  "start": 39.3, "end": 41.4, "voice": "anlatıcı", "text": "Gözleri, her seste kapıya döndü.", "sub": ["Gözleri, her seste", "kapıya döndü."]},
    {"id": "L10", "start": 42.4, "end": 43.8, "voice": "anlatıcı", "text": "Ama kapı açılmadı.", "sub": ["Ama kapı açılmadı."]},
    {"id": "L11", "start": 57.0, "end": 60.2, "voice": "anlatıcı", "text": "Sabah olduğunda onu duvarın yanında buldular.", "sub": ["Sabah olduğunda onu", "duvarın yanında buldular."]},
    {"id": "L12", "start": 60.8, "end": 62.0, "voice": "anlatıcı", "text": "Soğuktan donmuştu.", "sub": ["Soğuktan donmuştu."]},
    {"id": "L13", "start": 63.0, "end": 64.6, "voice": "anlatıcı", "text": "Duvarda bir cümle vardı:", "sub": ["Duvarda bir cümle vardı:"]},
    {"id": "L14", "start": 65.9, "end": 70.2, "voice": "muhafızın sözü (sakin, kırgın; öncesinde ~1.3 sn duraklama)", "text": "“Soğuğa alışkındım; fakat senin sıcak elbise vaadin beni öldürdü...”", "sub": ["“Soğuğa alışkındım; fakat senin", "sıcak elbise vaadin beni öldürdü...”"]}
  ],
  "wallText": ["Soğuğa alışkındım;", "fakat senin", "sıcak elbise vaadin", "beni öldürdü..."],
  "walks": [
    {"who": "king",     "id": "kingOut",  "t0": 8.4,  "t1": 10.9, "x0": 0.0,  "x1": -1.4, "z0": -0.45, "z1": 0.55, "dir": -1, "step": 0.58},
    {"who": "king",     "id": "kingStep", "t0": 17.5, "t1": 18.4, "x0": -1.4, "x1": -1.98, "z0": 0.55, "z1": 0.5, "dir": -1, "step": 0.5},
    {"who": "king",     "id": "kingBack", "t0": 27.45, "t1": 29.7, "x0": -1.98, "x1": 0.05, "z0": 0.5, "z1": -0.5, "dir": 1, "step": 0.6},
    {"who": "king",     "id": "kingIn",   "t0": 29.6, "t1": 34.4, "x0": -3.1, "x1": 2.2,  "z0": 0.7,  "z1": 0.7, "dir": 1, "step": 0.6, "ease": "kingIn"},
    {"who": "clerk",    "id": "clerkIn",  "t0": 29.9, "t1": 31.2, "x0": 2.6,  "x1": 1.05,  "z0": 0.6,  "z1": 0.6, "dir": -1, "step": 0.55},
    {"who": "sentryA",  "id": "sentAIn",  "t0": 56.0, "t1": 58.7, "x0": 0.9,  "x1": -1.6, "z0": 0.9,  "z1": 0.45, "dir": -1, "step": 0.6},
    {"who": "sentryB",  "id": "sentBIn",  "t0": 56.4, "t1": 59.2, "x0": 1.6,  "x1": -0.65, "z0": 1.1,  "z1": 0.8, "dir": -1, "step": 0.6}
  ],
  "sfx": [
    {"t": 7.35, "dur": 1.5, "type": "doorCreak", "gain": 0.55},
    {"t": 12.9, "dur": 0.6, "type": "cloth", "gain": 0.25},
    {"t": 18.3, "dur": 0.5, "type": "cloth", "gain": 0.22},
    {"t": 27.2, "dur": 0.5, "type": "cloth", "gain": 0.2},
    {"t": 31.15, "dur": 0.7, "type": "paper", "gain": 0.35},
    {"t": 34.5, "dur": 1.1, "type": "doorCreak", "gain": 0.45},
    {"t": 35.55, "dur": 0.9, "type": "doorThud", "gain": 0.7},
    {"t": 38.95, "dur": 0.7, "type": "distantClank", "gain": 0.3},
    {"t": 42.0, "dur": 0.25, "type": "stamp", "gain": 0.4},
    {"t": 42.55, "dur": 0.25, "type": "stamp", "gain": 0.38},
    {"t": 43.1, "dur": 0.25, "type": "stamp", "gain": 0.36},
    {"t": 44.0, "dur": 1.4, "type": "handRub", "gain": 0.3},
    {"t": 46.9, "dur": 0.6, "type": "cloth", "gain": 0.25},
    {"t": 50.6, "dur": 0.5, "type": "kneelSnow", "gain": 0.45},
    {"t": 51.9, "dur": 0.3, "type": "pebble", "gain": 0.25},
    {"t": 52.8, "dur": 3.0, "type": "charcoal", "gain": 0.9},
    {"t": 59.0, "dur": 0.5, "type": "kneelSnow", "gain": 0.4}
  ],
  "breath": {"guardPeriod": 3.7, "guardPhase": 0.4},
  "ambience": [
    [0.0, "ext", 0.85], [29.55, "int", 0.0], [34.4, "ext", 0.85], [46.0, "ext", 1.0], [56.0, "morning", 1.1], [64.0, "morning", 1.2], [72.2, "morning", 1.05]
  ],
  "music": [
    [0.0, 0.0], [2.0, 0.16], [16.0, 0.18], [19.0, 0.24], [27.0, 0.2], [36.0, 0.18], [50.0, 0.22], [56.0, 0.16], [63.0, 0.1], [65.0, 0.0], [72.2, 0.0]
  ],
  "musicHarmony": [
    [0.0, "dm"], [17.2, "bb"], [23.0, "f"], [27.0, "gm"], [37.0, "dm"], [46.0, "a"], [50.0, "dm"], [56.0, "gm"]
  ]
};
if (typeof module !== 'undefined') module.exports = TIMELINE;
