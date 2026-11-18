# =====================================================================
#  ÇILGIN ÇİFTLİK DERBİSİ — YEREL SUNUCU
#  BASLAT.bat bu dosyayı çalıştırır. Ek program gerekmez (Windows'un PowerShell'i).
#  Oyunu http://localhost:8787/ adresinde yayınlar ve "Efsaneler" kaydını
#  veri\kayit.json dosyasına yazar. Pencereyi kapatırsan oyun da durur.
# =====================================================================
param([int]$Port = 8787, [switch]$Ac)

$kok = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if (-not $kok.EndsWith('\')) { $kok = $kok + '\' }
$veriKlasoru = Join-Path $kok 'veri'
if (-not (Test-Path -LiteralPath $veriKlasoru)) { New-Item -ItemType Directory -Path $veriKlasoru | Out-Null }

$mime = @{
  '.html' = 'text/html; charset=utf-8'; '.htm' = 'text/html; charset=utf-8'
  '.js' = 'application/javascript; charset=utf-8'; '.json' = 'application/json; charset=utf-8'
  '.css' = 'text/css; charset=utf-8'; '.md' = 'text/plain; charset=utf-8'; '.txt' = 'text/plain; charset=utf-8'
  '.png' = 'image/png'; '.jpg' = 'image/jpeg'; '.jpeg' = 'image/jpeg'; '.webp' = 'image/webp'; '.gif' = 'image/gif'
  '.svg' = 'image/svg+xml'; '.ico' = 'image/x-icon'
  '.mp4' = 'video/mp4'; '.webm' = 'video/webm'
  '.mp3' = 'audio/mpeg'; '.ogg' = 'audio/ogg'; '.wav' = 'audio/wav'
}
$utf8 = New-Object System.Text.UTF8Encoding($false)

function Yaz-Metin($yanit, [int]$kod, [string]$metin, [string]$tip) {
  $bayt = $utf8.GetBytes($metin)
  $yanit.StatusCode = $kod
  $yanit.ContentType = $tip
  $yanit.ContentLength64 = $bayt.Length
  $yanit.OutputStream.Write($bayt, 0, $bayt.Length)
  $yanit.OutputStream.Close()
}

function Kaydet($istek, $yanit) {
  $okuyucu = New-Object System.IO.StreamReader($istek.InputStream, $utf8)
  $govde = $okuyucu.ReadToEnd()
  $okuyucu.Close()
  if ($govde.Length -gt 5000000) { Yaz-Metin $yanit 413 '{"ok":false}' 'application/json'; return }
  try { $null = $govde | ConvertFrom-Json } catch { Yaz-Metin $yanit 400 '{"ok":false}' 'application/json'; return }
  $hedef = Join-Path $veriKlasoru 'kayit.json'
  $gecici = $hedef + '.tmp'
  [System.IO.File]::WriteAllText($gecici, $govde, $utf8)
  if (Test-Path -LiteralPath $hedef) { Copy-Item -LiteralPath $hedef -Destination (Join-Path $veriKlasoru 'kayit.yedek.json') -Force }
  Move-Item -LiteralPath $gecici -Destination $hedef -Force
  Yaz-Metin $yanit 200 '{"ok":true}' 'application/json'
}

function Dosya-Gonder($istek, $yanit, [string]$yol) {
  if ($yol -eq '/' -or $yol -eq '') { $yol = '/index.html' }
  $goreli = $yol.TrimStart('/').Replace('/', '\')
  $tam = [System.IO.Path]::GetFullPath((Join-Path $kok $goreli))
  if (-not $tam.StartsWith($kok, [System.StringComparison]::OrdinalIgnoreCase)) { Yaz-Metin $yanit 403 'Yasak' 'text/plain'; return }
  if (-not (Test-Path -LiteralPath $tam -PathType Leaf)) { Yaz-Metin $yanit 404 'Yok' 'text/plain'; return }
  $uzanti = [System.IO.Path]::GetExtension($tam).ToLowerInvariant()
  $tip = $mime[$uzanti]
  if (-not $tip) { $tip = 'application/octet-stream' }
  $boyut = (Get-Item -LiteralPath $tam).Length
  [int64]$bas = 0
  [int64]$son = $boyut - 1
  $yanit.ContentType = $tip
  $yanit.Headers.Add('Accept-Ranges', 'bytes')
  $aralik = $istek.Headers['Range']
  if ($aralik -and ($aralik -match 'bytes=(\d*)-(\d*)')) {
    $a = $Matches[1]; $b = $Matches[2]
    if ($a -ne '') { $bas = [int64]$a; if ($b -ne '') { $son = [int64]$b } }
    elseif ($b -ne '') { $bas = [Math]::Max([int64]0, $boyut - [int64]$b) }
    if ($son -ge $boyut) { $son = $boyut - 1 }
    if ($bas -gt $son -or $bas -ge $boyut) {
      $yanit.Headers.Add('Content-Range', "bytes */$boyut")
      Yaz-Metin $yanit 416 '' 'text/plain'; return
    }
    $yanit.StatusCode = 206
    $yanit.Headers.Add('Content-Range', "bytes $bas-$son/$boyut")
  }
  [int64]$uzunluk = $son - $bas + 1
  if ($boyut -eq 0) { $uzunluk = 0 }
  $yanit.ContentLength64 = $uzunluk
  if ($istek.HttpMethod -eq 'HEAD') { $yanit.OutputStream.Close(); return }
  $fs = [System.IO.File]::Open($tam, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
  try {
    [void]$fs.Seek($bas, [System.IO.SeekOrigin]::Begin)
    $tampon = New-Object byte[] 65536
    [int64]$kalan = $uzunluk
    while ($kalan -gt 0) {
      $istenen = [int][Math]::Min([int64]65536, $kalan)
      $n = $fs.Read($tampon, 0, $istenen)
      if ($n -le 0) { break }
      $yanit.OutputStream.Write($tampon, 0, $n)
      $kalan -= $n
    }
  } finally {
    $fs.Close()
    try { $yanit.OutputStream.Close() } catch { }
  }
}

$dinleyici = New-Object System.Net.HttpListener
$dinleyici.Prefixes.Add("http://localhost:$Port/")
try {
  $dinleyici.Start()
} catch {
  Write-Host ""
  Write-Host "HATA: $Port numaralı port kullanılamadı." -ForegroundColor Red
  Write-Host "Oyun zaten başka bir pencerede açık olabilir. Diğer siyah pencereyi kapatıp tekrar dene." -ForegroundColor Yellow
  Write-Host ""
  Read-Host "Kapatmak için Enter'a bas"
  exit 1
}

Write-Host ""
Write-Host "  ÇILGIN ÇİFTLİK DERBİSİ ÇALIŞIYOR" -ForegroundColor Green
Write-Host "  Yayın adresi : http://localhost:$Port/" -ForegroundColor Cyan
Write-Host "  Test adresi  : http://localhost:$Port/?test=1" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Bu pencereyi yayın boyunca AÇIK bırak. Kapatırsan oyun durur." -ForegroundColor Yellow
Write-Host ""

if ($Ac) { Start-Process "http://localhost:$Port/?test=1" }

while ($dinleyici.IsListening) {
  try { $ctx = $dinleyici.GetContext() } catch { break }
  try {
    $istek = $ctx.Request
    $yanit = $ctx.Response
    $yanit.Headers.Add('Cache-Control', 'no-store')
    $yol = [System.Uri]::UnescapeDataString($istek.Url.AbsolutePath)
    if ($yol -eq '/api/durum') { Yaz-Metin $yanit 200 '{"ok":true}' 'application/json' }
    elseif ($yol -eq '/api/kaydet' -and $istek.HttpMethod -eq 'POST') { Kaydet $istek $yanit }
    elseif ($istek.HttpMethod -eq 'GET' -or $istek.HttpMethod -eq 'HEAD') { Dosya-Gonder $istek $yanit $yol }
    else { Yaz-Metin $yanit 405 'Desteklenmiyor' 'text/plain' }
  } catch {
    # Tarayıcı bağlantıyı yarıda keserse (ör. video atlama) sunucu çökmesin
    try { $ctx.Response.Abort() } catch { }
  }
}
