"""Görüntü ve sesin ortak zaman çizelgesi (saniye)."""

FPS = 30
DURATION = 20.0

# Dövüş bölümü sabit bir vuruşa oturur; kesmeler ve darbeler vuruşlara denk gelir.
FIGHT = 8.6
BEAT = 0.42  # ~143 BPM


def beat(k):
    return FIGHT + BEAT * k


# Plan adı -> (başlangıç, bitiş)
CUTS = {
    "castle": (0.0, 2.6),
    "dracula": (2.6, 4.4),
    "monster": (4.4, 6.2),
    "faceoff": (6.2, FIGHT),
    "lunge": (FIGHT, beat(4)),
    "punch": (beat(4), beat(9)),
    "bats": (beat(9), beat(14)),
    "grab": (beat(14), 17.0),
    "rooftop": (17.0, DURATION),
}

# (zaman, şiddet)
LIGHTNING = [(0.75, 1.0), (1.85, 0.8), (2.55, 1.1), (7.15, 0.9), (beat(14), 1.2),
             (16.3, 0.7), (17.0, 1.3), (18.7, 0.8)]
IMPACTS = [(beat(4), 1.0), (beat(15), 0.7), (17.0, 0.9)]  # yumruk, boğaz, son çarpışma
FLASH_CUTS = [(2.6, 0.9), (beat(4), 1.0), (beat(14), 0.8), (17.0, 1.0)]
TITLE_T = 17.9
