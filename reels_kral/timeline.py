"""Shared timeline for video, audio and the narrator script."""

W, H, FPS = 1080, 1920, 30

# name, start, end, fade_in, fade_out  (seconds)
SCENES = [
    ("hook",        0.0,  4.5, 0.0, 0.0),
    ("castle",      4.5, 11.0, 0.0, 0.4),
    ("approach",   11.0, 17.0, 0.4, 0.0),
    ("dialog",     17.0, 22.5, 0.0, 0.0),
    ("promise",    22.5, 29.0, 0.0, 0.5),
    ("hall",       29.0, 35.5, 0.3, 0.5),
    ("waiting",    35.5, 42.5, 0.4, 0.9),
    ("dawn",       42.5, 48.5, 0.7, 0.4),
    ("inscription", 48.5, 57.0, 0.4, 0.9),
    ("end",        57.0, 62.0, 0.6, 1.2),
]

DURATION = SCENES[-1][2]

# start, end, style, text   (on-screen captions == narrator lines)
CAPTIONS = [
    (0.3, 4.4, "hook", "Verilen bir söz…\nbir insanı öldürebilir mi?"),
    (4.8, 7.7, "narr", "Dondurucu bir kış gecesiydi."),
    (7.8, 10.9, "narr", "Kral, surlarda nöbet tutan muhafızın yanına geldi."),
    (11.6, 13.6, "narr", "Ona sordu:"),
    (13.7, 16.9, "quote", "“Üşüyor musun?”"),
    (17.2, 19.3, "narr", "Muhafız titreyerek cevap verdi:"),
    (19.4, 22.4, "quote", "“Alışığım kralım.”"),
    (22.7, 24.0, "narr", "Kral gülümsedi:"),
    (24.0, 27.6, "quote", "“Olsun… Sana sıcak tutacak bir elbise getirmelerini emredeceğim.”"),
    (27.7, 28.9, "narr", "Ve gitti."),
    (29.4, 32.3, "narr", "Ama sıcacık sarayına girdiğinde…"),
    (32.4, 35.3, "narr", "…verdiği emri unuttu."),
    (35.9, 39.0, "narr", "Muhafız bütün gece o kapıyı bekledi."),
    (39.1, 42.2, "narr", "Umutla… ve soğukla."),
    (43.0, 45.4, "narr", "Ertesi sabah…"),
    (45.5, 48.4, "narr", "…onu duvarın dibinde donmuş buldular."),
    (48.8, 50.7, "narr", "Duvarda şu yazıyordu:"),
    (57.6, 61.6, "end", "Tutamayacağın sözü…\nkimseye verme."),
]

# text scratched on the wall (revealed in the inscription scene, read by the narrator 50.8-56.8)
WALL_TEXT = ["Soğuğa alışkındım…", "fakat senin", "sıcak elbise vaadin", "beni öldürdü."]
WALL_READ = (50.8, 56.8)
