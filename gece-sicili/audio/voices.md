# LOCKED VOICE CASTING (never change a locked voice; CLAUDE.md §10.1)

| Character | Voice name | voice_id | voice_type | Model | Tuning | Locked in |
|---|---|---|---|---|---|---|
| İdil | Nora | d081b915-6623-4a44-bacf-80d0f1c90a03 | preset | seed_audio | format wav, sample_rate 48000, speech_rate 0, pitch_rate 0, loudness_rate 0 | Ep 01 |
| Saren | Gideon | 1ad38ba4-9cc4-4f2f-9fde-b0fefdf67ae5 | preset | seed_audio | format wav, sample_rate 48000, speech_rate 0, pitch_rate 0, loudness_rate 0 | Ep 01 |

## Casting notes (Ep 01)
Test lines: l01 (İdil), l02 + l10 (Saren). Checked by Turkish ASR (whisper small, tr) + pitch estimate.
- İdil candidates: Vesper (ASR errors: "atarsın, epey" -> rejected), Elena (clean, brighter ~187 Hz), **Nora** (clean, lower ~138 Hz, natural pause; fits "low, hard, controlled, tired").
- Saren candidates: Julian (English accent on "götürürler" -> rejected), Caspian (clean but 1.6 s lead-in silence; l10 not generated: rate limit), **Gideon** (clean on both lines, deep and calm).
- Kept for a later character: Caspian (deep male) is a good candidate for Tovan's casting test.
- The user delegated the casting choice ("devam et sorma bana", Ep 01). He can still ask for a re-cast before the episode is final.
- l06 'Baran.' re-taken (take 1 ASR 'Beren'); take 2 used.
