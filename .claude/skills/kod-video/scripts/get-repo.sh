#!/bin/sh
# Kullanım: sh get-repo.sh <repo-adı|all>
# Repoyu ~/video-repos/<ad> altına klonlar (varsa günceller), son satırda yolu yazar.
set -e
DEST="${VIDEO_REPOS:-$HOME/video-repos}"
mkdir -p "$DEST"

url_for() {
  case "$1" in
    awesome-opus5-5-videos)    echo yihui-dev/awesome-opus5-5-videos ;;
    opus-video-prompts)        echo joeseesun/opus-video-prompts ;;
    awesome-claude-5-5-videos) echo athemeroy/awesome-claude-5-5-videos ;;
    ClaudeAnimationBase)       echo JohnHeibel/ClaudeAnimationBase ;;
    PDoomVideo)                echo JohnHeibel/PDoomVideo ;;
    pdoom-video)               echo mexicat/pdoom-video ;;
    mg-styles-15)              echo Vincentwei1021/mg-styles-15 ;;
    lemo-opuscar)              echo lemomo-ai/lemo-opuscar ;;
    *) return 1 ;;
  esac
}

fetch() {
  repo=$(url_for "$1") || { echo "Bilinmeyen repo: $1" >&2; exit 1; }
  dir="$DEST/$1"
  if [ -d "$dir/.git" ]; then
    git -C "$dir" pull -q --ff-only || true
  elif [ "$1" = mg-styles-15 ]; then
    # 1.2 GB; videolar hariç sadece prompt, kütüphane ve kaynak kodu al
    git clone -q --depth 1 --filter=blob:none --sparse "https://github.com/$repo.git" "$dir"
    git -C "$dir" sparse-checkout set prompts lib harness demos
  else
    git clone -q --depth 1 "https://github.com/$repo.git" "$dir"
  fi
  echo "$dir"
}

if [ "$1" = all ]; then
  for r in awesome-opus5-5-videos opus-video-prompts awesome-claude-5-5-videos ClaudeAnimationBase PDoomVideo pdoom-video mg-styles-15 lemo-opuscar; do
    fetch "$r"
  done
else
  fetch "${1:?repo adı ver (ya da all)}"
fi
