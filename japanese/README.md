# ฝึกภาษาญี่ปุ่น (Japanese Trainer) 🇯🇵

A private, offline-friendly web app for **Thai speakers learning to read and write
Japanese**. Browse hiragana & katakana, drill with spaced-repetition flashcards, trace
kana on a writing canvas, add your own vocabulary, and hear it all spoken aloud. The
interface is in **Thai**; word meanings are in Thai.

It's the sibling of the [Thai Trainer](../) at the repo root, built on the same engine.
Live path when deployed: `…/japanese/` (e.g. `https://<user>.github.io/<repo>/japanese/`).

**Privacy first:** everything stays in your browser. No backend, no account, no analytics.
Progress and custom words live in `localStorage` under `jp-trainer:*` keys — a separate
namespace from the Thai app, so the two never mix even on the same origin. Audio for all
built-in content is bundled as static mp3 files.

## Content

- **ฮิรางานะ (Hiragana)** — all 46 basic kana, each with romaji + an approximate Thai reading.
- **คาตาคานะ (Katakana)** — all 46 basic kana. Look-alike pairs (シ/ツ, ソ/ン) are flagged
  in the tips.
- **คำศัพท์ (Words)** — 12 starter words (greetings, いぬ/ねこ, みず, おいしい …) with Thai meanings.
- Add your own words in the **คำศัพท์** tab; they join flashcards and writing practice.

Each item carries a Thai **memory hook** (เคล็ดลับช่วยจำ) tying the kana's shape to its sound.

## Audio

All built-in content ships with **pre-generated neural audio** (`assets/audio/`, ~2.5 MB)
in two voices — **Nanami** (female) and **Keita** (male), switchable in the ความคืบหน้า tab.
It works fully offline and involves no runtime TTS service.

The audio is synthesized once at build time by `tools/generate-audio.mjs` (Microsoft Edge's
free neural Japanese voices). Re-run it only if the dataset in `assets/js/data.js` changes:

```bash
cd tools && npm install && npm run generate-audio
```

**Custom words you add** have no bundled file, so they fall back to the browser's Web Speech
API (`ja-JP`). On Linux there is no good native Japanese voice, which is exactly why built-in
content ships as bundled audio.

## Run locally

Serve the **repo root** (not this folder) so the `../` link back to the Thai app works, then
open the `/japanese/` path:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/japanese/
```

> Serve over http, not `file://` — browsers block loading media from `file://`, which makes
> the bundled audio silently fall back to the (worse) browser voice. The ความคืบหน้า tab and
> the browser console will tell you if that happens.

## Project structure

```
japanese/
  index.html
  assets/
    css/style.css
    audio/
      nanami/   # bundled neural audio, female voice (one mp3 per built-in item)
      keita/    # bundled neural audio, male voice
    js/
      data.js       # hiragana + katakana + vocab dataset (window.JPData)
      mnemonics.js  # Thai-language memory hooks
      storage.js    # localStorage progress, SRS, export/import (jp-trainer:* keys)
      tts.js        # bundled-audio player + Web Speech (ja-JP) fallback
      writing.js    # tracing canvas
      app.js        # views, routing, Thai UI
  tools/
    generate-audio.mjs  # build-time audio synthesis (re-run when data.js changes)
```
