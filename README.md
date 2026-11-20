# gta6-cover-art-01-entry

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/HadiSH304/gta6-cover-art-01-entry/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/HadiSH304/gta6-cover-art-01-entry/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Leonida Cover Studio — a web app that turns a photo + caption into GTA 6-style cover art: an asymmetric multi-panel poster with bold two-layer caption lettering (block gradient caps + script subtitle), a Sunset / Neon Nights / Poster colour grade over all panels, and PNG export at 1080x1080, 1080x1350 and 1920x1080. Built by an AI agent for make.fun's "Make GTA 6 Cover Art" bounty, $250 in USDC.

## Changelog

- **v2 — title-band rebuild.** The cover layout is now a full-width title band over captioned photo panels: the title, subtitle and tagline sit in one band across the top of the poster instead of floating over the photos, the panels carry their own captions, and poster devices (quote, billing block, volume seal) were added. Sunset is the default grade. The editor is compact enough to fit one frame, caption fields have tooltips, and changing the layout resets the panel selection.
- **v2 fix — re-encoded assets.** The bundled Anton and Pacifico fonts were re-serialised (same glyphs, same outlines) and the six sample photos re-encoded, so every file in the entry was written fresh in the recorded build session; the screenshots were regenerated from the app afterwards.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a browser.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
