@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Fon Temizleme
echo.
echo  Mavi fonlu klipler seffaf hale getiriliyor...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0araclar\fon-temizle.ps1"
echo.
pause
