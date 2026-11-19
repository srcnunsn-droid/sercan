# =====================================================================
#  FON TEMİZLEME ARACI (FON-TEMIZLE.bat bunu çalıştırır)
#  assets\hayvan\<hayvan>\kos.mp4 ve kay.mp4 kliplerindeki SAF MAVİ fonu siler,
#  şeffaf arka planlı kos.webm / kay.webm yapar. Koşu klibinde başı ve sonu
#  en iyi birleşen parçayı keser (döngüde zıplama olmasın diye).
#  Var olan .webm dosyalarına dokunmaz; yeniden yapmak için önce .webm'i sil.
# =====================================================================
$ErrorActionPreference = 'Continue'
$kok = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$hayvanKlasoru = Join-Path $kok 'assets\hayvan'

# --- ffmpeg'i bul ---
$ffmpeg = $null
$yerel = Join-Path $kok 'araclar\ffmpeg\bin\ffmpeg.exe'
if (Test-Path -LiteralPath $yerel) { $ffmpeg = $yerel }
else {
  $k = Get-Command ffmpeg -ErrorAction SilentlyContinue
  if ($k) { $ffmpeg = $k.Source }
}
if (-not $ffmpeg) {
  Write-Host ""
  Write-Host "  ffmpeg bulunamadı. Kurmak için:" -ForegroundColor Yellow
  Write-Host "  1) Klavyede Windows tuşuna bas, 'PowerShell' yaz ve aç."
  Write-Host "  2) Şu satırı yapıştırıp Enter'a bas:"
  Write-Host "       winget install --id Gyan.FFmpeg -e" -ForegroundColor Cyan
  Write-Host "  3) Kurulum bitince PowerShell'i kapat, bilgisayarı yeniden başlat"
  Write-Host "     ve FON-TEMIZLE.bat'a tekrar çift tıkla."
  Write-Host ""
  Write-Host "  (Alternatif: ffmpeg.exe'yi araclar\ffmpeg\bin\ klasörüne koyabilirsin.)"
  Write-Host ""
  exit 1
}
$ffprobe = Join-Path (Split-Path -Parent $ffmpeg) 'ffprobe.exe'

# Mavi fonu silen filtre: "maviliği" (mavi - max(kırmızı, yeşil)) yüksek olan pikseller şeffaf olur,
# kenarlardaki mavi yansıma da azaltılır. Fonun tam #0000FF olması gerekmez.
$filtre = "format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='min(b(X,Y),max(r(X,Y),g(X,Y))+15)':a='255*(1-clip((b(X,Y)-max(r(X,Y),g(X,Y))-40)/60,0,1))',scale=-2:360"

function Sure-Bul([string]$dosya) {
  if (Test-Path -LiteralPath $ffprobe) {
    $s = & $ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$dosya" 2>$null
    if ($s) { return [double]::Parse(($s | Select-Object -First 1), [System.Globalization.CultureInfo]::InvariantCulture) }
  }
  return 0
}

# En iyi döngü parçasını bul: klibi 12 kare/sn, 32x18 gri küçük karelere çevirip
# birbirine en çok benzeyen (başlangıç, bitiş) çiftini arar. En az 1.5 sn uzunluk.
function Dongu-Bul([string]$dosya) {
  $fps = 12; $w = 32; $h = 18; $boy = $w * $h
  $gecici = [System.IO.Path]::GetTempFileName()
  & $ffmpeg -v error -y -i "$dosya" -vf "fps=$fps,scale=${w}:${h},format=gray" -f rawvideo "$gecici" 2>$null
  $bayt = [System.IO.File]::ReadAllBytes($gecici)
  Remove-Item -LiteralPath $gecici -ErrorAction SilentlyContinue
  $n = [int][Math]::Floor($bayt.Length / $boy)
  if ($n -lt 24) { return $null }
  $enAz = [int]($fps * 1.5)
  $enIyi = [double]::MaxValue; $bi = 0; $bj = $n - 1
  $basSon = [int]($n * 0.4)
  for ($i = 0; $i -le $basSon; $i++) {
    for ($j = $i + $enAz; $j -lt $n; $j++) {
      $fark = 0
      $oi = $i * $boy; $oj = $j * $boy
      for ($p = 0; $p -lt $boy; $p += 3) { $fark += [Math]::Abs([int]$bayt[$oi + $p] - [int]$bayt[$oj + $p]) }
      # uzun parçaları biraz tercih et
      $puan = $fark / ($boy / 3) - ($j - $i) * 0.02
      if ($puan -lt $enIyi) { $enIyi = $puan; $bi = $i; $bj = $j }
    }
  }
  return @{ bas = $bi / $fps; son = $bj / $fps; puan = [Math]::Round($enIyi, 1) }
}

$islenen = 0
if (-not (Test-Path -LiteralPath $hayvanKlasoru)) { Write-Host "assets\hayvan klasörü yok."; exit 1 }
foreach ($klasor in Get-ChildItem -LiteralPath $hayvanKlasoru -Directory) {
  foreach ($ad in @('kos', 'kay')) {
    $giris = Join-Path $klasor.FullName "$ad.mp4"
    $cikis = Join-Path $klasor.FullName "$ad.webm"
    if (-not (Test-Path -LiteralPath $giris)) { continue }
    if (Test-Path -LiteralPath $cikis) { Write-Host "  atlandı (zaten var): $($klasor.Name)\$ad.webm"; continue }
    Write-Host "  işleniyor: $($klasor.Name)\$ad.mp4 ..." -ForegroundColor Cyan
    $kes = @()
    if ($ad -eq 'kos') {
      $d = Dongu-Bul $giris
      if ($d) {
        $sure = [Math]::Round($d.son - $d.bas, 3)
        $basStr = $d.bas.ToString([System.Globalization.CultureInfo]::InvariantCulture)
        $sureStr = $sure.ToString([System.Globalization.CultureInfo]::InvariantCulture)
        Write-Host "    döngü: $basStr sn'den başlayıp $sureStr sn (benzerlik farkı: $($d.puan))"
        $kes = @('-ss', $basStr, '-t', $sureStr)
      }
    }
    $argumanlar = @('-v', 'error', '-y') + $kes + @('-i', $giris, '-an', '-vf', $filtre, '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '0', '-crf', '30', '-auto-alt-ref', '0', $cikis)
    & $ffmpeg @argumanlar
    if (Test-Path -LiteralPath $cikis) { Write-Host "    tamam: $($klasor.Name)\$ad.webm" -ForegroundColor Green; $islenen++ }
    else { Write-Host "    HATA: $($klasor.Name)\$ad.mp4 işlenemedi" -ForegroundColor Red }
  }
}
Write-Host ""
Write-Host "  Bitti. İşlenen klip: $islenen" -ForegroundColor Green
Write-Host "  Oyun açıksa bir sonraki lobide yeni klipleri kendiliğinden kullanır."
