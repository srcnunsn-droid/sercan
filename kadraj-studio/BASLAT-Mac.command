#!/bin/bash
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js kurulu degil. Acilan sayfadan LTS surumunu indirip kur, sonra bu dosyayi tekrar calistir."
  open https://nodejs.org/
  read -n 1 -s -r -p "Kapatmak icin bir tusa bas"; exit 1
fi
if [ ! -d node_modules ]; then
  echo "Ilk kurulum yapiliyor, 1-2 dakika surebilir..."
  npm install || { echo "Kurulum basarisiz oldu. Internet baglantini kontrol et."; read -n 1 -s -r; exit 1; }
fi
echo "KADRAJ Studio aciliyor... Bu pencereyi KAPATMA, kapatirsan program durur."
npm run dev -- --open
