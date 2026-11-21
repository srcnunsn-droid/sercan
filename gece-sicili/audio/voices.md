# LOCKED VOICE CASTING (never change a locked voice; CLAUDE.md §10.1)

| Character | Voice name | voice_id | voice_type | Model | Tuning | Locked in |
|---|---|---|---|---|---|---|
| İdil | Sloane | b57b22a0-f287-405b-bc82-6f08f5e6bb1f | preset | text2speech_v2, variant **elevenlabs** | defaults (no rate/pitch params); output mp3 -> 48 kHz wav | Ep 01 (re-cast) |
| Saren | Caspian | ef70cc83-3015-4bad-9359-0ea968c43ec0 | preset | text2speech_v2, variant **elevenlabs** | defaults; output mp3 -> 48 kHz wav | Ep 01 (re-cast) |

## History
- Ep 01 first pass used seed_audio (İdil = Nora, Saren = Gideon). The user rejected them ("gerçekçi insan sesi olacak ... elevenlabs kullan").
  Re-cast on ElevenLabs. Old takes kept in audio/voice_seed/ (not used).
- ElevenLabs re-cast tests (line 1 / line 2): İdil — Nora (168 Hz), Elena (250 Hz, bright), **Sloane** (145 Hz, low, controlled);
  Saren — Gideon (75 Hz), **Caspian** (85 Hz, deep, calm), Alistair (91 Hz). All clean in Turkish ASR.
- Re-takes: l06 "Baran." (take 1 heard as "Perran"/"Beren"), l08 (take 1 "bin sana"), l14 (take 1 wrong words). Retakes in audio/casting/retake/.
- Tovan not cast yet: test Caspian is taken by Saren, so try Gideon or Alistair (ElevenLabs) for Tovan.
