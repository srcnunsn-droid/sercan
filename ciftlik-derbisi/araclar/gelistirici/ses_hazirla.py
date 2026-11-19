"""Higgsfield'den inen ham sesleri oyun için hazırlar (geliştirici aracı).
Spiker ve efekt: baştaki/sondaki sessizliği kırpar, başa 80 ms boşluk ekler, ses yüksekliğini eşitler.
Müzik: ses yüksekliğini eşitler, başa/sona yumuşak geçiş ekler.
Kullanım: python3 ses_hazirla.py <ham_klasor> <oyun_klasoru>   (ham/{muzik,efekt,spiker}/*.mp3)
"""
import os, subprocess, sys

def calistir(arg, zaman=60):
    try:
        subprocess.run(arg, check=True, timeout=zaman, stdin=subprocess.DEVNULL)
        return True
    except Exception as e:
        print("  sorun:", os.path.basename(arg[arg.index("-i") + 1]), type(e).__name__)
        return False

def kisa(giris, cikis, lufs, bitrate):
    kirp = ("silenceremove=start_periods=1:start_threshold=-50dB,areverse,"
            "silenceremove=start_periods=1:start_threshold=-50dB,areverse,adelay=80:all=1,apad=pad_dur=0.1,")
    if not calistir(["ffmpeg", "-v", "error", "-y", "-i", giris, "-af", kirp + f"loudnorm=I={lufs}:TP=-1", "-ar", "44100", "-b:a", bitrate, cikis], 30):
        calistir(["ffmpeg", "-v", "error", "-y", "-i", giris, "-af", f"loudnorm=I={lufs}:TP=-1", "-ar", "44100", "-b:a", bitrate, cikis], 30)

def muzik(giris, cikis):
    sure = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", giris], capture_output=True, text=True).stdout.strip() or 0)
    af = f"loudnorm=I=-18:TP=-1.5:LRA=11,afade=t=in:d=1,afade=t=out:st={max(0, sure - 2):.2f}:d=2"
    calistir(["ffmpeg", "-v", "error", "-y", "-i", giris, "-af", af, "-ar", "44100", "-b:a", "128k", cikis], 120)

def main(ham, oyun):
    A = os.path.join(oyun, "assets")
    os.makedirs(os.path.join(A, "muzik", "oyun"), exist_ok=True)
    os.makedirs(os.path.join(A, "ses", "spiker"), exist_ok=True)
    for tur in ["muzik", "efekt", "spiker"]:
        klasor = os.path.join(ham, tur)
        if not os.path.isdir(klasor):
            continue
        for ad in sorted(os.listdir(klasor)):
            if not ad.endswith(".mp3"):
                continue
            g = os.path.join(klasor, ad)
            if tur == "muzik":
                muzik(g, os.path.join(A, "muzik", "oyun", ad))
            elif tur == "efekt":
                kisa(g, os.path.join(A, "ses", ad), -16, "128k")
            else:
                kisa(g, os.path.join(A, "ses", "spiker", ad), -15, "96k")
        print(tur, "tamam")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
