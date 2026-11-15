#!/usr/bin/env bash
# Testlerin kullandığı medya: test.mp4 (renk barları + 440 Hz) ve speech.wav (ton-sessizlik-ton)
cd "$(dirname "$0")"
ffmpeg -v error -y -f lavfi -i testsrc2=size=1280x720:rate=30 -f lavfi -i "sine=frequency=440:sample_rate=48000" -t 6 -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest test.mp4
ffmpeg -v error -y -f lavfi -i "sine=frequency=300:duration=1.5" -f lavfi -i "anullsrc=r=44100:cl=mono:d=1.2" -f lavfi -i "sine=frequency=500:duration=1" -f lavfi -i "anullsrc=r=44100:cl=mono:d=0.9" -f lavfi -i "sine=frequency=400:duration=1.3" -filter_complex "[0][1][2][3][4]concat=n=5:v=0:a=1" speech.wav
echo "test.mp4 + speech.wav hazır"
