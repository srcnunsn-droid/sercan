"""Miks içindeki anlatımın anlaşılırlığı: Whisper dökümü ile nihai metin karşılaştırması."""
import whisper, json, re, difflib, sys, torch
torch.set_num_threads(1)
m = whisper.load_model('small')
r = m.transcribe(sys.argv[1], language='tr', fp16=False)
segs = json.load(open('work/segments.json'))
norm = lambda s: ' '.join(re.sub(r"[^\wçğıöşüâî ]+", ' ', s.lower()).split())
ref = norm(' '.join(s['tts'] for s in segs))
hyp = norm(r['text'])
sm = difflib.SequenceMatcher(None, ref.split(), hyp.split())
print('word match ratio', round(sm.ratio(), 3), 'ref words', len(ref.split()), 'hyp words', len(hyp.split()))
open('work/mix_asr.txt', 'w').write(r['text'])
