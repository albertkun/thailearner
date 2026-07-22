// All persistence lives here. Everything is in localStorage — nothing leaves the device.
// Two keys: progress records (per item) and the user's custom words.

const STORAGE_KEY = 'thai-trainer:v1';
const CUSTOM_WORDS_KEY = 'thai-trainer:mywords:v1';

// A tiny Leitner-style spaced-repetition schedule. `box` 0..5 → interval in days.
const SRS_INTERVALS = [0, 1, 2, 4, 8, 16, 32];

function loadRaw(key, fallback) {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : fallback;
  } catch (e) {
    console.warn('Failed to read storage', key, e);
    return fallback;
  }
}

function saveRaw(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Failed to write storage', key, e);
  }
}

const Store = {
  // progress: { [itemId]: { status, box, reviews, correct, lastReviewed, due } }
  progress: loadRaw(STORAGE_KEY, {}),
  customWords: loadRaw(CUSTOM_WORDS_KEY, []),

  _persist() {
    saveRaw(STORAGE_KEY, this.progress);
    saveRaw(CUSTOM_WORDS_KEY, this.customWords);
  },

  getRecord(id) {
    return this.progress[id] || { status: 'new', box: 0, reviews: 0, correct: 0, lastReviewed: null, due: null };
  },

  setStatus(id, status) {
    const r = this.getRecord(id);
    r.status = status;
    this.progress[id] = r;
    this._persist();
  },

  // Record a flashcard answer. correct=true bumps the SRS box, false resets it.
  review(id, correct) {
    const r = this.getRecord(id);
    r.reviews += 1;
    if (correct) {
      r.correct += 1;
      r.box = Math.min(r.box + 1, SRS_INTERVALS.length - 1);
      // Move toward "known" once it survives a few boxes.
      r.status = r.box >= 4 ? 'known' : 'learning';
    } else {
      r.box = Math.max(1, Math.floor(r.box / 2));
      r.status = 'learning';
    }
    const now = Date.now();
    r.lastReviewed = now;
    r.due = now + SRS_INTERVALS[r.box] * 86400000;
    this.progress[id] = r;
    this._persist();
    return r;
  },

  isDue(id) {
    const r = this.progress[id];
    if (!r || r.status === 'new') return true;         // never studied → always available
    if (r.status === 'known' && r.due && r.due > Date.now()) return false;
    return !r.due || r.due <= Date.now();
  },

  // ---- custom words ----
  addWord(char, romanization, meaning) {
    const id = 'my-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
    const word = { id, category: 'myword', char: char.trim(), romanization: romanization.trim(), meaning: meaning.trim() };
    this.customWords.push(word);
    this._persist();
    return word;
  },

  removeWord(id) {
    this.customWords = this.customWords.filter(w => w.id !== id);
    delete this.progress[id];
    this._persist();
  },

  allItems() {
    // Built-in items + custom words, as a flat list.
    const items = Object.values(window.ThaiData.ITEMS_BY_ID).slice();
    return items.concat(this.customWords);
  },

  getItem(id) {
    if (window.ThaiData.ITEMS_BY_ID[id]) return window.ThaiData.ITEMS_BY_ID[id];
    return this.customWords.find(w => w.id === id) || null;
  },

  // ---- stats ----
  statsFor(items) {
    const out = { total: items.length, new: 0, learning: 0, known: 0 };
    items.forEach(it => {
      const s = (this.progress[it.id] && this.progress[it.id].status) || 'new';
      out[s] = (out[s] || 0) + 1;
    });
    return out;
  },

  // ---- export / import (backup without any cloud) ----
  exportData() {
    return JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      progress: this.progress,
      customWords: this.customWords
    }, null, 2);
  },

  importData(jsonString) {
    const data = JSON.parse(jsonString);
    if (typeof data !== 'object' || !data.progress) throw new Error('Not a valid Thai Trainer backup file.');
    this.progress = data.progress || {};
    this.customWords = Array.isArray(data.customWords) ? data.customWords : [];
    this._persist();
  },

  reset() {
    this.progress = {};
    this.customWords = [];
    this._persist();
  }
};

window.Store = Store;
