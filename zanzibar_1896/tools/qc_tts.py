"""Her TTS segmentini Whisper ile yazıya döker, hedef metinle karşılaştırır."""
import json, sys, difflib, re, whisper
segs = json.load(open('work/segments.json'))
m = whisper.load_model('small')
def norm(s):
    s = s.lower().replace("’","'")
    s = re.sub(r"[^\wçğıöşüâî ]+", " ", s)
    return " ".join(s.split())
out = []
for i, s in enumerate(segs):
    r = m.transcribe(f'work/tts_raw/seg_{i:02d}.mp3', language='tr', fp16=False, initial_prompt="Halid bin Bargaş, Hamud bin Muhammed, Hamad bin Tuveyni, Glazgov, Zanzibar")
    hyp = r['text'].strip()
    ratio = difflib.SequenceMatcher(None, norm(s['tts']), norm(hyp)).ratio()
    out.append(dict(i=i, id=s['id'], ratio=round(ratio, 3), hyp=hyp))
    print(f"{i:02d} {ratio:.3f} | {hyp}", flush=True)
json.dump(out, open('work/tts_qc.json', 'w'), ensure_ascii=False, indent=1)
