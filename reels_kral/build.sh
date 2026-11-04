#!/usr/bin/env bash
# Builds the final Reels video: scenes -> sound design -> Turkish voice-over -> mix -> mp4.
#   VOICE_DIR=<folder with extracted vits-piper-tr_TR-{fahrettin,fettah}-medium>  ./build.sh
#   SKIP_RENDER=1 skips the (slow) scene rendering.
# Voices: https://github.com/k2-fsa/sherpa-onnx/releases/tag/tts-models (CC0 Piper voices)
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p build output
[ "${SKIP_RENDER:-0}" = "1" ] || python3 render.py render
python3 audio.py
python3 voice.py
ls build/[0-9][0-9]_*.mp4 | sort | sed "s/^build\//file '/; s/$/'/" > build/concat.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i build/concat.txt -c copy build/video_only.mp4

# mix: ambience ducked under the narrator, then loudness-normalised for Instagram (-14 LUFS)
ffmpeg -y -loglevel error -i build/ambience.wav -i build/voice.wav -filter_complex "
  [0:a]volume=-3dB[bed];
  [1:a]pan=stereo|c0=c0|c1=c0,asplit[vo][sc];
  [bed][sc]sidechaincompress=threshold=0.02:ratio=5:attack=30:release=450:makeup=1[duck];
  [duck][vo]amix=inputs=2:normalize=0:weights=1 1.25,
  loudnorm=I=-14:TP=-1.5:LRA=11:linear=true[a]" -map "[a]" -ar 48000 build/final_mix.wav

ffmpeg -y -loglevel error -i build/video_only.mp4 -i build/final_mix.wav -map 0:v -map 1:a \
  -c:v libx264 -preset slow -crf 20 -maxrate 9M -bufsize 18M -pix_fmt yuv420p -profile:v high \
  -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest output/kral_ve_muhafiz_reels.mp4
cp build/ambience.wav output/muzik_ambiyans.wav
cp build/voice.wav output/seslendirme.wav
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate \
  -of compact output/kral_ve_muhafiz_reels.mp4
ffmpeg -hide_banner -i output/kral_ve_muhafiz_reels.mp4 -af ebur128=framelog=quiet -f null - 2>&1 \
  | grep -A2 "Integrated loudness" | tail -2
