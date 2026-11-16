@echo off
cd /d "%~dp0"
title KADRAJ Studio
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js kurulu degil. Acilan sayfadan LTS surumunu indirip kur, sonra bu dosyayi tekrar calistir.
  start https://nodejs.org/
  pause
  exit /b 1
)
if not exist node_modules (
  echo Ilk kurulum yapiliyor, 1-2 dakika surebilir...
  call npm install
  if errorlevel 1 (
    echo Kurulum basarisiz oldu. Internet baglantini kontrol et.
    pause
    exit /b 1
  )
)
echo KADRAJ Studio aciliyor... Bu pencereyi KAPATMA, kapatirsan program durur.
call npm run dev -- --open
pause
