// Main app: view routing, rendering, and all interactive glue. UI is in Thai —
// this trainer is for Thai speakers learning Japanese.
(function () {
  const D = window.JPData;
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
  const state = { view: 'learn', learnCat: 'hiragana' };

  // Thai labels for the SRS status (class stays the English key for CSS).
  const STATUS_TH = { new: 'ใหม่', learning: 'กำลังเรียน', known: 'จำได้' };
  // Subsection labels within a kana set (basic / voiced / contracted).
  const SUB_LABELS = {
    basic:   'พื้นฐาน (46 ตัว)',
    dakuten: 'เสียงขุ่น ゛ ゜ (dakuten / handakuten)',
    yoon:    'ควบกล้ำ ゃ ゅ ょ (yōon)'
  };
  // Is this a vocabulary item (built-in word or the user's own)?
  const isWordy = (item) => item.category === 'word' || item.category === 'myword';
  // The short label to say/show for an item: romaji for kana, romaji for words.
  const primaryLabel = (item) => item.romaji || item.romanization || item.char;

  // ---------- shared bits ----------

  // A small circular speak button. Takes the item so bundled audio can be used.
  function speakBtn(item, label) {
    const b = el('button', 'speak-btn', '🔊');
    b.title = 'เล่นเสียง' + (label ? ` (${label})` : '');
    b.setAttribute('aria-label', 'เล่นเสียง');
    b.addEventListener('click', (e) => { e.stopPropagation(); window.TTS.speakItem(item); });
    return b;
  }

  function statusPill(id) {
    const r = window.Store.getRecord(id);
    return el('span', 'pill pill-' + r.status, esc(STATUS_TH[r.status] || r.status));
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
    head.appendChild(el('h2', null, 'เรียนรู้และเลือกดู'));
    head.appendChild(el('p', 'muted', 'แตะการ์ดเพื่อฟังเสียงและดูรายละเอียด แตะป้ายสถานะเพื่อบันทึกความคืบหน้าของคุณ'));
    wrap.appendChild(head);

    // category tabs (+ My Words)
    const tabs = el('div', 'subtabs');
    const cats = D.CATEGORIES.map(c => ({ key: c.key, label: c.label }));
    cats.push({ key: 'myword', label: 'คำของฉัน' });
    cats.forEach(c => {
      const b = el('button', 'subtab' + (state.learnCat === c.key ? ' active' : ''), esc(c.label));
      b.addEventListener('click', () => { state.learnCat = c.key; render(); });
      tabs.appendChild(b);
    });
    wrap.appendChild(tabs);

    // Kana tabs get labeled subsections (basic / dakuten / yōon); words are a flat grid.
    if (state.learnCat === 'hiragana' || state.learnCat === 'katakana') {
      const kana = D.CATEGORIES.find(c => c.key === state.learnCat).items.map(it => D.ITEMS_BY_ID[it.id]);
      ['basic', 'dakuten', 'yoon'].forEach(sub => {
        const subItems = kana.filter(it => (it.sub || 'basic') === sub);
        if (!subItems.length) return;
        wrap.appendChild(el('h3', 'learn-subhead', esc(SUB_LABELS[sub])));
        const grid = el('div', 'card-grid');
        subItems.forEach(item => grid.appendChild(charCard(item)));
        wrap.appendChild(grid);
      });
      return wrap;
    }

    const items = state.learnCat === 'myword'
      ? window.Store.customWords
      : D.CATEGORIES.find(c => c.key === state.learnCat).items.map(it => D.ITEMS_BY_ID[it.id]);

    if (!items.length) {
      const empty = el('div', 'empty', state.learnCat === 'myword'
        ? 'ยังไม่มีคำของคุณ เพิ่มได้ในแท็บ <b>คำศัพท์</b>'
        : 'ยังไม่มีอะไรที่นี่');
      wrap.appendChild(empty);
      return wrap;
    }

    const grid = el('div', 'card-grid');
    items.forEach(item => grid.appendChild(charCard(item)));
    wrap.appendChild(grid);
    return wrap;
  }

  function charCard(item) {
    const wordy = isWordy(item);
    const card = el('div', 'char-card' + (wordy ? ' word-card' : ''));
    card.classList.add('status-' + window.Store.getRecord(item.id).status);

    const glyph = el('div', 'glyph jp', esc(item.char));
    card.appendChild(glyph);

    const info = el('div', 'card-info');
    if (wordy) {
      info.appendChild(el('div', 'roman', esc(item.romanization || '')));
      info.appendChild(el('div', 'gloss', esc(item.meaning || '')));
    } else {
      info.appendChild(el('div', 'roman', esc(item.romaji || '')));
      info.appendChild(el('div', 'gloss', esc(item.read || '')));
    }
    card.appendChild(info);

    const foot = el('div', 'card-foot');
    foot.appendChild(speakBtn(item, primaryLabel(item)));
    const pill = statusPill(item.id);
    pill.style.cursor = 'pointer';
    pill.title = 'คลิกเพื่อเปลี่ยนสถานะ';
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
  const fc = { queue: [], idx: 0, flipped: false, mode: 'jp-to-th', pool: 'all', session: { done: 0, correct: 0 } };

  function buildFlashPool() {
    let items = window.Store.allItems();
    if (fc.pool !== 'all') {
      const [cat, sub] = fc.pool.split(':');
      items = items.filter(it => {
        if (cat === 'word') return it.category === 'word' || it.category === 'myword';
        if (it.category !== cat) return false;
        return !sub || (it.sub || 'basic') === sub;
      });
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

  // The "answer" side of a card, and its secondary line.
  function answerText(item) { return isWordy(item) ? (item.meaning || '') : (item.romaji || ''); }
  function secondaryText(item) { return isWordy(item) ? (item.romanization || '') : (item.read || ''); }

  function renderFlash() {
    const wrap = el('div', 'view');
    const head = el('div', 'view-head');
    head.appendChild(el('h2', null, 'แฟลชการ์ด'));
    head.appendChild(el('p', 'muted', 'ระบบทบทวนแบบเว้นระยะ — การ์ดที่คุณรู้สึกว่ายากจะกลับมาเร็วขึ้น การ์ดที่ “ถึงกำหนด” จะถูกเลือกก่อน'));
    wrap.appendChild(head);

    // controls
    const ctrl = el('div', 'flash-controls');
    const poolSel = el('select', 'select');
    [['all', 'ทั้งหมด'],
     ['hiragana', 'ฮิรางานะ (ทั้งหมด)'],
     ['hiragana:dakuten', 'ฮิรางานะ ゛゜ เสียงขุ่น'],
     ['hiragana:yoon', 'ฮิรางานะ ゃゅょ ควบกล้ำ'],
     ['katakana', 'คาตาคานะ (ทั้งหมด)'],
     ['katakana:dakuten', 'คาตาคานะ ゛゜ เสียงขุ่น'],
     ['katakana:yoon', 'คาตาคานะ ゃゅょ ควบกล้ำ'],
     ['word', 'คำศัพท์']]
      .forEach(([v, l]) => { const o = el('option', null, l); o.value = v; if (fc.pool === v) o.selected = true; poolSel.appendChild(o); });
    poolSel.addEventListener('change', () => { fc.pool = poolSel.value; startFlash(); });
    const poolWrap = el('label', 'field-inline', 'ชุด: '); poolWrap.appendChild(poolSel);
    ctrl.appendChild(poolWrap);

    const modeSel = el('select', 'select');
    [['jp-to-th', 'ญี่ปุ่น → ความหมาย'], ['th-to-jp', 'ความหมาย → ญี่ปุ่น']]
      .forEach(([v, l]) => { const o = el('option', null, l); o.value = v; if (fc.mode === v) o.selected = true; modeSel.appendChild(o); });
    modeSel.addEventListener('change', () => { fc.mode = modeSel.value; fc.flipped = false; render(); });
    const modeWrap = el('label', 'field-inline', 'ทิศทาง: '); modeWrap.appendChild(modeSel);
    ctrl.appendChild(modeWrap);

    const restart = el('button', 'btn btn-ghost', '↻ รอบใหม่');
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
        wrap.appendChild(el('div', 'empty', 'ชุดนี้ว่างเปล่า — เพิ่มคำก่อน'));
        return wrap;
      }
    }

    if (fc.idx >= fc.queue.length) {
      const done = el('div', 'done-panel');
      done.appendChild(el('div', 'done-emoji', '🎉'));
      done.appendChild(el('h3', null, 'จบรอบแล้ว!'));
      done.appendChild(el('p', 'muted', `ทบทวนไป ${fc.session.done} การ์ด — ถูก ${fc.session.correct} ใบ`));
      const again = el('button', 'btn btn-primary', 'เรียนอีกครั้ง');
      again.addEventListener('click', startFlash);
      done.appendChild(again);
      wrap.appendChild(done);
      return wrap;
    }

    const item = fc.queue[fc.idx];
    const answer = answerText(item);
    const secondary = secondaryText(item);

    const progress = el('div', 'flash-progress', `การ์ดที่ ${fc.idx + 1} จาก ${fc.queue.length}`);
    wrap.appendChild(progress);

    const card = el('div', 'flashcard' + (fc.flipped ? ' flipped' : ''));
    const front = el('div', 'flash-face flash-front');
    const back = el('div', 'flash-face flash-back');

    if (fc.mode === 'jp-to-th') {
      front.appendChild(el('div', 'flash-glyph jp', esc(item.char)));
      back.appendChild(el('div', 'flash-answer', esc(answer)));
      if (secondary) back.appendChild(el('div', 'flash-roman', esc(secondary)));
    } else {
      front.appendChild(el('div', 'flash-answer', esc(answer)));
      back.appendChild(el('div', 'flash-glyph jp', esc(item.char)));
      if (secondary) back.appendChild(el('div', 'flash-roman', esc(secondary)));
    }
    const sb = speakBtn(item, primaryLabel(item));
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
      const hint = el('div', 'muted center', 'แตะการ์ดเพื่อเปิดเฉลยและฟังเสียง');
      wrap.appendChild(hint);
    } else {
      const grade = el('div', 'grade-row');
      const again = el('button', 'btn btn-hard', '✗ อีกครั้ง');
      const good = el('button', 'btn btn-good', '✓ จำได้');
      again.addEventListener('click', () => answer_(item, false));
      good.addEventListener('click', () => answer_(item, true));
      grade.appendChild(again);
      grade.appendChild(good);
      wrap.appendChild(grade);
    }
    return wrap;
  }

  function answer_(item, correct) {
    window.Store.review(item.id, correct);
    fc.session.done += 1;
    if (correct) fc.session.correct += 1;
    fc.idx += 1;
    fc.flipped = false;
    render();
  }

  // ---------- WRITE ----------
  const AUTOSPEAK_KEY = 'jp-trainer:write-autospeak';
  const FONT_KEY = 'jp-trainer:jpfont';
  // Japanese letterform styles — changes the guide you trace (and Japanese everywhere else).
  const JP_FONTS = [
    { key: 'gothic', label: 'โกธิก (ゴシック)', hint: 'Noto Sans JP — ตัวพิมพ์เรียบ ใช้ทั่วไป (ค่าเริ่มต้น)' },
    { key: 'mincho', label: 'มินโจ (明朝)',      hint: 'Noto Serif JP — เส้นหนา-บางแบบพู่กัน เห็นรูปทรงชัดเจน' },
    { key: 'hand',   label: 'ลายมือ (手書き)',   hint: 'Klee One — ใกล้เคียงการเขียนด้วยดินสอมากที่สุด' }
  ];

  function currentJpFont() {
    const saved = localStorage.getItem(FONT_KEY);
    return JP_FONTS.some(f => f.key === saved) ? saved : 'gothic';
  }

  function applyJpFont(key) {
    localStorage.setItem(FONT_KEY, key);
    document.documentElement.setAttribute('data-jpfont', key);
    // The webfont may still be downloading; repaint the canvas guide once it lands.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { if (state.view === 'write') window.Writing.redraw(); });
    }
  }

  const writeState = {
    catKey: 'hiragana',
    idx: Math.floor(Math.random() * ((D.HIRAGANA && D.HIRAGANA.length) || 1)),
    autoSpeak: localStorage.getItem(AUTOSPEAK_KEY) !== '0'
  };
  function writeItems() {
    if (writeState.catKey === 'myword') return window.Store.customWords;
    const [cat, sub] = writeState.catKey.split(':');
    const base = D.CATEGORIES.find(c => c.key === cat).items.map(it => D.ITEMS_BY_ID[it.id]);
    return sub ? base.filter(it => (it.sub || 'basic') === sub) : base;
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
    head.appendChild(el('h2', null, 'ฝึกเขียน'));
    head.appendChild(el('p', 'muted', 'ลากตามเส้นนำจางๆ ด้วยเมาส์ นิ้ว หรือปากกา จะได้ยินเสียงตัวอักษรขณะเขียน ปิดเส้นนำเพื่อทดสอบตัวเอง'));
    wrap.appendChild(head);

    const items = writeItems();
    if (!items.length) {
      wrap.appendChild(el('div', 'empty', 'ไม่มีรายการที่นี่ เพิ่มคำของคุณในแท็บ คำศัพท์ หรือเลือกชุดอื่น'));
      return wrap;
    }
    if (writeState.idx >= items.length) writeState.idx = 0;
    const item = items[writeState.idx];

    // selector row
    const row = el('div', 'write-controls');
    const catSel = el('select', 'select');
    [['hiragana', 'ฮิรางานะ (ทั้งหมด)'],
     ['hiragana:basic', 'ฮิรางานะ — พื้นฐาน'],
     ['hiragana:dakuten', 'ฮิรางานะ ゛゜ เสียงขุ่น'],
     ['hiragana:yoon', 'ฮิรางานะ ゃゅょ ควบกล้ำ'],
     ['katakana', 'คาตาคานะ (ทั้งหมด)'],
     ['katakana:basic', 'คาตาคานะ — พื้นฐาน'],
     ['katakana:dakuten', 'คาตาคานะ ゛゜ เสียงขุ่น'],
     ['katakana:yoon', 'คาตาคานะ ゃゅょ ควบกล้ำ'],
     ['word', 'คำศัพท์'],
     ['myword', 'คำของฉัน']]
      .forEach(([v, l]) => { const o = el('option', null, l); o.value = v; if (writeState.catKey === v) o.selected = true; catSel.appendChild(o); });
    catSel.addEventListener('change', () => {
      writeState.catKey = catSel.value;
      writeState.idx = randWriteIdx(writeItems().length, -1); // random start in the new set
      render();
    });
    const csWrap = el('label', 'field-inline', 'ชุด: '); csWrap.appendChild(catSel);
    row.appendChild(csWrap);

    // Letterform style — changes the guide you trace (and Japanese everywhere else).
    const fontSel = el('select', 'select');
    JP_FONTS.forEach(f => {
      const o = el('option', null, esc(f.label));
      o.value = f.key;
      o.title = f.hint;
      if (currentJpFont() === f.key) o.selected = true;
      fontSel.appendChild(o);
    });
    fontSel.addEventListener('change', () => {
      applyJpFont(fontSel.value);
      window.Writing.clear();  // repaint in the new face; fonts.ready above catches the late load
      $('.font-hint', wrap).textContent = JP_FONTS.find(f => f.key === fontSel.value).hint;
    });
    const fsWrap = el('label', 'field-inline', 'รูปแบบ: '); fsWrap.appendChild(fontSel);
    row.appendChild(fsWrap);

    const label = el('div', 'write-label');
    label.appendChild(el('span', 'write-name', esc(primaryLabel(item))));
    const sub = item.meaning || item.read || '';
    if (sub) label.appendChild(el('span', 'muted', ' — ' + esc(sub)));
    label.appendChild(speakBtn(item, primaryLabel(item)));
    row.appendChild(label);
    wrap.appendChild(row);

    const canvasWrap = el('div', 'canvas-wrap');
    const canvas = el('canvas', 'write-canvas');
    canvasWrap.appendChild(canvas);
    wrap.appendChild(canvasWrap);

    const tools = el('div', 'write-tools');
    const prev = el('button', 'btn btn-ghost', '‹ ก่อนหน้า');
    const rand = el('button', 'btn btn-ghost', '🎲 สุ่ม');
    const next = el('button', 'btn btn-ghost', 'ถัดไป ›');
    const clear = el('button', 'btn btn-ghost', 'ล้าง');
    const guideToggle = el('label', 'toggle');
    const gt = el('input'); gt.type = 'checkbox'; gt.checked = window.Writing.showGuide;
    guideToggle.appendChild(gt); guideToggle.appendChild(el('span', null, 'แสดงเส้นนำ'));

    const speakToggle = el('label', 'toggle');
    const st = el('input'); st.type = 'checkbox'; st.checked = writeState.autoSpeak;
    speakToggle.appendChild(st); speakToggle.appendChild(el('span', null, '🔊 ออกเสียงขณะเขียน'));

    prev.addEventListener('click', () => { writeState.idx = (writeState.idx - 1 + items.length) % items.length; render(); });
    rand.addEventListener('click', () => { writeState.idx = randWriteIdx(items.length, writeState.idx); render(); });
    next.addEventListener('click', () => { writeState.idx = (writeState.idx + 1) % items.length; render(); });
    clear.addEventListener('click', () => {
      window.Writing.clear();
      if (writeState.autoSpeak) window.TTS.speakItem(item); // fresh attempt → hear it again
    });
    gt.addEventListener('change', () => window.Writing.toggleGuide(gt.checked));
    st.addEventListener('change', () => {
      writeState.autoSpeak = st.checked;
      localStorage.setItem(AUTOSPEAK_KEY, st.checked ? '1' : '0');
      if (st.checked) window.TTS.speakItem(item);
    });

    tools.appendChild(prev);
    tools.appendChild(rand);
    tools.appendChild(clear);
    tools.appendChild(guideToggle);
    tools.appendChild(speakToggle);
    tools.appendChild(next);
    wrap.appendChild(tools);

    const counter = el('div', 'muted center', `${writeState.idx + 1} / ${items.length}`);
    wrap.appendChild(counter);

    const hint = el('div', 'muted center font-hint', esc(JP_FONTS.find(f => f.key === currentJpFont()).hint));
    wrap.appendChild(hint);

    wrap.appendChild(tipPanel(item));

    // Mount the canvas after it's in the DOM (needs layout size).
    setTimeout(() => {
      window.Writing.mount(canvas);
      window.Writing.setGuide(item.char);
      // Speak on the first stroke of each attempt only.
      window.Writing.onStrokeStart = (isFirst) => {
        if (isFirst && writeState.autoSpeak) window.TTS.speakItem(item);
      };
      // ...and once when the letter appears. Re-renders that keep the same item stay quiet.
      if (writeState.autoSpeak && writeState.spokenId !== item.id) {
        writeState.spokenId = item.id;
        window.TTS.speakItem(item);
      }
    }, 0);

    return wrap;
  }

  // Memory-hook panel under the canvas.
  function tipPanel(item) {
    const panel = el('section', 'tip-panel');
    const head = el('div', 'tip-head');
    head.appendChild(el('span', 'tip-title', '💡 เคล็ดลับช่วยจำ'));
    panel.appendChild(head);

    const builtIn = window.Mnemonics.get(item.id);
    if (builtIn) panel.appendChild(el('p', 'tip-text', esc(builtIn)));

    const cat = item.category || 'word';
    panel.appendChild(el('p', 'tip-stroke', '✍️ ' + esc(window.Mnemonics.strokeTip(cat))));

    if (!isWordy(item) && item.read) {
      panel.appendChild(el('p', 'tip-stroke', `🔊 คำอ่านโดยประมาณ: <b>${esc(item.read)}</b>` +
        (item.note ? ` — ${esc(item.note)}` : '')));
    }

    // The user's own hook. Saved on blur so typing never triggers a re-render.
    const mine = el('div', 'tip-mine');
    const label = el('label', 'tip-label', 'โน้ตของคุณเอง');
    const ta = el('textarea', 'tip-input');
    ta.placeholder = 'อะไรก็ได้ที่ช่วยให้คุณจำได้…';
    ta.rows = 2;
    ta.value = window.Store.getTip(item.id);
    const status = el('span', 'tip-saved', '');
    ta.addEventListener('blur', () => {
      const before = window.Store.getTip(item.id);
      if (ta.value.trim() === before) return;
      window.Store.setTip(item.id, ta.value);
      status.textContent = 'บันทึกแล้ว';
      setTimeout(() => { status.textContent = ''; }, 1500);
    });
    label.appendChild(status);
    mine.appendChild(label);
    mine.appendChild(ta);
    panel.appendChild(mine);
    return panel;
  }

  // ---------- WORDS (manager) ----------
  function renderWords() {
    const wrap = el('div', 'view');
    const head = el('div', 'view-head');
    head.appendChild(el('h2', null, 'คำศัพท์ของฉัน'));
    head.appendChild(el('p', 'muted', 'เพิ่มคำภาษาญี่ปุ่นที่อยากฝึก จะถูกเพิ่มเข้าแฟลชการ์ดและแบบฝึกเขียนโดยอัตโนมัติ'));
    wrap.appendChild(head);

    const form = el('form', 'word-form');
    const jp = el('input', 'input'); jp.placeholder = 'ภาษาญี่ปุ่น (เช่น ねこ)'; jp.required = true; jp.setAttribute('lang', 'ja');
    const roman = el('input', 'input'); roman.placeholder = 'โรมาจิ (ไม่บังคับ เช่น neko)';
    const mean = el('input', 'input'); mean.placeholder = 'ความหมาย (เช่น แมว)'; mean.required = true;
    const add = el('button', 'btn btn-primary', 'เพิ่มคำ'); add.type = 'submit';
    form.appendChild(jp); form.appendChild(roman); form.appendChild(mean); form.appendChild(add);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!jp.value.trim() || !mean.value.trim()) return;
      window.Store.addWord(jp.value, roman.value, mean.value);
      render();
    });
    wrap.appendChild(form);

    const list = el('div', 'word-list');
    if (!window.Store.customWords.length) {
      list.appendChild(el('div', 'empty', 'ยังไม่มีคำศัพท์ — เพิ่มคำแรกด้านบนเลย 👆'));
    } else {
      window.Store.customWords.slice().reverse().forEach(w => {
        const row = el('div', 'word-row');
        row.appendChild(el('div', 'word-jp jp', esc(w.char)));
        const mid = el('div', 'word-mid');
        mid.appendChild(el('div', 'roman', esc(w.romanization || '')));
        mid.appendChild(el('div', 'gloss', esc(w.meaning || '')));
        row.appendChild(mid);
        const actions = el('div', 'word-actions');
        actions.appendChild(speakBtn(w, w.char));
        const del = el('button', 'icon-btn', '🗑');
        del.title = 'ลบคำนี้';
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
    head.appendChild(el('h2', null, 'ความคืบหน้า'));
    head.appendChild(el('p', 'muted', 'ข้อมูลทั้งหมดถูกเก็บไว้ในเบราว์เซอร์นี้ ใช้ปุ่มสำรองข้อมูลเพื่อแบ็กอัป ไม่มีการอัปโหลดใดๆ'));
    wrap.appendChild(head);

    const groups = [
      { label: 'ฮิรางานะ', items: D.HIRAGANA },
      { label: 'คาตาคานะ', items: D.KATAKANA },
      { label: 'คำศัพท์', items: D.STARTER_WORDS.concat(window.Store.customWords) }
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
      c.appendChild(el('div', 'stat-line', `<b>${known}</b> จำได้ · ${learning} กำลังเรียน · ${total - known - learning} ใหม่`));
      c.appendChild(el('div', 'stat-pct', pct + '%'));
      cards.appendChild(c);
    });
    wrap.appendChild(cards);

    // voice picker — the bundled neural voice used for all built-in content
    const voiceWrap = el('div', 'rate-row');
    voiceWrap.appendChild(el('span', null, 'เสียงพากย์'));
    const voices = [['nanami', '👩 Nanami (หญิง)'], ['keita', '👨 Keita (ชาย)']];
    voices.forEach(([key, label]) => {
      const b = el('button', 'btn ' + (window.TTS.voiceChoice === key ? 'btn-primary' : 'btn-ghost'), label);
      b.addEventListener('click', () => {
        window.TTS.setVoiceChoice(key);
        window.TTS.speakItem(D.ITEMS_BY_ID['w-konnichiwa']); // instant preview
        render();
      });
      voiceWrap.appendChild(b);
    });
    wrap.appendChild(voiceWrap);

    // speech status — bundled audio always works; Web Speech only matters for custom words
    const speech = el('div', 'note-box');
    let msg;
    if (window.TTS.bundledAudioFailed) {
      msg = '⚠️ <b>โหลดเสียงพากย์ที่มาพร้อมแอปไม่สำเร็จ</b> จึงใช้เสียงของเบราว์เซอร์แทน (คุณภาพต่ำกว่ามาก) ' +
        'ดูสาเหตุที่แน่ชัดได้ใน console ของเบราว์เซอร์ สาเหตุที่พบบ่อย: เปิดหน้าเว็บแบบ ' +
        '<code>file://</code> (เบราว์เซอร์บล็อกสื่อจาก path แบบนี้ — ให้เปิดผ่าน http แทน), ไฟล์ใน ' +
        '<code>assets/audio/</code> หายไปตอน deploy, หรือเบราว์เซอร์นี้ถอดรหัส mp3 ไม่ได้';
    } else {
      msg = '✅ มีเสียงพากย์ญี่ปุ่นคุณภาพสูงมาพร้อมแอปสำหรับเนื้อหาหลักทั้งหมด ใช้งานออฟไลน์ได้ทุกเบราว์เซอร์';
    }
    if (!('speechSynthesis' in window)) {
      msg += '<br>⚠️ เบราว์เซอร์นี้ไม่มีระบบสังเคราะห์เสียง <b>คำที่คุณเพิ่มเอง</b> จะไม่มีเสียง';
    } else if (!window.TTS.hasJapaneseVoice()) {
      msg += '<br>ℹ️ ไม่พบเสียงภาษาญี่ปุ่น (ja-JP) ในระบบ <b>คำที่คุณเพิ่มเอง</b> อาจใช้เสียงเริ่มต้นหรือไม่มีเสียง ' +
        '(macOS มีเสียง <i>Kyoko</i>, Windows ให้ติดตั้งชุดภาษาญี่ปุ่นเพื่อได้เสียง <i>Haruka/Ayumi</i>)';
    } else {
      msg += `<br>✅ คำที่คุณเพิ่มเองจะใช้เสียงภาษาญี่ปุ่นของเบราว์เซอร์ (<i>${esc(window.TTS.voice.name)}</i>)`;
    }
    speech.innerHTML = msg;
    wrap.appendChild(speech);

    // speech rate
    const rateWrap = el('div', 'rate-row');
    rateWrap.appendChild(el('span', null, 'ความเร็วเสียง'));
    const rate = el('input'); rate.type = 'range'; rate.min = '0.5'; rate.max = '1'; rate.step = '0.05'; rate.value = String(window.TTS.rate);
    rate.addEventListener('input', () => window.TTS.setRate(parseFloat(rate.value)));
    rateWrap.appendChild(rate);
    const testBtn = el('button', 'btn btn-ghost', '🔊 ทดสอบ');
    testBtn.addEventListener('click', () => window.TTS.speakItem(D.ITEMS_BY_ID['w-konnichiwa']));
    rateWrap.appendChild(testBtn);
    wrap.appendChild(rateWrap);

    // data controls
    const data = el('div', 'data-controls');
    const exportBtn = el('button', 'btn btn-ghost', '⬇ สำรองข้อมูล');
    exportBtn.addEventListener('click', exportBackup);
    const importBtn = el('button', 'btn btn-ghost', '⬆ นำเข้าข้อมูล');
    const importInput = el('input'); importInput.type = 'file'; importInput.accept = 'application/json'; importInput.style.display = 'none';
    importInput.addEventListener('change', importBackup);
    importBtn.addEventListener('click', () => importInput.click());
    const resetBtn = el('button', 'btn btn-danger', '⟲ ล้างความคืบหน้าทั้งหมด');
    resetBtn.addEventListener('click', () => {
      if (confirm('การทำเช่นนี้จะลบความคืบหน้าและคำศัพท์ทั้งหมดในเครื่องนี้ ต้องการดำเนินการต่อหรือไม่?')) {
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
    a.download = `jp-trainer-backup-${new Date().toISOString().slice(0, 10)}.json`;
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
        alert('นำเข้าข้อมูลสำเร็จ');
        render();
      } catch (err) {
        alert('นำเข้าไม่สำเร็จ: ' + err.message);
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
    const saved = localStorage.getItem('jp-trainer:theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    const btn = $('#theme-toggle');
    btn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme') || 'light';
      const next = cur === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('jp-trainer:theme', next);
      if (state.view === 'write') render(); // repaint canvas guide colour
    });
  }

  // ---------- boot ----------
  function init() {
    window.TTS.init();
    applyJpFont(currentJpFont());
    initTheme();
    $$('.nav-btn').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
    window.addEventListener('hashchange', () => setView(location.hash.slice(1)));
    setView(location.hash.slice(1) || 'learn');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
