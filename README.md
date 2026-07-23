# Thai Trainer 🇹🇭

A private, offline-friendly web app for learning to **read and write Thai**. Browse the
alphabet, drill with spaced-repetition flashcards, trace characters on a writing canvas,
add your own vocabulary, and hear it all spoken aloud.

**Privacy first:** everything you do stays in your browser. There is no backend, no
account, and no analytics. Your progress and custom words live in `localStorage` on your
own device. Audio for all built-in content is bundled with the app as static files — no
text is ever sent to a server (custom words you add use your browser's own speech engine;
see [Audio](#audio)). The only other network request the page makes is to Google Fonts for
the Thai webfont, and the app falls back to your system Thai font if you block it.

## Features

- **Learn** — All 44 consonants (with tone class + acrophonic name), core vowels, tone
  marks, and starter vocabulary. Tap any card to hear it; tap the chip to mark progress.
- **Flashcards** — Leitner-style spaced repetition. Hard cards come back sooner. Choose a
  deck (consonants / vowels / tones / words) and a direction (Thai→meaning or meaning→Thai).
- **Write** — Trace a faint guide glyph with mouse, finger, or stylus; toggle the guide off
  to test yourself.
- **Words** — Add any Thai word you want to study; it joins your flashcards and writing
  practice automatically.
- **Progress** — Per-category mastery bars, a speech-rate control, and **export/import** so
  you can back up your data to a file (the only way data leaves your device — by your choice).

## Audio

All built-in content (consonants, vowels, tone marks, starter vocabulary) ships with
**pre-generated neural audio** (`assets/audio/`, ~2 MB) in two voices — **Premwadee**
(female) and **Niwat** (male), switchable in the Progress tab. It sounds identical on
every browser and OS, works fully offline, and involves no runtime TTS service — they're
just static mp3 files, so the privacy story is unchanged.

The audio is synthesized once at build time by `tools/generate-audio.mjs` (using Microsoft
Edge's free neural Thai voices). Re-run it only if the dataset in `data.js` changes:

```bash
cd tools && npm install && npm run generate-audio
```

**Custom words you add** have no pre-generated file, so they fall back to the browser's
built-in **Web Speech API** with the best Thai (`th-TH`) voice available (ranked by
quality — Edge/Chrome's neural voices first, then OS voices):

- **macOS/iOS:** ships with the Thai voice *Kanya* — works out of the box.
- **Windows:** install the Thai language pack (Settings → Time & Language → Language) to get
  the *Pattara* voice.
- **Android/Chrome:** usually available after installing Thai text-to-speech.
- If no Thai voice is found, the Progress tab tells you, and playback of custom words falls
  back to a default voice (which may mispronounce or stay silent).
- Note: some browser voices (Edge's "Online/Natural", Chrome's "Google ไทย") are network
  voices — for custom words they send that word's text to the browser vendor to synthesize.
  Built-in content never does this.

## Run locally

It's a static site — just serve the folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

(Opening `index.html` directly via `file://` also works, but a local server is closer to how
GitHub Pages serves it.)

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. Repo **Settings → Pages → Build and deployment**.
3. Source: **Deploy from a branch**, Branch: **main**, folder: **/ (root)**.
4. Save. Your app will be live at `https://<username>.github.io/<repo>/` in a minute or two.

Because it's fully client-side, GitHub only ever serves static files — it never sees your
study data.

## Project structure

```
index.html
assets/
  css/style.css
  audio/
    premwadee/   # bundled neural audio, female voice (one mp3 per built-in item)
    niwat/       # bundled neural audio, male voice
  js/
    data.js      # Thai character + vocab dataset
    storage.js   # localStorage progress, spaced repetition, export/import
    tts.js       # bundled-audio player + Web Speech fallback for custom words
    writing.js   # tracing canvas
    app.js       # views, routing, UI glue
tools/
  generate-audio.mjs  # build-time audio synthesis (re-run when data.js changes)
```
