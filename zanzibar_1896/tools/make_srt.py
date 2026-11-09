# -*- coding: utf-8 -*-
"""Gerçek seslendirme zamanlarından (work/timeline.json) Türkçe SRT üretir.
Uzun segmentler noktalama yerlerinden bölünür; süre karakter sayısına göre paylaştırılır. Satır ≤ 42 karakter, en fazla 2 satır."""
import json, re, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
tl = json.load(open(os.path.join(ROOT, 'work', 'timeline.json')))
MAXL = 42

def wrap(s):
    words = s.split(); lines = ['']
    for w in words:
        if len(lines[-1]) + len(w) + 1 > MAXL and lines[-1]:
            lines.append(w)
        else:
            lines[-1] = (lines[-1] + ' ' + w).strip()
    return lines

def fits(x):
    return len(wrap(x)) <= 2

def chunks(text):
    """Cümle sığıyorsa bütün kalır; sığmıyorsa virgüllerden açgözlü birleştirme; o da olmazsa ortadan böl."""
    out = []
    for sent in re.split(r'(?<=[.;:?!])\s+', text):
        if fits(sent):
            out.append(sent); continue
        cur = ''
        for piece in re.split(r'(?<=,)\s+', sent):
            cand = (cur + ' ' + piece).strip()
            if fits(cand): cur = cand
            else:
                if cur: out.append(cur)
                cur = piece
        if cur: out.append(cur)
    final = []
    for p in out:
        while not fits(p):
            w = p.split(); h = len(w) // 2
            final.append(' '.join(w[:h])); p = ' '.join(w[h:])
        final.append(p)
    # çok kısa parçaları komşusuyla birleştir
    merged = []
    for p in final:
        if merged and (len(p) < 14 or len(merged[-1]) < 14) and fits(merged[-1] + ' ' + p):
            merged[-1] = merged[-1] + ' ' + p
        else:
            merged.append(p)
    return merged

def ts(x):
    ms = int(round(x * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f'{h:02d}:{m:02d}:{s:02d},{ms:03d}'

cues = []
for s in tl['segments']:
    cs = chunks(s['text'])
    total = sum(len(c) for c in cs)
    t = s['start']; d = s['end'] - s['start']
    for c in cs:
        dt = d * len(c) / total
        cues.append([t, t + dt, c]); t += dt
# okunurluk: kısa ipuçlarını bir sonraki cümleye kadar uzat (çakışmadan), en az 1.2 sn
for i, c in enumerate(cues):
    nxt = cues[i + 1][0] if i + 1 < len(cues) else c[1] + 1.5
    c[1] = min(max(c[1] + 0.25, c[0] + 1.2), nxt - 0.04)
with open(os.path.join(ROOT, 'subtitles_tr.srt'), 'w', encoding='utf-8') as f:
    for i, (a, b, c) in enumerate(cues, 1):
        f.write(f"{i}\n{ts(a)} --> {ts(b)}\n" + '\n'.join(wrap(c)) + '\n\n')
print(len(cues), 'cues; longest line', max(len(l) for _, _, c in cues for l in wrap(c)))
