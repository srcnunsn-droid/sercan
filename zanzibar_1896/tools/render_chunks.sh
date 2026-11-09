#!/bin/bash
# Sessiz video parçalarını render eder (her parça bağımsız yeniden üretilebilir).
cd "$(dirname "$0")/.."
mkdir -p out/chunks
CHUNKS=("0-1799" "1800-3959" "3960-6959" "6960-8699" "8700-10319" "10320-11831")
ONLY="$1"
for i in "${!CHUNKS[@]}"; do
  if [ -n "$ONLY" ] && [ "$ONLY" != "$i" ]; then continue; fi
  r=${CHUNKS[$i]}
  echo "chunk $i frames $r $(date +%T)"
  npx remotion render src/index.ts Main out/chunks/part_$i.mp4 --frames=$r --muted --codec=h264 --crf=17 --pixel-format=yuv420p --log=error || exit 1
done
echo "done $(date +%T)"
