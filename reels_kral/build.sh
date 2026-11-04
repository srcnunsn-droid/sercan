#!/usr/bin/env bash
# Builds the final Reels video: renders scenes, sound design, concatenates and muxes.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p build output
[ "${SKIP_RENDER:-0}" = "1" ] || python3 render.py render
python3 audio.py
ls build/[0-9][0-9]_*.mp4 | sort | sed "s/^build\//file '/; s/$/'/" > build/concat.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i build/concat.txt -c copy build/video_only.mp4
# ambience bed lowered 4 dB to leave room for the narrator
ffmpeg -y -loglevel error -i build/video_only.mp4 -i build/ambience.wav \
  -filter_complex "[1:a]volume=-4dB[a]" -map 0:v -map "[a]" \
  -c:v copy -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest \
  build/full.mp4
ffmpeg -y -loglevel error -i build/full.mp4 -c:v libx264 -preset slow -crf 20 -maxrate 9M -bufsize 18M -pix_fmt yuv420p -profile:v high -c:a copy -movflags +faststart output/kral_ve_muhafiz_reels.mp4
cp build/ambience.wav output/muzik_ambiyans.wav
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate \
  -of compact output/kral_ve_muhafiz_reels.mp4
