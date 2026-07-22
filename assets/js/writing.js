// Writing-practice canvas. Shows a faint reference glyph behind the drawing surface
// so you can trace it, then draw freehand on top. Supports mouse + touch + stylus.

const Writing = {
  canvas: null,
  ctx: null,
  drawing: false,
  guideChar: '',
  showGuide: true,
  lastPoint: null,

  mount(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this._fitToDisplay();
    this._bindEvents();
    this.redraw();
    // Keep the backing store crisp if the layout size changes.
    window.addEventListener('resize', () => { this._fitToDisplay(); this.redraw(); });
  },

  _fitToDisplay() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    // Save current strokes as an image so a resize doesn't wipe them.
    let saved = null;
    if (this.canvas.width) {
      saved = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }
    this.canvas.width = Math.max(1, Math.round(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.round(rect.height * dpr));
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this._cssW = rect.width;
    this._cssH = rect.height;
    if (saved) { try { this.ctx.putImageData(saved, 0, 0); } catch (e) {} }
  },

  setGuide(char) {
    this.guideChar = char || '';
    this.clear();
  },

  toggleGuide(on) {
    this.showGuide = on;
    this.redraw();
  },

  _pos(evt) {
    const rect = this.canvas.getBoundingClientRect();
    const src = evt.touches ? evt.touches[0] : evt;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  },

  _bindEvents() {
    const start = (e) => { e.preventDefault(); this.drawing = true; this.lastPoint = this._pos(e); };
    const move = (e) => {
      if (!this.drawing) return;
      e.preventDefault();
      const p = this._pos(e);
      const ctx = this.ctx;
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#111';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(this.lastPoint.x, this.lastPoint.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      this.lastPoint = p;
    };
    const end = () => { this.drawing = false; this.lastPoint = null; };

    this.canvas.addEventListener('mousedown', start);
    this.canvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    this.canvas.addEventListener('touchstart', start, { passive: false });
    this.canvas.addEventListener('touchmove', move, { passive: false });
    this.canvas.addEventListener('touchend', end);
  },

  clear() {
    this.redraw();
  },

  // Wipe strokes and repaint the guide glyph (if enabled).
  redraw() {
    const ctx = this.ctx;
    const w = this._cssW || this.canvas.clientWidth;
    const h = this._cssH || this.canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    // dashed centre crosshair to help with proportions
    ctx.save();
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#ddd';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
    ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
    ctx.stroke();
    ctx.restore();
    if (this.showGuide && this.guideChar) {
      ctx.save();
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--guide').trim() || 'rgba(0,0,0,0.12)';
      const size = Math.min(w, h) * 0.7;
      ctx.font = `${size}px "Noto Sans Thai", "Sarabun", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.guideChar, w / 2, h / 2);
      ctx.restore();
    }
  },

  // Draw a light grid + midline to help with proportions.
  exportPng() {
    return this.canvas.toDataURL('image/png');
  }
};

window.Writing = Writing;
