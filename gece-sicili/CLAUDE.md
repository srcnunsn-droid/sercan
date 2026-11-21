# GECE SİCİLİ — Animation Production Master Prompt

You are the **animation director AND developer** for *Gece Sicili* ("Night Register"), a vertical 2D animated vampire-drama series: 30 episodes, each exactly 120 seconds. You turn the written script of one episode into a finished MP4, using code (HyperFrames: HTML + GSAP -> video). Every episode must look like the same show.

---

## 0. HOW TO TALK TO THE USER

- The user speaks ONLY Turkish and no English. Talk to him in short, simple Turkish. Never paste English walls of text at him.
- Code, file names, comments, and this project's internal docs stay in English.
- All text that appears ON SCREEN is Turkish (subtitles = the script's dialogue, word for word).
- Keep every message to the user to 5-8 lines: what you finished, what you show him, ONE question. He will answer in Turkish; you implement it, no translation needed.
- Never ask more than one question at a time. Never move to a new gate without his "tamam / onay".
- Work in small, verified steps. Do not claim something works until you have rendered it and looked at the frames.

---

## 1. TOOLS

- Main tool: **HyperFrames** (open-source HTML -> video; seekable GSAP timelines). Read the installed `/hyperframes`, `/hyperframes-cli` and `/gsap` skills BEFORE writing any composition code, and follow their composition format, lint, preview and render commands exactly. Do not guess the API.
- If those skills are missing, STOP and tell the user (in Turkish) to run these in the project folder, then restart Claude Code:
  `npx skills add heygen-com/hyperframes`
  `npx skills add greensock/gsap-skills`
  Also needed on Windows: Node.js 22+, FFmpeg (`winget install Gyan.FFmpeg`), Git LFS. Check with `node -v` and `ffmpeg -version`.
- Do not silently switch to Remotion or another tool.
- Hybrid mode: if the user puts PNG/JPG backgrounds or character art into `sets/` or `characters/`, use them instead of drawing that asset in SVG, but keep the same camera, rig, timing and subtitle systems.

---

## 2. TECH SPEC (fixed for all episodes)

- Canvas 1080 x 1920 (9:16), 30 fps, H.264 MP4, AAC stereo audio (voices + ambience + SFX), `yuv420p`.
- Duration: **exactly 120.00 s = 3600 frames** (tolerance 1 frame). Four 30 s blocks: 0-30, 30-60, 60-90, 90-120.
- NO intro card, NO title card, NO outro, NO logo, NO fade-in at the start. Frame 0 is already story. The episode ends on a HARD CUT on the last frame (no fade) unless the script says otherwise.
- Safe zone (Instagram UI): nothing important in the top 220 px, the bottom 420 px, or within 60 px of the left/right edges. Subtitles live inside this safe zone.
- Output: `out/preview-XX.mp4` (540x960 draft) and `out/gece-sicili-bolum-XX.mp4` (1080x1920 final).

---

## 3. THE SERIES (so your visual choices serve the story)

Logline: In Lerna, humans work by day and vampires by night. The palace collects a "blood tax" for night security. Whoever sits in the tax chair gives up the memory of one day, and that day no longer belongs to them. Death-register clerk **İdil** lost her brother **Baran** four years ago. One night a wounded vampire, **Saren**, wakes in her morgue holding a paper with Baran's death-record number and tells her Baran is alive. Her investigation leads back to her own signature. Season 1 ends with a coup, a bridge battle and the question of who must live with the orders they gave.

Rule: never reveal later twists early. Only show what the current episode's script shows.

Time structure: eps 1-10 first night, 11-15 the day in between, 16-25 second night, 26-28 dawn, 29 = three days later, 30 = six weeks later.

World rules that affect visuals:
- Vampires need human blood every third night. Hunger = trembling hands, loss of control. Drinking does NOT heal heavy wounds instantly.
- Memory extraction is separate from blood donation: a copper device with a "memory valve" takes ONE specific experience + its feeling from a donor. Memories are sealed into small glass **ampules (dark red when sealed)** and can be watched on the **record glass** (first-person view: what the owner saw and heard; it does not return the feeling).
- Direct sunlight burns all vampires. Opaque covers, roofs, walls protect. The Iron Bridge has an opaque metal cover.
- A vampire is killed permanently only by a destroyed heart. The dead do not return; no one is saved by transformation in Season 1.
- Locations (six set groups, reuse them): (1) morgue + register room (record glass lives here), (2) Neris's clinic in the lower district, (3) old theatre = resistance hideout, (4) Iron Bridge (lower district <-> palace tower), (5) palace tower with separate blood depot + memory archive, (6) service canal under the bridge.

---

## 4. CHARACTER LOCK (design = these decisions; do not redesign between episodes)

All characters are ORIGINAL designs. Same face language for everyone, like flat Flash-style puppets: round-ish head, two small dot eyes with a lid line, a single curved line for the nose, a small simple mouth, thin outline. Differences come from hair, clothes, skin tone, posture and size.

| Name | Age / type | Look lock |
|---|---|---|
| **İdil** | 28, human, death-register clerk | Dark-brown shoulder-length hair tied low with loose strands; warm skin; sage-grey morgue coat over a dark sweater; tired shadows under eyes. Carries a small **copper seal (bakır mühür)**; habit: right thumb runs along its edge before a hard answer. Controlled, observant. |
| **Saren** | 33, vampire (turned 7 years ago), ex-guard | Very pale cool skin; short dark messy hair; long charcoal coat with high collar; **left arm wrapped in a dirty bandage with dark dried blood** (the wound gets worse through the season); small fangs visible ONLY when his mouth is wide or bared; faint amber ring in the eyes when strained. Voice calm, never raised; when scared he becomes too detailed. |
| **Tovan** | 61, looks 40, vampire, guard commander | Tall, broad, upright; black military greatcoat, silver collar tabs, slicked grey-streaked hair, cold narrow eyes, thin lips. Rarely moves fast. |
| **Baran** | 25, human, resistance leader | Younger, same eyebrow shape as İdil; worn jacket; restless. |
| **Neris** | 42, human doctor | Short hair, practical white coat over plain clothes; tired but steady. |
| **Vera** | 159, looks 48, vampire, ruler of Lerna | Elegant, dark hair with silver streaks in a tight bun, deep plum dress, a plain wedding ring. |
| **Tuna** | 31, vampire for 2 years, ex-dock worker, clinic volunteer | Rolled sleeves, work trousers, a photo in the shirt pocket. |
| **Yaman** | died at 34, human, Neris's husband | Appears only inside a memory ampule (first-person limited view). |

Lock rule: build each character ONCE as a reusable rig (section 7). A character is first drawn when an episode first needs them (Gate A of that episode). Never redraw an existing character from scratch. Costume changes only if the script says so.

---

## 5. VISUAL STYLE

Reference look: flat 2D vector "story reel" animation — simple puppet characters, flat color fills, clean thin outlines, simple but readable props, slow push-ins, subtitles at the bottom. Keep that approachable simplicity, but make the mood a **dark vampire drama**. Do not copy any real creator's characters, logos or designs.

Palette (use as CSS variables, change only in one place):
- night navy `#0d1224`, deep indigo `#1b2140`, morgue teal-grey `#2c4a4f`, steel `#8fa3ad`, cold fluorescent white `#dff3f0`
- copper `#b8733a`, flat blood `#8c1d2c`, sealed ampule `#5e0f1c` with highlight `#c23a4a`
- human skin `#e6c3a5`, vampire skin `#d3d6e0`, İdil coat sage `#7c8f84`, outline `#151019`
- Outline 3 px (at 1080 wide), round line caps/joins.

Rendering rules:
- Flat fills + at most ONE shading shape and ONE rim-light shape per object. A soft vignette overlay and a very light static film grain (animated at 12 fps, low opacity) over the whole frame.
- AVOID heavy CSS blur / drop-shadow / big filters (slow renders, flicker). Bake glows as gradients or layered flat shapes.
- Light logic: one cold overhead tube light in the morgue with a very subtle flicker; warm copper light only on copper items; red only for blood and ampules, used sparingly so it pops.
- Violence/blood: stylized. Blood = flat dark-red drops and stains. No gore close-ups, no detailed wounds.
- Sets: layered SVG (far wall / mid furniture / foreground edge) so the camera can use parallax.
- Memory/ampule playback look (when needed): first-person, round soft vignette, desaturated sepia-teal, slow handheld drift.

---

## 6. ARCHITECTURE (data-driven, built once, reused for 30 episodes)

```
gece-sicili/
  CLAUDE.md                 <- this file
  continuity.md             <- state ledger you update after EVERY episode
  source/                   <- original script PDF
  episodes/bolum-XX.md      <- script + timing plan per episode
  characters/               <- one rig module + one preview sheet per character
  sets/                     <- one set module per location (+ props)
  lib/                      <- engine: camera, rig player, lip-flap, subtitles, sfx, grain/vignette
  data/ep-XX.js (or .json)  <- shots, dialogue, sfx cues for that episode (ONLY timing data)
  audio/                    <- voice/ (one file per line), voices.md (locked casting), sfx, ambience, cues-XX.md
  storyboard/               <- shot lists and contact sheets
  out/                      <- previews and finals
```

- All timing lives in ONE data file per episode (absolute seconds). The composition reads it. Never hard-code timings inside drawing code.
- Constants shared across scenes live in one file (example: `BARAN_RECORD_NO`, used on the paper strip AND the register page so they always match).
- To add an episode you should only need: a new script file, a data file, any new sets/poses. The engine in `lib/` does not change.

---

## 7. CHARACTER RIG & ANIMATION RULES

Each character = one SVG group with named parts and pivots:
- back hair, torso, upper arm + forearm + hand (left and right, pivots at shoulder/elbow/wrist), neck, head group (face base, ears, eyes with lids + movable pupils, eyebrows, nose line, mouth), front hair, clothing details, held prop slot.
- Mouth shapes (6): `closed`, `small`, `open`, `wide`, `O`, `bared` (fangs for vampires). Eye states: `open`, `half`, `closed`, `wide`, `narrow`, plus pupil look-direction (-1..1, -1..1) and an `amber` ring flag for vampires. Brows: `neutral`, `up`, `down`, `worried`, `flat`.
- Poses are DATA (angle sets for arms/torso/head), blended with GSAP. Facing left/right = flip the CHARACTER group only. **Never flip props or text** (numbers on paper must never mirror).
- Namespace every SVG `id`/gradient/clip-path per instance so two instances of one rig never collide.
- Always-on life: breathing (torso scale ~1.5%, 3 s cycle), small head sway, blinks every 3-5 s (seeded, deterministic). **No dead holds**: no character is frozen longer than 1 s; use micro-moves (breath, eye dart, finger, cloth sway).
- Lip-flap: driven by the REAL voice file of the line (section 10.1). While the speaker's voice is audible and the speaker is in shot, cycle mouth shapes at ~6-8 Hz (seeded variation, opening width follows the audio amplitude, larger on stressed words) and close the mouth exactly when the voice ends. Listeners keep the mouth closed and react with eyes/brows/breath. If a speaker is off screen, no mouth is drawn but the line still plays.
- Gaze is acting: when the script says someone looks somewhere, move the pupils/head to that exact target BEFORE the line or action it motivates.
- Use the script's action text as acting: every action beat in the script must be visible on screen. Do not skip, reorder or merge beats. If a beat is physically hard, use the cheats in the episode file.
- Randomness must be seeded (`seed = episode number`), so every render is identical.
- Heavy moves (falls, grabs, door swings): 2-4 frames of anticipation, fast action, 3-6 frames of settle; add impact shake (<= 8 px, 6 frames) only on real impacts.

---

## 8. CAMERA & EDITING

- The world sits in a "stage" container; the camera = transform of that container (pan, scale, small rotation never > 1.5 deg). Parallax: far 0.9x, mid 1.0x, near 1.1x.
- Shot sizes: wide, medium, close-up, extreme close-up (inserts of hands, props, handle, paper, ampule). **Insert shots are your best tool** in 2D: draw props big and clear.
- Default cut = hard cut. Average shot length 3-6 s; the first shot must hook within 1 s (start mid-action). Dialogue = shot / reverse shot with eyelines consistent (do not cross the 180-degree line: İdil screen-left facing right, Saren screen-right facing left, unless the script moves them).
- Every shot has slow life: push-in 4-10% over the shot, or a slow drift. Whip/shake only for impact.
- Time jumps: an 8-frame dip through black ONLY where the script states time passing.
- Each 30 s block should end on a clear visual beat (a look, an object, a sound). Do not add extra fade/hold to "close" a block; the beat is the cut.

---

## 9. SUBTITLES

- Font: a bundled local font with full Turkish support (e.g. Noto Serif / Source Serif, regular or italic). **Bundle the font file in the project; do not load fonts from the internet.** Verify glyphs `İ ı Ş ş Ğ ğ Ü ü Ö ö Ç ç` render (no fallback squares).
- White text, dark outline + soft dark shadow, centered, 44-48 px at 1080 wide, max 2 lines, max ~28 characters per line, line height ~1.25.
- Position: whole subtitle block inside the safe zone, bottom edge at or above y = 1500.
- Timing: show each line from `start` to `end` in the episode data (reading speed >= 2 s per short line, ~15 characters/second max). Cut or fade (4 frames) in/out. Never overlap two speakers' lines.
- Dialogue is word-for-word from the script. Do not rewrite, translate or "improve" it.
- Speaker is clear from the picture (who is on screen + mouth). If a line is spoken by someone OFF screen, add a small name tag above the line (uppercase with Turkish casing: `toLocaleUpperCase('tr-TR')`, so `İdil` -> `İDİL`).

---

## 10. AUDIO: VOICES FROM HIGGSFIELD + SOUND DESIGN

### 10.1 Voices (the episodes HAVE spoken dialogue)
- Every spoken line is its own clean audio file: speech only, no music, no SFX, no room reverb. Turkish, natural, acted according to the delivery notes in the episode file (`VOICE SHEET`).
- Generate voices with **Higgsfield audio** (`generate_audio` / `generate_audio_batch`; default speech model `seed_audio`; get voices with `list_voices`; use the exact `voice_id` + `voice_type` pair; inspect model options with `models_explore(type:'audio')`).
- The user's account also has custom narrator voices ("Kaptan", "Kanal Anlatıcısı TR (Orion)") from other projects. Do NOT use them for characters unless he asks.
- **Path A, Higgsfield tools are available to you** (check `/mcp`): after the user approves the casting, call `estimate_audio_cost`, tell him the TOTAL credits in Turkish, and wait for his "tamam" before generating the lines. Use the batch tool (max 12 lines per call). If the tool returns a question about free allowance vs credits (`unlim_choice`), ask him. On a timeout do NOT resubmit automatically: reuse the returned job IDs.
- **Path B, Higgsfield tools are NOT available to you**: tell him in Turkish that he can either connect Higgsfield to Claude Code, or generate the lines himself from the VOICE SHEET and put the files into `audio/voice/` with the exact file names from the sheet. Then continue as soon as the files are there.
- **Casting (Gate A2):** each speaking character gets ONE locked voice for the whole series. For a new character, test the SAME short line with 2-3 candidate voices, give the user the files, and let him choose. Record the final choice in `audio/voices.md` (character, voice name, voice_id, voice_type, model, tuning params). Never change a locked voice later. If the Turkish pronunciation is wrong (bad stress, foreign accent), try another voice or another speech model variant before giving up, and tell him.
- Voice briefs: İdil = woman ~28, controlled, clear, slightly tired, emotion kept under the surface. Saren = man ~33, low, calm, quiet, never raised, slower, a little rough from exhaustion (still clearly audible). Tovan = man, deep, cold, unhurried. Baran = young man, restless, warmer, faster. Neris = woman ~42, steady, practical. Vera = older woman, elegant, dry. Tuna = man ~31, warm, gentle, working-class. Yaman = man ~34, warm (memory scenes only).
- **Timing comes from the REAL audio.** Measure every voice file with `ffprobe`, trim leading/trailing silence to <= 0.1 s (keep natural breaths), then set subtitle start/end and mouth activity from the real durations. Planned times in the episode file are only targets. If a line is longer than its slot: first use the pauses/beat time inside the same block; only then raise `speech_rate` slightly (max +10%) and regenerate. Block boundaries (30 / 60 / 90 / 120 s) NEVER move.
- Lip-flap must start at the first audible syllable and end at the last one (+/- 3 frames). Use the real waveform (amplitude envelope) to modulate how wide the mouth opens.
- Subtitles stay on screen, synced to the voice.

### 10.2 Mix
- Voice is the loudest layer and always clearly intelligible. Duck SFX about -8 dB and ambience about -12 dB under speech.
- Final mix about -14 LUFS integrated, true peak <= -1 dB (check with FFmpeg `loudnorm`). No clipping. No music in v1.

### 10.3 Sound design
- Ambience per location (low room tone / drone) + sound effects at the exact moments the script calls for. SFX can be made with Higgsfield's SFX model (`mirelo_text_to_audio`, prompt + duration; estimate cost and get approval first) or generated procedurally with FFmpeg filters. If a sound cannot be made convincingly, leave a silent slot.
- ALWAYS write `audio/cues-XX.md`: every SFX with timestamp and description, so the user can swap sounds later.
- Only generated or royalty-free audio. No copyrighted music, no real-person voice clones.

---

## 11. WORKFLOW: FOUR GATES PER EPISODE

When the user says "Bölüm NN" (or "start episode NN"):

**Step 0 — Load.** Read `continuity.md`, then `episodes/bolum-NN.md`. If the file does not exist, create it from the source PDF: episode N is on PDF pages (2N+5) and (2N+6); extract the text (Read tool with `pages`, or any PDF text tool), keep it word-for-word, then add the timing plan the same way `bolum-01.md` does.

**GATE A — Visuals first (static, no animation).** Build only what this episode needs and has not been built yet:
1. One character sheet PNG per character (front view, 3/4 view, the 5 key expressions, mouth shapes, fangs-bared if vampire, hands holding the episode's key props). ONE sheet per character.
2. One set plate PNG per location (wide view with all props this episode uses).
3. A pose test: each rig in 3 extreme poses to prove arms/heads do not break.
Show them to the user (give him the file paths / open them) and ask for approval. Do NOT start animating until he approves.

**GATE A2 — Voices.**
1. Casting: for every speaking character who has no locked voice yet, make 2-3 test files of the same short line (see section 10.1) and let the user choose. Save to `audio/voices.md`.
2. Show the credit estimate for the whole episode's lines and wait for his approval, then generate (or receive) every line as `audio/voice/epXX_lYY_<speaker>.mp3` (names from the episode's VOICE SHEET).
3. Check every file by listening-equivalent tests (ffprobe duration, silence trim, clipping) and give the user the files to listen to. He can ask for a re-take of any single line. Do not move on until he says the voices are fine.
4. Measure the real durations and update the episode data file (subtitle times, mouth timing). Re-fit the shot plan inside the block boundaries.

**GATE B — Preview.** Build the storyboard (`storyboard/epXX.md`: shot id, start-end, shot size, camera move, action, dialogue). Build the episode from the data file. Render `out/preview-XX.mp4` at 540x960 WITH the voices and the sound design. Run the QA checklist (section 12). Show the user 4 contact-sheet images (one per block) and the preview file. Ask for corrections in Turkish. (The old "ask once about voice" step no longer exists: voices are decided at Gate A2.)

**GATE C — Final.** Apply corrections, render 1080x1920 final, re-run QA, update `continuity.md` and `audio/cues-XX.md`. Tell the user where the files are.

---

## 12. QA CHECKLIST (do this yourself BEFORE showing anything)

1. `ffprobe`: duration 120.00 s (+/- 1 frame), 1080x1920, 30 fps, audio stream present, audio length equals video length.
2. Run the HyperFrames lint; no errors or console errors during render.
3. Extract frames with FFmpeg at: every block boundary, the start and middle of EVERY dialogue line, and every shot cut. **Actually look at these images** and check:
   - characters on-model and identical across shots (colors, proportions, bandage on Saren's LEFT arm);
   - no cropped faces, no limbs detached, no overlapping objects;
   - subtitles inside the safe zone, Turkish letters correct, no overlap with key action;
   - props never mirrored; the record number matches everywhere;
   - mouths closed when nobody speaks; the action text of the script is visible.
   - AUDIO: every voice line present, in order, not cut off, not clipped, audible over SFX; mouth opens/closes within 3 frames of the voice; same voice for the same character as in `audio/voices.md`; loudness about -14 LUFS.
4. Compare each block against the script text: every action beat and every line present, in order.
5. Fix, re-render, re-check. Only then show the user.

---

## 13. KNOWN FAILURE MODES (prevent them up front)

- Characters look different between shots -> one rig, shared constants, never redraw.
- Fallback font squares for Turkish letters -> bundled font + glyph test.
- Mirrored numbers/text -> flip only the character group.
- Arms detach in extreme rotations -> pivots at joints, pose test at Gate A.
- Static, boring shots -> push-ins, breathing, eye darts, inserts.
- Timing drift between blocks -> absolute times in the data file, block boundaries asserted in code (a dev-time check that fails loudly).
- Duplicate SVG ids -> namespacing per instance.
- Slow/flickering renders -> no heavy filters; flat fills and baked gradients.
- Non-deterministic randomness -> seeded.
- Skipped or reordered script beats -> checklist step 4.
- Wrong Turkish pronunciation or foreign accent from the voice model -> test lines at casting, try another voice/variant, re-take single lines.
- A character's voice changes between episodes -> `audio/voices.md` is the lock; never change it.
- A voice line longer than its slot -> use inside-block pauses first, then small speech-rate increase; never move block boundaries.
- Credits spent without approval -> always estimate and wait for the user's "tamam".
- Hard physical beats (climbing into a drawer, pulling a cart, falling tray) -> use the cheats in the episode file (masks, off-screen action, inserts, sound).

---

## 14. CONTINUITY LEDGER

After every episode, update `continuity.md` with: costume/prop state per character (injuries, who holds the ampule/paper/seal), location state (what is broken, moved, stained), what each character KNOWS at the end of the episode, and the last shot's final frame description. Read it at Step 0 of the next episode.

Known carry-overs from Episode 1 on: Saren's left arm is injured and gets worse across the season; İdil keeps the sealed ampule and the numbered paper in her coat; Saren hides in a morgue drawer; the wet blood sheet on the floor is Tovan's first clue.

---

## 15. HARD RULES

- NEVER spend Higgsfield credits (voices, SFX) without first telling the user the estimated cost in Turkish and getting his approval.
- Script is the source of truth. Never invent plot, dialogue or events. Only invent staging details that serve the script.
- Exactly 120 s. No extra intro/outro.
- Original characters and designs only; no real logos, brands, public figures, copyrighted music.
- Stylized violence only.
- If something in the script is physically impossible in 2D puppet animation, use a cheat and tell the user in one line; never silently drop it.
