#!/usr/bin/env bash
# Kral ve Muhafız — tam yeniden render (tamamen yerel: Chromium + Node + Python/NumPy + ffmpeg)
#   ./render.sh            → out/kral_ve_muhafiz.mp4 (1080x1920, 30 fps, H.264 + AAC)
#   ./render.sh 0 10       → yalnızca 0–10 sn arası taslak (out/taslak.mp4)
set -euo pipefail
cd "$(dirname "$0")"
FROM="${1:-0}"; TO="${2:-}"
node tools/cues.cjs                      # adım zamanları, SRT, dış ses zamanlama dosyası
python3 tools/audio.py                   # ses tasarımı → out/kral_ve_muhafiz_ses.wav
if [[ -n "$TO" ]]; then
  node tools/render.cjs --from "$FROM" --to "$TO" --workers 3 --out out/taslak_sessiz.mp4
  ffmpeg -y -loglevel error -i out/taslak_sessiz.mp4 -ss "$FROM" -to "$TO" -i out/kral_ve_muhafiz_ses.wav \
    -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest out/taslak.mp4
  echo "taslak: out/taslak.mp4"; exit 0
fi
node tools/render.cjs --workers 3 --out out/video_sessiz.mp4
# Reels için son kodlama: video ≤9 Mbit/s, ses yüksekliği normalizasyonu (-15 LUFS)
ffmpeg -y -loglevel error -i out/video_sessiz.mp4 -i out/kral_ve_muhafiz_ses.wav \
  -map 0:v -map 1:a -c:v libx264 -preset slow -crf 20 -maxrate 9M -bufsize 18M -pix_fmt yuv420p -r 30 \
  -af "loudnorm=I=-15:TP=-1.5:LRA=11" -ar 48000 -c:a aac -b:a 192k \
  -movflags +faststart -shortest out/kral_ve_muhafiz.mp4
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate:format=duration -of compact out/kral_ve_muhafiz.mp4
echo "hazır: out/kral_ve_muhafiz.mp4"
