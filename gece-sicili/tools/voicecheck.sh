#!/bin/bash
# Listening-equivalent checks for voice files: duration, peak, RMS, lead/trail silence, Turkish ASR text.
# Usage: tools/voicecheck.sh file.wav [...]
L="$(dirname "$0")/../.agents/skills/hyperframes/scripts/plugin-cli.mjs"
for f in "$@"; do
  d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")
  st=$(ffmpeg -hide_banner -nostats -i "$f" -af astats=metadata=0 -f null - 2>&1 | grep -E "Peak level dB|RMS level dB" | head -2 | awk '{print $NF}' | paste -sd' ')
  sil=$(ffmpeg -hide_banner -nostats -i "$f" -af silencedetect=n=-45dB:d=0.08 -f null - 2>&1 | grep -oE "silence_(start|end): [0-9.]+" | paste -sd' ')
  tmp=$(mktemp -d)
  cp "$f" "$tmp/a.wav"
  node "$L" transcribe "$tmp/a.wav" --dir "$tmp" --engine whisper --model small --language tr --json >/dev/null 2>&1
  txt=$(python3 -c "import json,sys;d=json.load(open('$tmp/transcript.json'));w=d if isinstance(d,list) else d.get('words',d.get('segments',[]));print(' '.join((x.get('text') or x.get('word') or '').strip() for x in w))" 2>/dev/null)
  echo "== $(basename "$f") dur=$d peak/rms=[$st]"
  echo "   silence: $sil"
  echo "   ASR: $txt"
  rm -rf "$tmp"
done
