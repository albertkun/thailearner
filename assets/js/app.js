// Main app: view routing, rendering, and all interactive glue.
(function () {
  const D = window.ThaiData;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const app = $('#app');
  const state = { view: 'learn', learnCat: 'consonant' };

  // ---------- shared bits ----------

  // A small circular speak button. Takes the item so bundled audio can be used.
  function speakBtn(item, label) {
    const b = el('button', 'speak-btn', '🔊');
    b.title = 'Play sound' + (label ? ` (${label})` : '');
    b.setAttribute('aria-label', 'Play sound');
    b.addEventListener('click', (e) => { e.stopPropagation(); window.TTS.speakItem(item); });
    return b;
  }

  function statusPill(id) {
    const r = window.Store.getRecord(id);
    const pill = el('span', 'pill pill-' + r.status, r.status);
    return pill;
  }

  // Cycle new → learning → known on click.
  function cycleStatus(id) {
    const order = ['new', 'learning', 'known'];
    const cur = window.Store.getRecord(id).status;
    const next = order[(order.indexOf(cur) + 1) % order.length];
    window.Store.setStatus(id, next);
  }

  // ---------- nav ----------
  const VIEWS = ['learn', 'flash', 'write', 'words', 'progress'];
  function setView(view) {
    if (!VIEWS.includes(view)) view = 'learn';
    state.view = view;
    if (('#' + view) !== location.hash) history.replaceState(null, '', '#' + view);
    $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === view));
    render();
    app.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  // ---------- LEARN ----------
  function renderLearn() {
    const wrap = el('div', 'view');
    const head = el('div', 'view-head');
    head.appendChild(el('h2', null, 'Learn & browse'));
    head.appendChild(el('p', 'muted', 'Tap a card to play its sound and see details. Tap the status chip to mark your progress.'));
    wrap.appendChild(head);

    // category tabs (+ My Words)
    const tabs = el('div', 'subtabs');
    const cats = D.CATEGORIES.map(c => ({ key: c.key, label: c.label }));
    cats.push({ key: 'myword', label: 'My Words' });
    cats.forEach(c => {
      const b = el('button', 'subtab' + (state.learnCat === c.key ? ' active' : ''), esc(c.label));
      b.addEventListener('click', () => { state.learnCat = c.key; render(); });
      tabs.appendChild(b);
    });
    wrap.appendChild(tabs);

    let items;
    if (state.learnCat === 'myword') items = window.Store.customWords;
    else items = D.CATEGORIES.find(c => c.key === state.learnCat).items.map(it => D.ITEMS_BY_ID[it.id]);

    if (!items.length) {
      const empty = el('div', 'empty', state.learnCat === 'myword'
        ? 'No custom words yet. Add some in the <b>Words</b> tab.'
        : 'Nothing here yet.');
      wrap.appendChild(empty);
      return wrap;
    }

    const grid = el('div', 'card-grid');
    items.forEach(item => grid.appendChild(charCard(item)));
    wrap.appendChild(grid);
    return wrap;
  }

  function charCard(item) {
    const isWordy = item.category === 'word' || item.category === 'myword';
    const card = el('div', 'char-card' + (isWordy ? ' word-card' : ''));
    card.classList.add('status-' + window.Store.getRecord(item.id).status);

    const glyph = el('div', 'glyph', esc(item.char));
    card.appendChild(glyph);

    const info = el('div', 'card-info');
    if (isWordy) {
      info.appendChild(el('div', 'roman', esc(item.romanization || '')));
      info.appendChild(el('div', 'gloss', esc(item.meaning || '')));
    } else {
      info.appendChild(el('div', 'roman', esc(item.name || '')));
      const sub = item.category === 'consonant'
        ? `${esc(item.initial)}${item.final && item.final !== '-' ? ' · ends "' + esc(item.final) + '"' : ''} · ${esc(item.class)}`
        : esc(item.sound || item.note || '');
      info.appendChild(el('div', 'gloss', sub));
    }
    card.appendChild(info);

    const foot = el('div', 'card-foot');
    foot.appendChild(speakBtn(item, item.name || item.char));
    const pill = statusPill(item.id);
    pill.style.cursor = 'pointer';
    pill.title = 'Click to change progress';
    pill.addEventListener('click', (e) => {
      e.stopPropagation();
      cycleStatus(item.id);
      render();
    });
    foot.appendChild(pill);
    card.appendChild(foot);

    // Tapping the card plays the sound (nice on mobile).
    card.addEventListener('click', () => window.TTS.speakItem(item));
    return card;
  }

  // ---------- FLASHCARDS ----------
  const fc = { queue: [], idx: 0, flipped: false, mode: 'th-to-en', pool: 'all', session: { done: 0, correct: 0 } };

  function buildFlashPool() {
    let items = window.Store.allItems();
    if (fc.pool !== 'all') {
      items = items.filter(it => (it.category === fc.pool) || (fc.pool === 'word' && it.category === 'myword'));
    }
    // Prefer due items; if none, use everything.
    const due = items.filter(it => window.Store.isDue(it.id));
    const chosen = due.length ? due : items;
    // shuffle
    for (let i = chosen.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chosen[i], chosen[j]] = [chosen[j], chosen[i]];
    }
    return chosen.slice(0, 30);
  }

  function startFlash() {
    fc.queue = buildFlashPool();
    fc.idx = 0;
    fc.flipped = false;
    fc.session = { done: 0, correct: 0 };
    render();
  }

  function renderFlash() {
    const wrap = el('div', 'view');
    const head = el('div', 'view-head');
    head.appendChild(el('h2', null, 'Flashcards'));
    head.appendChild(el('p', 'muted', 'Spaced repetition — cards you find hard come back sooner. “Due” cards are picked first.'));
    wrap.appendChild(head);

    // controls
    const ctrl = el('div', 'flash-controls');
    const poolSel = el('select', 'select');
    [['all', 'All'], ['consonant', 'Consonants'], ['vowel', 'Vowels'], ['tone', 'Tone marks'], ['word', 'Words']]
      .forEach(([v, l]) => { const o = el('option', null, l); o.value = v; if (fc.pool === v) o.selected = true; poolSel.appendChild(o); });
    poolSel.addEventListener('change', () => { fc.pool = poolSel.value; startFlash(); });
    const poolWrap = el('label', 'field-inline', 'Deck: '); poolWrap.appendChild(poolSel);
    ctrl.appendChild(poolWrap);

    const modeSel = el('select', 'select');
    [['th-to-en', 'Thai → meaning'], ['en-to-th', 'Meaning → Thai']]
      .forEach(([v, l]) => { const o = el('option', null, l); o.value = v; if (fc.mode === v) o.selected = true; modeSel.appendChild(o); });
    modeSel.addEventListener('change', () => { fc.mode = modeSel.value; fc.flipped = false; render(); });
    const modeWrap = el('label', 'field-inline', 'Direction: '); modeWrap.appendChild(modeSel);
    ctrl.appendChild(modeWrap);

    const restart = el('button', 'btn btn-ghost', '↻ New session');
    restart.addEventListener('click', startFlash);
    ctrl.appendChild(restart);
    wrap.appendChild(ctrl);

    if (!fc.queue.length) {
      // Build the first session in place (no recursive re-render).
      fc.queue = buildFlashPool();
      fc.idx = 0;
      fc.flipped = false;
      fc.session = { done: 0, correct: 0 };
      if (!fc.queue.length) {
        wrap.appendChild(el('div', 'empty', 'This deck is empty — add some words first.'));
        return wrap;
      }
    }

    if (fc.idx >= fc.queue.length) {
      const done = el('div', 'done-panel');
      done.appendChild(el('div', 'done-emoji', '🎉'));
      done.appendChild(el('h3', null, 'Session complete!'));
      done.appendChild(el('p', 'muted', `You reviewed ${fc.session.done} cards — ${fc.session.correct} correct.`));
      const again = el('button', 'btn btn-primary', 'Study again');
      again.addEventListener('click', startFlash);
      done.appendChild(again);
      wrap.appendChild(done);
      return wrap;
    }

    const item = fc.queue[fc.idx];
    const meaning = item.category === 'word' || item.category === 'myword'
      ? item.meaning
      : (item.name + (item.meaning ? ` — “${item.meaning}”` : ''));

    const progress = el('div', 'flash-progress', `Card ${fc.idx + 1} of ${fc.queue.length}`);
    wrap.appendChild(progress);

    const card = el('div', 'flashcard' + (fc.flipped ? ' flipped' : ''));
    const front = el('div', 'flash-face flash-front');
    const back = el('div', 'flash-face flash-back');

    if (fc.mode === 'th-to-en') {
      front.appendChild(el('div', 'flash-glyph', esc(item.char)));
      back.appendChild(el('div', 'flash-answer', esc(meaning)));
      if (item.romanization) back.appendChild(el('div', 'flash-roman', esc(item.romanization)));
    } else {
      front.appendChild(el('div', 'flash-answer', esc(meaning)));
      back.appendChild(el('div', 'flash-glyph', esc(item.char)));
      if (item.romanization) back.appendChild(el('div', 'flash-roman', esc(item.romanization)));
    }
    const sb = speakBtn(item, item.name || item.char);
    sb.classList.add('flash-speak');
    back.appendChild(sb);

    card.appendChild(front);
    card.appendChild(back);
    card.addEventListener('click', () => {
      if (!fc.flipped) {
        fc.flipped = true;
        window.TTS.speakItem(item);
        render();
      }
    });
    wrap.appendChild(card);

    if (!fc.flipped) {
      const hint = el('div', 'muted center', 'Tap the card to reveal & hear it');
      wrap.appendChild(hint);
    } else {
      const grade = el('div', 'grade-row');
      const again = el('button', 'btn btn-hard', '✗ Again');
      const good = el('button', 'btn btn-good', '✓ Got it');
      again.addEventListener('click', () => answer(item, false));
      good.addEventListener('click', () => answer(item, true));
      grade.appendChild(again);
      grade.appendChild(good);
      wrap.appendChild(grade);
    }
    return wrap;
  }

  function answer(item, correct) {
    window.Store.review(item.id, correct);
    fc.session.done += 1;
    if (correct) fc.session.correct += 1;
    fc.idx += 1;
    fc.flipped = false;
    render();
  }

  // ---------- WRITE ----------
  // Start on a random consonant so practice doesn't always begin at ก ไก่.
  const writeState = { catKey: 'consonant', idx: Math.floor(Math.random() * ((D.CONSONANTS && D.CONSONANTS.length) || 1)) };
  function writeItems() {
    if (writeState.catKey === 'myword') return window.Store.customWords;
    return D.CATEGORIES.find(c => c.key === writeState.catKey).items.map(it => D.ITEMS_BY_ID[it.id]);
  }
  // Pick a random index in [0, len), avoiding the current one when possible.
  function randWriteIdx(len, cur) {
    if (len <= 1) return 0;
    let n;
    do { n = Math.floor(Math.random() * len); } while (n === cur);
    return n;
  }

  function renderWrite() {
    const wrap = el('div', 'view');
    const head = el('div', 'view-head');
    head.appendChild(el('h2', null, 'Writing practice'));
    head.appendChild(el('p', 'muted', 'Trace the faint guide with your mouse, finger, or stylus. Toggle the guide off to test yourself.'));
    wrap.appendChild(head);

    const items = writeItems();
    if (!items.length) {
      wrap.appendChild(el('div', 'empty', 'No items here. Add custom words in the Words tab, or pick another set.'));
      return wrap;
    }
    if (writeState.idx >= items.length) writeState.idx = 0;
    const item = items[writeState.idx];

    // selector row
    const row = el('div', 'write-controls');
    const catSel = el('select', 'select');
    [['consonant', 'Consonants'], ['vowel', 'Vowels'], ['tone', 'Tone marks'], ['word', 'Words'], ['myword', 'My Words']]
      .forEach(([v, l]) => { const o = el('option', null, l); o.value = v; if (writeState.catKey === v) o.selected = true; catSel.appendChild(o); });
    catSel.addEventListener('change', () => {
      writeState.catKey = catSel.value;
      writeState.idx = randWriteIdx(writeItems().length, -1); // random start in the new set
      render();
    });
    const csWrap = el('label', 'field-inline', 'Set: '); csWrap.appendChild(catSel);
    row.appendChild(csWrap);

    const label = el('div', 'write-label');
    label.appendChild(el('span', 'write-name', esc(item.name || item.romanization || '')));
    if (item.meaning) label.appendChild(el('span', 'muted', ' — ' + esc(item.meaning)));
    label.appendChild(speakBtn(item, item.name || item.char));
    row.appendChild(label);
    wrap.appendChild(row);

    const canvasWrap = el('div', 'canvas-wrap');
    const canvas = el('canvas', 'write-canvas');
    canvasWrap.appendChild(canvas);
    wrap.appendChild(canvasWrap);

    const tools = el('div', 'write-tools');
    const prev = el('button', 'btn btn-ghost', '‹ Prev');
    const rand = el('button', 'btn btn-ghost', '🎲 Random');
    const next = el('button', 'btn btn-ghost', 'Next ›');
    const clear = el('button', 'btn btn-ghost', 'Clear');
    const guideToggle = el('label', 'toggle');
    const gt = el('input'); gt.type = 'checkbox'; gt.checked = window.Writing.showGuide;
    guideToggle.appendChild(gt); guideToggle.appendChild(el('span', null, 'Show guide'));

    prev.addEventListener('click', () => { writeState.idx = (writeState.idx - 1 + items.length) % items.length; render(); });
    rand.addEventListener('click', () => { writeState.idx = randWriteIdx(items.length, writeState.idx); render(); });
    next.addEventListener('click', () => { writeState.idx = (writeState.idx + 1) % items.length; render(); });
    clear.addEventListener('click', () => window.Writing.clear());
    gt.addEventListener('change', () => window.Writing.toggleGuide(gt.checked));

    tools.appendChild(prev);
    tools.appendChild(rand);
    tools.appendChild(clear);
    tools.appendChild(guideToggle);
    tools.appendChild(next);
    wrap.appendChild(tools);

    const counter = el('div', 'muted center', `${writeState.idx + 1} / ${items.length}`);
    wrap.appendChild(counter);

    // Mount the canvas after it's in the DOM (needs layout size).
    setTimeout(() => {
      window.Writing.mount(canvas);
      // Strip the dotted placeholder so the guide shows the mark on its own where possible.
      window.Writing.setGuide(item.char);
    }, 0);

    return wrap;
  }

  // ---------- WORDS (manager) ----------
  function renderWords() {
    const wrap = el('div', 'view');
    const head = el('div', 'view-head');
    head.appendChild(el('h2', null, 'My words'));
    head.appendChild(el('p', 'muted', 'Add any Thai word you want to study. It joins your flashcards and writing practice automatically.'));
    wrap.appendChild(head);

    const form = el('form', 'word-form');
    const thai = el('input', 'input'); thai.placeholder = 'Thai (e.g. สวัสดี)'; thai.required = true; thai.setAttribute('lang', 'th');
    const roman = el('input', 'input'); roman.placeholder = 'Romanization (optional, e.g. sà-wàt-dii)';
    const mean = el('input', 'input'); mean.placeholder = 'Meaning (e.g. hello)'; mean.required = true;
    const add = el('button', 'btn btn-primary', 'Add word'); add.type = 'submit';
    form.appendChild(thai); form.appendChild(roman); form.appendChild(mean); form.appendChild(add);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!thai.value.trim() || !mean.value.trim()) return;
      window.Store.addWord(thai.value, roman.value, mean.value);
      render();
    });
    wrap.appendChild(form);

    const list = el('div', 'word-list');
    if (!window.Store.customWords.length) {
      list.appendChild(el('div', 'empty', 'No words yet — add your first above. 👆'));
    } else {
      window.Store.customWords.slice().reverse().forEach(w => {
        const row = el('div', 'word-row');
        row.appendChild(el('div', 'word-thai', esc(w.char)));
        const mid = el('div', 'word-mid');
        mid.appendChild(el('div', 'roman', esc(w.romanization || '')));
        mid.appendChild(el('div', 'gloss', esc(w.meaning || '')));
        row.appendChild(mid);
        const actions = el('div', 'word-actions');
        actions.appendChild(speakBtn(w, w.char));
        const del = el('button', 'icon-btn', '🗑');
        del.title = 'Delete word';
        del.addEventListener('click', () => { window.Store.removeWord(w.id); render(); });
        actions.appendChild(del);
        row.appendChild(actions);
        list.appendChild(row);
      });
    }
    wrap.appendChild(list);
    return wrap;
  }

  // ---------- PROGRESS ----------
  function renderProgress() {
    const wrap = el('div', 'view');
    const head = el('div', 'view-head');
    head.appendChild(el('h2', null, 'Progress'));
    head.appendChild(el('p', 'muted', 'Everything is stored locally in this browser. Use export to back it up — nothing is ever uploaded.'));
    wrap.appendChild(head);

    const groups = [
      { label: 'Consonants', items: D.CONSONANTS },
      { label: 'Vowels', items: D.VOWELS },
      { label: 'Tone marks', items: D.TONES },
      { label: 'Words', items: D.STARTER_WORDS.concat(window.Store.customWords) }
    ];
    const cards = el('div', 'stat-grid');
    groups.forEach(g => {
      const s = window.Store.statsFor(g.items);
      const c = el('div', 'stat-card');
      c.appendChild(el('div', 'stat-title', esc(g.label)));
      const known = s.known || 0, learning = s.learning || 0, total = s.total || 0;
      const pct = total ? Math.round((known / total) * 100) : 0;
      const bar = el('div', 'bar');
      const fill = el('div', 'bar-fill'); fill.style.width = pct + '%';
      bar.appendChild(fill);
      c.appendChild(bar);
      c.appendChild(el('div', 'stat-line', `<b>${known}</b> known · ${learning} learning · ${total - known - learning} new`));
      c.appendChild(el('div', 'stat-pct', pct + '%'));
      cards.appendChild(c);
    });
    wrap.appendChild(cards);

    // voice picker — the bundled neural voice used for all built-in content
    const voiceWrap = el('div', 'rate-row');
    voiceWrap.appendChild(el('span', null, 'Voice'));
    const voices = [['premwadee', '👩 Premwadee (female)'], ['niwat', '👨 Niwat (male)']];
    voices.forEach(([key, label]) => {
      const b = el('button', 'btn ' + (window.TTS.voiceChoice === key ? 'btn-primary' : 'btn-ghost'), label);
      b.addEventListener('click', () => {
        window.TTS.setVoiceChoice(key);
        window.TTS.speakItem(D.ITEMS_BY_ID['w-sawatdee']); // instant preview
        render();
      });
      voiceWrap.appendChild(b);
    });
    wrap.appendChild(voiceWrap);

    // speech status — bundled audio always works; Web Speech only matters for custom words
    const speech = el('div', 'note-box');
    let msg;
    if (window.TTS.bundledAudioFailed) {
      msg = '⚠️ <b>The bundled neural audio failed to load</b>, so playback fell back to your browser’s voice ' +
        '(which sounds much worse). This almost always means the page was opened as a <code>file://</code> path — ' +
        'browsers block loading media that way. Serve the folder over http instead:<br>' +
        '<code>python3 -m http.server 8000</code> → then open <code>http://localhost:8000</code>';
    } else {
      msg = '✅ High-quality Thai audio is bundled with the app for all built-in content — it works offline in every browser.';
    }
    if (!('speechSynthesis' in window)) {
      msg += '<br>⚠️ This browser has no speech synthesis, so <b>custom words you add</b> will have no audio.';
    } else if (!window.TTS.hasThaiVoice()) {
      msg += '<br>ℹ️ No Thai (th-TH) system voice detected, so <b>custom words you add</b> may use a default voice or stay silent. You can add one in your OS speech/language settings (macOS: <i>Kanya</i>, Windows: <i>Pattara</i>, or a Thai language pack).';
    } else {
      msg += `<br>✅ Custom words use your browser's Thai voice (<i>${esc(window.TTS.voice.name)}</i>).`;
    }
    speech.innerHTML = msg;
    wrap.appendChild(speech);

    // speech rate
    const rateWrap = el('div', 'rate-row');
    rateWrap.appendChild(el('span', null, 'Speech speed'));
    const rate = el('input'); rate.type = 'range'; rate.min = '0.5'; rate.max = '1'; rate.step = '0.05'; rate.value = String(window.TTS.rate);
    rate.addEventListener('input', () => window.TTS.setRate(parseFloat(rate.value)));
    rateWrap.appendChild(rate);
    const testBtn = el('button', 'btn btn-ghost', '🔊 Test');
    testBtn.addEventListener('click', () => window.TTS.speakItem(D.ITEMS_BY_ID['w-sawatdee']));
    rateWrap.appendChild(testBtn);
    wrap.appendChild(rateWrap);

    // data controls
    const data = el('div', 'data-controls');
    const exportBtn = el('button', 'btn btn-ghost', '⬇ Export backup');
    exportBtn.addEventListener('click', exportBackup);
    const importBtn = el('button', 'btn btn-ghost', '⬆ Import backup');
    const importInput = el('input'); importInput.type = 'file'; importInput.accept = 'application/json'; importInput.style.display = 'none';
    importInput.addEventListener('change', importBackup);
    importBtn.addEventListener('click', () => importInput.click());
    const resetBtn = el('button', 'btn btn-danger', '⟲ Reset all progress');
    resetBtn.addEventListener('click', () => {
      if (confirm('This erases all progress and custom words on this device. Continue?')) {
        window.Store.reset(); render();
      }
    });
    data.appendChild(exportBtn); data.appendChild(importBtn); data.appendChild(importInput); data.appendChild(resetBtn);
    wrap.appendChild(data);

    return wrap;
  }

  function exportBackup() {
    const blob = new Blob([window.Store.exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = el('a');
    a.href = url;
    a.download = `thai-trainer-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  function importBackup(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        window.Store.importData(reader.result);
        alert('Backup imported successfully.');
        render();
      } catch (err) {
        alert('Could not import: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  // ---------- render dispatch ----------
  function render() {
    app.innerHTML = '';
    let node;
    switch (state.view) {
      case 'learn': node = renderLearn(); break;
      case 'flash': node = renderFlash(); break;
      case 'write': node = renderWrite(); break;
      case 'words': node = renderWords(); break;
      case 'progress': node = renderProgress(); break;
      default: node = renderLearn();
    }
    app.appendChild(node);
  }

  // ---------- theme ----------
  function initTheme() {
    const saved = localStorage.getItem('thai-trainer:theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    const btn = $('#theme-toggle');
    btn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme') || 'light';
      const next = cur === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('thai-trainer:theme', next);
      if (state.view === 'write') render(); // repaint canvas guide colour
    });
  }

  // ---------- boot ----------
  function init() {
    window.TTS.init();
    initTheme();
    $$('.nav-btn').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
    window.addEventListener('hashchange', () => setView(location.hash.slice(1)));
    setView(location.hash.slice(1) || 'learn');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
