#!/bin/bash
# Parçaları birleştirir, tek bir son görüntü akışı kodlar (her iki sürümde aynı), sesi masterlar.
# Hedef: her MP4 < 95 MB (depo dosya sınırı) → 2 geçişli H.264 ~1.7 Mbps.
set -e
cd "$(dirname "$0")/.."
(cd out/chunks && ls part_*.mp4 | sort -V | sed "s/^/file '/; s/$/'/" > list.txt)
ffmpeg -v error -y -f concat -safe 0 -i out/chunks/list.txt -c copy out/video_concat.mp4
VB=1700k
ffmpeg -v error -y -i out/video_concat.mp4 -c:v libx264 -preset slow -tune animation -profile:v high -pix_fmt yuv420p -b:v $VB -maxrate 4000k -bufsize 8000k -g 60 -pass 1 -passlogfile out/x264 -an -f mp4 /dev/null
ffmpeg -v error -y -i out/video_concat.mp4 -c:v libx264 -preset slow -tune animation -profile:v high -pix_fmt yuv420p -b:v $VB -maxrate 4000k -bufsize 8000k -g 60 -pass 2 -passlogfile out/x264 -an out/video_final.mp4
# Sessiz sürüm: ses akışı yok
ffmpeg -v error -y -i out/video_final.mp4 -map 0:v:0 -c:v copy -an -movflags +faststart zanzibar_1896_sessiz_1080p.mp4
# Ses mastering: -16 LUFS, gerçek tepe -1.5 dBTP (iki geçişli loudnorm)
J=$(ffmpeg -hide_banner -nostats -i work/mix_premaster.wav -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p')
g() { echo "$J" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i work/mix_premaster.wav -af "loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):linear=true,aresample=48000" -c:a pcm_s24le work/mix_master.wav
# Sesli sürüm: aynı görüntü akışı kopyalanır, ses AAC 192k
ffmpeg -v error -y -i out/video_final.mp4 -i work/mix_master.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -movflags +faststart zanzibar_1896_sesli_1080p.mp4
cp work/narration_raw.wav narration_tr.wav
ls -la zanzibar_1896_*.mp4
