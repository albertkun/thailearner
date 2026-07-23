// Audio playback for Thai Trainer.
//
// Built-in items (consonants, vowels, tones, starter words) play pre-generated neural
// audio bundled with the app in assets/audio/<voice>/<id>.mp3 — identical high quality
// on every browser and OS, fully offline, nothing sent anywhere.
// Two voices are bundled: 'premwadee' (female) and 'niwat' (male).
//
// Custom words the user adds have no bundled file, so they fall back to the browser's
// Web Speech API. There we rank available voices by quality instead of taking the
// first th-TH match (neural "Online/Natural" voices in Edge, "Google ไทย" in Chrome,
// then any Thai voice).

const VOICE_KEY = 'thai-trainer:voice';
const RATE_KEY = 'thai-trainer:rate';

const TTS = {
  voice: null,          // best Web Speech voice (fallback path)
  ready: false,
  rate: 1,
  voiceChoice: 'premwadee', // which bundled voice folder to play
  bundledAudioFailed: false, // set if a bundled mp3 ever fails to load (surfaced in Progress)
  _audio: null,          // the <audio> element currently playing

  init() {
    const savedVoice = localStorage.getItem(VOICE_KEY);
    if (savedVoice === 'premwadee' || savedVoice === 'niwat') this.voiceChoice = savedVoice;
    const savedRate = parseFloat(localStorage.getItem(RATE_KEY));
    if (savedRate >= 0.5 && savedRate <= 1) this.rate = savedRate;

    if (!('speechSynthesis' in window)) {
      console.warn('speechSynthesis not supported; custom words will have no audio.');
      return;
    }
    this._pickVoice();
    // Voices often load asynchronously; re-pick when they arrive.
    window.speechSynthesis.onvoiceschanged = () => this._pickVoice();
  },

  // Rank Web Speech voices by expected quality rather than taking the first match.
  _pickVoice() {
    const voices = window.speechSynthesis.getVoices();
    const thai = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('th'));
    const score = (v) => {
      const n = v.name.toLowerCase();
      let s = 0;
      if (n.includes('natural') || n.includes('online') || n.includes('neural')) s += 40; // Edge neural
      if (n.includes('google')) s += 30;                                                   // Chrome network voice
      if (n.includes('premwadee') || n.includes('niwat') || n.includes('achara')) s += 20;
      if (n.includes('kanya') || n.includes('pattara')) s += 10;                           // decent OS voices
      if (n.includes('espeak')) s -= 20;                                                   // robotic
      if (v.localService) s += 1; // tie-break: prefer offline when otherwise equal
      return s;
    };
    thai.sort((a, b) => score(b) - score(a));
    this.voice = thai[0] || null;
    this.ready = voices.length > 0;
  },

  hasThaiVoice() {
    return !!this.voice;
  },

  // Preferred entry point: play an item. Built-in items (id in ThaiData) use the
  // bundled neural audio; anything else falls back to Web Speech.
  speakItem(item) {
    if (!item) return;
    if (window.ThaiData.ITEMS_BY_ID[item.id]) {
      this._playFile(item);
    } else {
      this.speak(window.ThaiData.speakableText(item));
    }
  },

  _playFile(item) {
    this.stop();
    const url = `assets/audio/${this.voiceChoice}/${item.id}.mp3`;
    const audio = new Audio(url);
    audio.playbackRate = this.rate;
    if ('preservesPitch' in audio) audio.preservesPitch = true; // slow ≠ deep

    // If the file can't load we still want *some* audio, but never fail silently —
    // a silent fallback makes a misconfigured setup look like bad TTS quality.
    const fallback = (why) => {
      this.bundledAudioFailed = true;
      console.warn(
        `[Thai Trainer] Bundled audio failed to play (${why}): ${url}\n` +
        'Falling back to the browser voice, which sounds much worse.\n' +
        'Most likely you opened index.html directly as a file:// path — browsers block ' +
        'loading media that way. Serve the folder over http instead:\n' +
        '    cd <this folder> && python3 -m http.server 8000   → http://localhost:8000'
      );
      this.speak(window.ThaiData.speakableText(item));
    };

    audio.onerror = () => fallback('load error');
    this._audio = audio;
    audio.play().catch((err) => fallback((err && err.name) || 'play rejected'));
  },

  // Raw-text speech via Web Speech API (custom words, fallback path).
  speak(text) {
    if (!text || !('speechSynthesis' in window)) return;
    this.stop();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'th-TH';
    if (this.voice) u.voice = this.voice;
    u.rate = this.rate;
    window.speechSynthesis.speak(u);
  },

  stop() {
    if (this._audio) { this._audio.pause(); this._audio = null; }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  },

  setRate(rate) {
    this.rate = rate;
    localStorage.setItem(RATE_KEY, String(rate));
  },

  setVoiceChoice(choice) {
    if (choice !== 'premwadee' && choice !== 'niwat') return;
    this.voiceChoice = choice;
    localStorage.setItem(VOICE_KEY, choice);
  }
};

window.TTS = TTS;
