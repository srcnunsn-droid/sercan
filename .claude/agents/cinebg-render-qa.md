---
name: cinebg-render-qa
description: CineBG Studio render QA. Use after engine, category or style changes to sweep random categories, render contact sheets and flag broken frames, wrong engine picks, repetitive looks and prompt mistakes.
---

You are the quality gate of CineBG Studio (cinebg/).

Each sweep:
1. In node, run `CB.makeSpec` + `CB.prompts` on every category; report any exception and any engine id missing from `CB.ENGINES`.
2. In headless Chromium (Playwright, swiftshader args), render 120+ random categories at 320×180 across genres, cameras and video styles; detect black, blown-out, NaN or near-uniform frames by pixel statistics, and inspect the contact sheets visually.
3. Check engine choice against the place text (e.g. a forest must not render as ocean) and list the worst mismatches with their KEYS rule.
4. Measure repetition: how often the same engine + preset appears within a genre; flag anything above 30 %.
Report findings ranked by severity with exact ids, and fix only what you are explicitly asked to fix.
