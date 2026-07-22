// Text-to-speech via the browser's built-in Web Speech API. All synthesis is local —
// no text is sent to any server. We prefer a Thai (th-TH) voice when one is installed.

const TTS = {
  voice: null,
  ready: false,
  rate: 0.85,

  init() {
    if (!('speechSynthesis' in window)) {
      console.warn('speechSynthesis not supported in this browser.');
      return;
    }
    this._pickVoice();
    // Voices often load asynchronously; re-pick when they arrive.
    window.speechSynthesis.onvoiceschanged = () => this._pickVoice();
  },

  _pickVoice() {
    const voices = window.speechSynthesis.getVoices();
    // Best: an explicit Thai voice. Fallback: anything whose lang starts with "th".
    this.voice = voices.find(v => v.lang === 'th-TH')
              || voices.find(v => v.lang && v.lang.toLowerCase().startsWith('th'))
              || null;
    this.ready = voices.length > 0;
  },

  hasThaiVoice() {
    return !!this.voice;
  },

  speak(text) {
    if (!text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // stop anything already speaking
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'th-TH';
    if (this.voice) u.voice = this.voice;
    u.rate = this.rate;
    window.speechSynthesis.speak(u);
  },

  setRate(rate) {
    this.rate = rate;
  }
};

window.TTS = TTS;
