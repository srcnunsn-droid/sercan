#!/bin/bash
# Final encode: video from the HyperFrames render + the final mix (exactly 120 s), H.264 yuv420p + AAC stereo.
# Usage: tools/finalize.sh raw.mp4 out.mp4 [scale e.g. 540:960]
set -e
RAW=$1; OUT=$2; SC=$3
VF="format=yuv420p"; [ -n "$SC" ] && VF="scale=$SC:flags=lanczos,format=yuv420p"
ffmpeg -v error -y -i "$RAW" -i audio/mix/ep01-mix.wav -map 0:v:0 -map 1:a:0 -vf "$VF" \
  -c:v libx264 -preset slow -crf 19 -profile:v high -r 30 -c:a aac -b:a 192k -ar 48000 -ac 2 \
  -t 120 -movflags +faststart "$OUT"
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,nb_frames,duration -show_entries format=size -of compact "$OUT"
