// Build-time audio generation for Thai Trainer.
//
// Pre-synthesizes every built-in item (consonants, vowels, tone marks, starter words)
// with Microsoft Edge's free neural Thai voices and writes mp3s into
//   assets/audio/premwadee/<id>.mp3   (th-TH-PremwadeeNeural, female)
//   assets/audio/niwat/<id>.mp3       (th-TH-NiwatNeural, male)
//
// The app plays these static files at runtime — no network TTS, no API keys.
// Re-run this script only when the dataset in assets/js/data.js changes:
//
//   cd tools && npm install && npm run generate-audio
//
// Requires Node 18+ (network access at build time only).

import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Node 18 doesn't expose WebCrypto globally; msedge-tts needs it.
if (!globalThis.crypto) {
  const { webcrypto } = await import('crypto');
  globalThis.crypto = webcrypto;
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Load the app's dataset by evaluating data.js with a stub `window`,
// so the item list and speakableText logic are never duplicated here.
const win = {};
new Function('window', readFileSync(join(root, 'assets/js/data.js'), 'utf8'))(win);
const D = win.ThaiData;

const VOICES = {
  premwadee: 'th-TH-PremwadeeNeural',
  niwat: 'th-TH-NiwatNeural',
};

const items = Object.values(D.ITEMS_BY_ID);
console.log(`Generating ${items.length} items × ${Object.keys(VOICES).length} voices…`);

async function synth(tts, text) {
  const { audioStream } = tts.toStream(text);
  const chunks = [];
  audioStream.on('data', (c) => chunks.push(c));
  await new Promise((res, rej) => {
    audioStream.on('end', res);
    audioStream.on('error', rej);
  });
  return Buffer.concat(chunks);
}

let total = 0;
let skipped = 0;
for (const [dir, voiceName] of Object.entries(VOICES)) {
  const outDir = join(root, 'assets/audio', dir);
  mkdirSync(outDir, { recursive: true });

  let tts = null; // opened lazily; reopened after any failure
  const connect = async () => {
    tts = new MsEdgeTTS();
    await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  };

  for (const item of items) {
    const outFile = join(outDir, `${item.id}.mp3`);
    if (existsSync(outFile)) { skipped++; continue; } // resumable: rerun after a failure
    const text = D.speakableText(item);

    let buf = null;
    for (let attempt = 1; attempt <= 3 && !buf; attempt++) {
      try {
        if (!tts) await connect();
        buf = await synth(tts, text);
      } catch (err) {
        console.warn(`  retry ${attempt}/3 for ${item.id}: ${err.message || err}`);
        try { tts?.close(); } catch {}
        tts = null; // force a fresh connection
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }
    if (!buf) throw new Error(`Failed to synthesize ${item.id} after 3 attempts.`);
    if (buf.length < 1000) throw new Error(`Suspiciously small audio for ${item.id} ("${text}") — aborting.`);
    writeFileSync(outFile, buf);
    total += buf.length;
    process.stdout.write(`  ${dir}/${item.id}.mp3 (${buf.length}b)\n`);
  }
  try { tts?.close(); } catch {}
}

console.log(`Done — ${items.length * 2 - skipped} new files (${skipped} already existed), ${(total / 1024 / 1024).toFixed(2)} MB written.`);
