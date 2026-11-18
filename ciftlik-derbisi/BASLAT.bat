@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Cilgin Ciftlik Derbisi - Sunucu
echo.
echo  Cilgin Ciftlik Derbisi baslatiliyor...
echo  Tarayici kendiliginden acilacak (test paneli ile).
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0araclar\sunucu.ps1" -Ac
echo.
echo  Sunucu kapandi.
pause
