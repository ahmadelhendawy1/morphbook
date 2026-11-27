/* =====================================================================
   MorphBook engine  ·  MIT
   A zero-dependency interactive flipbook:
     - real page curl: the page folds along the perpendicular bisector of
       the grabbed corner and the pointer (reflection-fold geometry),
       drawn with clip-path + one rigid CSS matrix, shadows by gradients
     - hard covers turn in true 3D (rotateY, preserve-3d)
     - drag any corner, click, swipe, keyboard; peeking corner on hover
     - left-to-right and right-to-left (Arabic) books
     - synthesized paper sound (Web Audio, no files) or your own clip
     - morph jumps between distant pages (View Transitions API)
     - contents drawer, glossary popovers, read aloud, end-of-book quiz
   Usage:  MorphBook.mount(element, bookData, options)
   ===================================================================== */
(function (global) {
  'use strict';

  /* -------------------------------------------------------------------
     Labels
     ------------------------------------------------------------------- */
  var L10N = {
    en: { contents: 'Contents', cover: 'Cover', page: 'Page', of: 'of', prev: 'Previous page', next: 'Next page',
      sound: 'Page sound', read: 'Read aloud', dark: 'Night mode', full: 'Full screen', print: 'Print',
      quiz: 'Quiz', score: 'Score', again: 'Try again', close: 'Close', great: 'Brilliant!', keep: 'Keep exploring!',
      q: 'Question', hint: 'Drag a corner or tap the edge to turn the page', back: 'Back cover', start: 'Start the quiz',
      jump: 'Go to page' },
    ar: { contents: 'المحتويات', cover: 'الغلاف', page: 'صفحة', of: 'من', prev: 'الصفحة السابقة', next: 'الصفحة التالية',
      sound: 'صوت الصفحات', read: 'قراءة بصوت عالٍ', dark: 'الوضع الليلي', full: 'ملء الشاشة', print: 'طباعة',
      quiz: 'الاختبار', score: 'النتيجة', again: 'حاول تاني', close: 'إغلاق', great: 'برافو عليك!', keep: 'كمّل استكشاف!',
      q: 'سؤال', hint: 'اسحب طرف الصفحة أو اضغط على حافتها عشان تقلب', back: 'الغلاف الخلفي', start: 'ابدأ الاختبار',
      jump: 'روح لصفحة' },
    // Modern Standard (educational) Arabic: chosen with meta.arabic = "fusha"
    'ar-fusha': { contents: 'المحتويات', cover: 'الغلاف', page: 'صفحة', of: 'من', prev: 'الصفحة السابقة', next: 'الصفحة التالية',
      sound: 'صوت الصفحات', read: 'قراءة بصوت عالٍ', dark: 'الوضع الليلي', full: 'ملء الشاشة', print: 'طباعة',
      quiz: 'الاختبار', score: 'النتيجة', again: 'أعِد المحاولة', close: 'إغلاق', great: 'أحسنت!', keep: 'واصل التعلّم!',
      q: 'سؤال', hint: 'اسحب طرف الصفحة أو انقر على حافتها لتقليبها', back: 'الغلاف الخلفي', start: 'ابدأ الاختبار',
      jump: 'انتقل إلى صفحة' }
  };

  var ICON = {
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    sound: '<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
    mute: '<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9l5 6M22 9l-5 6"/>',
    read: '<path d="M12 4a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V7a3 3 0 0 1 3-3z"/><path d="M6 11a6 6 0 0 0 12 0M12 17v3"/>',
    stop: '<rect x="7" y="7" width="10" height="10" rx="2"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
    full: '<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>',
    print: '<path d="M7 9V4h10v5M7 17H5a1 1 0 0 1-1-1v-5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a1 1 0 0 1-1 1h-2"/><rect x="7" y="14" width="10" height="6"/>',
    quiz: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4"/>',
    left: '<path d="M15 5l-7 7 7 7"/>', right: '<path d="M9 5l7 7-7 7"/>'
  };
  function svg(name, map) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + ((map && map[name]) || ICON[name]) + '</svg>'; }

  /* -------------------------------------------------------------------
     Small helpers
     ------------------------------------------------------------------- */
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeInOut(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  var reduceMotion = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------------------------
     Geometry of the fold
     All of it happens in a "normalized" frame: the turning page has its
     spine at x = 0 and its outer edge at x = W. A mirrored page (the left
     page of a left-to-right book, or any right-to-left forward turn) is
     mapped in and out with S(x, y) = (W - x, y).
     ------------------------------------------------------------------- */
  function sub(a, b) { return { x: a.x - b.x, y: a.y - b.y }; }
  function dot(a, b) { return a.x * b.x + a.y * b.y; }
  function len(a) { return Math.sqrt(a.x * a.x + a.y * a.y); }

  // Sutherland–Hodgman against one half plane: keep points with sign*((p-M)·n) >= 0
  function clipHalf(poly, M, n, sign) {
    var out = [];
    for (var i = 0; i < poly.length; i++) {
      var a = poly[i], b = poly[(i + 1) % poly.length];
      var da = sign * dot(sub(a, M), n), db = sign * dot(sub(b, M), n);
      if (da >= 0) out.push(a);
      if ((da >= 0) !== (db >= 0)) {
        var t = da / (da - db);
        out.push({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
      }
    }
    return out;
  }
  function polyCss(poly) {
    if (!poly.length) return 'polygon(0 0,0 0,0 0)';
    return 'polygon(' + poly.map(function (p) { return p.x.toFixed(2) + 'px ' + p.y.toFixed(2) + 'px'; }).join(',') + ')';
  }
  // affine map -> CSS matrix by sampling three points
  function matrixOf(f) {
    var o = f({ x: 0, y: 0 }), ex = f({ x: 1, y: 0 }), ey = f({ x: 0, y: 1 });
    return 'matrix(' + [ex.x - o.x, ex.y - o.y, ey.x - o.x, ey.y - o.y, o.x, o.y].map(function (v) { return v.toFixed(5); }).join(',') + ')';
  }
  // gradient whose stops sit at pixel distances from a line (point p, direction d) inside a w×h box
  function gradientFrom(p, d, w, h, stops) {
    var ang = Math.atan2(d.x, -d.y);
    var L = Math.abs(w * d.x) + Math.abs(h * d.y) || 1;
    var c = { x: w / 2, y: h / 2 };
    var base = dot(sub(p, c), d);
    return 'linear-gradient(' + ang.toFixed(4) + 'rad,' + stops.map(function (s) {
      return s[1] + ' ' + (((base + s[0]) / L + .5) * 100).toFixed(2) + '%';
    }).join(',') + ')';
  }

  /* -------------------------------------------------------------------
     Paper sound: noise through a sweeping band-pass, plus a soft landing.
     ------------------------------------------------------------------- */
  function PaperSound(opts) {
    this.on = opts.enabled !== false;
    this.vol = opts.volume == null ? .7 : opts.volume;
    this.url = opts.url || null;
    this.ctx = null; this.noise = null; this.clip = null;
  }
  PaperSound.prototype.init = function () {
    if (this.ctx) return true;
    var AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return false;
    try { this.ctx = new AC(); } catch (e) { return false; }
    var sr = this.ctx.sampleRate, n = Math.floor(sr * .9);
    var buf = this.ctx.createBuffer(1, n, sr), d = buf.getChannelData(0), last = 0;
    for (var i = 0; i < n; i++) {           // slightly pink, with paper "crackle" spikes
      var w = Math.random() * 2 - 1;
      last = (last + .02 * w) / 1.02;
      d[i] = w * .6 + last * 3 + (Math.random() < .0016 ? (Math.random() * 2 - 1) * 1.4 : 0);
    }
    this.noise = buf;
    var self = this;
    if (this.url && global.fetch) {
      fetch(this.url).then(function (r) { return r.arrayBuffer(); })
        .then(function (a) { return self.ctx.decodeAudioData(a); })
        .then(function (b) { self.clip = b; }).catch(function () {});
    }
    return true;
  };
  PaperSound.prototype.burst = function (t0, dur, f0, f1, q, gain, type) {
    var c = this.ctx, src = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain();
    src.buffer = this.noise;
    bp.type = type || 'bandpass'; bp.Q.value = q;
    bp.frequency.setValueAtTime(f0, t0);
    bp.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + Math.min(.03, dur * .2));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(bp); bp.connect(g); g.connect(c.destination);
    src.start(t0, Math.random() * .3); src.stop(t0 + dur + .05);
  };
  PaperSound.prototype.turn = function (speed, hard) {
    if (!this.on || !this.init()) return;
    var c = this.ctx; if (c.state === 'suspended') c.resume();
    var v = this.vol * clamp(speed || 1, .4, 1.3), t = c.currentTime + .005;
    if (this.clip) {
      var s = c.createBufferSource(), g = c.createGain();
      s.buffer = this.clip; g.gain.value = v; s.connect(g); g.connect(c.destination); s.start(t); return;
    }
    if (hard) {
      this.burst(t, .28, 900, 300, .7, .35 * v);
      var o = c.createOscillator(), og = c.createGain();          // board "thock"
      o.type = 'sine'; o.frequency.setValueAtTime(140, t + .2); o.frequency.exponentialRampToValueAtTime(60, t + .34);
      og.gain.setValueAtTime(.0001, t + .2); og.gain.exponentialRampToValueAtTime(.5 * v, t + .215);
      og.gain.exponentialRampToValueAtTime(.0001, t + .4);
      o.connect(og); og.connect(c.destination); o.start(t + .2); o.stop(t + .42);
      return;
    }
    this.burst(t, .42, 3200, 900, .9, .45 * v);                    // the swish
    this.burst(t + .05, .3, 6000, 2500, 1.6, .12 * v);             // crisp paper edge
    this.burst(t + .34, .14, 700, 260, .8, .3 * v, 'lowpass');     // the landing
  };
  PaperSound.prototype.rustle = function () {                      // tiny sound when a corner is grabbed
    if (!this.on || !this.init()) return;
    var c = this.ctx; if (c.state === 'suspended') c.resume();
    this.burst(c.currentTime + .005, .16, 4200, 2200, 1.2, .14 * this.vol);
  };

  /* -------------------------------------------------------------------
     The book
     ------------------------------------------------------------------- */
  function Book(root, data, opts) {
    this.root = root;
    this.data = data || {};
    this.meta = this.data.meta || {};
    this.opts = opts || {};
    this.pages = (this.data.pages || []).slice();
    this.quiz = this.data.quiz || [];
    this.rtl = (this.meta.dir || (this.meta.lang === 'ar' ? 'rtl' : 'ltr')) === 'rtl';
    var lang = this.meta.lang || (this.rtl ? 'ar' : 'en');
    var labelSet = (lang === 'ar' && this.meta.arabic === 'fusha') ? 'ar-fusha' : lang;
    this.L = Object.assign({}, L10N[labelSet] || L10N[lang] || L10N.en, this.meta.labels || {}, this.opts.labels || {});
    this.N = this.pages.length;
    this.spread = false;
    this.pos = 0;              // spread index (two-page) or page index (one-page)
    this.state = 'idle';       // idle | peek | drag | anim
    this.turn = null;
    this.fsCache = {};
    this.best = 0;
    this.sound = new PaperSound(this.meta.sound || {});
    this.duration = this.opts.duration || this.meta.duration || 900;
    this.icons = Object.assign({}, ICON, (this.opts && this.opts.icons) || {});
    this.prepPages();
    this.buildUI();
    this.layout(true);
    this.bindEvents();
    this.restore();
    if (global.MorphBook && global.MorphBook.extras) this.ext = global.MorphBook.extras(this);   // search, practice, labs…
  }

  /* ---- data ---- */
  Book.prototype.prepPages = function () {
    var m = this.meta, self = this;
    // page types from morphbook-extras.js (practice, video, picture, lab, glossary) + the automatic glossary
    if (global.MorphBook && global.MorphBook.prepareExtras) global.MorphBook.prepareExtras(this);
    this.pages.forEach(function (p, i) {
      p.type = p.type || (p.image ? 'image' : 'html');
      if (p.type === 'cover' && !p.html) p.html = self.coverHtml();
      if (p.type === 'back' && !p.html) p.html = self.backHtml();
      if (p.hard == null) p.hard = (p.type === 'cover' || p.type === 'back') && m.hardCover !== false;
      // cover art (e.g. made with an image model): the title stays live HTML on top of it
      if (((p.type === 'cover' && m.coverImage) || (p.type === 'back' && m.backImage)) && !p.bg) {
        p.bg = 'linear-gradient(180deg,rgba(0,0,0,.12),rgba(0,0,0,.08) 45%,rgba(0,0,0,.55)),url("' +
          (p.type === 'cover' ? m.coverImage : m.backImage) + '") center/cover';
      }
    });
  };
  Book.prototype.coverHtml = function () {
    var m = this.meta;
    return '<div class="pg cover"><div class="frame"></div>' +
      (m.icon ? '<div class="cover-mark" aria-hidden="true">' + esc(m.icon) + '</div>' : '') +
      '<h1>' + esc(m.title || '') + '</h1>' +
      (m.subtitle ? '<p class="tag">' + esc(m.subtitle) + '</p>' : '') + '<div class="rule"></div>' +
      ([m.grade, m.subject].filter(Boolean).length ? '<p class="tag">' + esc([m.grade, m.subject].filter(Boolean).join(' · ')) + '</p>' : '') +
      '<div class="cover-foot">' + (m.author ? '<p class="by">' + (this.rtl ? 'تأليف' : 'by') + '</p><h3>' + esc(m.author) + '</h3>' : '') +
      (m.org ? '<p class="org">' + esc(m.org) + '</p>' : '') + '</div></div>';
  };
  Book.prototype.backHtml = function () {
    var m = this.meta;
    return '<div class="pg backcover"><div class="frame"></div>' +
      (m.icon ? '<div style="font-size:2.4em">' + esc(m.icon) + '</div>' : '') +
      '<p>' + esc(m.blurb || m.title || '') + '</p>' + (m.org ? '<p class="org">' + esc(m.org) + '</p>' : '') + '</div>';
  };

  /* ---- chrome ---- */
  Book.prototype.buildUI = function () {
    var r = this.root, m = this.meta, L = this.L, self = this;
    r.classList.add('mb-root');
    r.setAttribute('dir', this.rtl ? 'rtl' : 'ltr');
    r.setAttribute('lang', m.lang || (this.rtl ? 'ar' : 'en'));
    if (m.theme) r.setAttribute('data-theme', m.theme);
    if (m.hue != null) r.style.setProperty('--hue', m.hue);
    if (m.accent) r.style.setProperty('--accent', m.accent);
    if (m.paperImage) r.style.setProperty('--paper-img', 'url("' + m.paperImage + '")');
    r.innerHTML = '';

    var bar = el('header', 'mb-bar');
    bar.innerHTML =
      '<button class="mb-tool" data-act="toc" aria-label="' + L.contents + '" title="' + L.contents + '">' + this.svg('menu') + '</button>' +
      '<div class="mb-title"><b></b><small></small></div>' +
      '<span class="mb-score" hidden></span>' +
      (this.quiz.length ? '<button class="mb-tool" data-act="quiz" aria-label="' + L.quiz + '" title="' + L.quiz + '">' + this.svg('quiz') + '</button>' : '') +
      '<button class="mb-tool" data-act="sound" aria-label="' + L.sound + '" title="' + L.sound + '"></button>' +
      '<button class="mb-tool" data-act="read" aria-label="' + L.read + '" title="' + L.read + '">' + this.svg('read') + '</button>' +
      '<button class="mb-tool" data-act="dark" aria-label="' + L.dark + '" title="' + L.dark + '">' + this.svg('moon') + '</button>' +
      '<button class="mb-tool" data-act="full" aria-label="' + L.full + '" title="' + L.full + '">' + this.svg('full') + '</button>' +
      '<button class="mb-tool" data-act="print" aria-label="' + L.print + '" title="' + L.print + '">' + this.svg('print') + '</button>';
    bar.querySelector('.mb-title b').textContent = m.title || '';
    bar.querySelector('.mb-title small').textContent = [m.grade, m.subject].filter(Boolean).join(' · ');
    this.scoreEl = bar.querySelector('.mb-score');
    r.appendChild(bar);
    var prog = el('div', 'mb-progress', '<i></i>'); r.appendChild(prog); this.progEl = prog.firstChild;

    this.stage = el('div', 'mb-stage');
    this.bookEl = el('div', 'mb-book');
    this.slotV = el('div', 'mb-slot verso');
    this.slotR = el('div', 'mb-slot recto');
    this.spineEl = el('div', 'mb-spine');
    this.bookEl.appendChild(this.slotV); this.bookEl.appendChild(this.slotR); this.bookEl.appendChild(this.spineEl);
    this.stage.appendChild(this.bookEl); r.appendChild(this.stage);

    var foot = el('nav', 'mb-foot');
    foot.innerHTML = '<button class="mb-nav" data-act="prev" aria-label="' + L.prev + '">' + this.svg('left') + '</button>' +
      '<label class="mb-scrub"><input type="range" min="0" value="0" aria-label="' + L.jump + '"><span></span></label>' +
      '<button class="mb-nav" data-act="next" aria-label="' + L.next + '">' + this.svg('right') + '</button>';
    r.appendChild(foot);
    this.prevBtn = foot.querySelector('[data-act=prev]'); this.nextBtn = foot.querySelector('[data-act=next]');
    this.range = foot.querySelector('input'); this.pill = foot.querySelector('.mb-scrub span');
    this.range.max = String(this.N - 1);
    if (this.rtl) this.range.style.direction = 'rtl';

    this.drawer = el('aside', 'mb-drawer'); this.drawer.innerHTML = '<h2>' + L.contents + '</h2><div></div>';
    this.scrim = el('div', 'mb-scrim');
    this.pop = el('div', 'mb-pop'); this.pop.setAttribute('role', 'tooltip'); this.pop.innerHTML = '<b></b><span></span>';
    this.modal = el('div', 'mb-modal'); this.modal.setAttribute('role', 'dialog'); this.modal.setAttribute('aria-modal', 'true');
    this.modal.innerHTML = '<div class="mb-qbox"><div class="mb-qhead">' + L.quiz + '</div><div class="mb-qbody"></div>' +
      '<div class="mb-qfoot"><span></span><button data-act="qclose">' + L.close + '</button></div></div>';
    this.live = el('div', 'mb-live'); this.live.setAttribute('aria-live', 'polite');
    this.hint = el('div', 'mb-hint', esc(L.hint));
    [this.drawer, this.scrim, this.pop, this.modal, this.live, this.hint].forEach(function (x) { r.appendChild(x); });
    setTimeout(function () { self.hint.classList.add('gone'); }, 4500);

    // contents drawer
    var list = this.drawer.lastChild, lastChap = null;
    this.pages.forEach(function (p, i) {
      if (p.chapter && p.chapter !== lastChap) { lastChap = p.chapter; list.appendChild(el('div', 'mb-dchap', esc(p.chapter))); }
      var b = el('button', 'mb-drow', '<i>' + (i === 0 ? '—' : i + 1) + '</i><span></span>');
      b.dataset.i = i;
      b.querySelector('span').textContent = p.title || (p.type === 'cover' ? L.cover : p.type === 'back' ? L.back : L.page + ' ' + (i + 1));
      list.appendChild(b);
    });
    this.setSoundIcon();
    // print copy
    this.printEl = el('div', 'mb-print'); r.appendChild(this.printEl);
  };
  Book.prototype.svg = function (name) { return svg(name, this.icons); };
  Book.prototype.setSoundIcon = function () {
    var b = this.root.querySelector('[data-act=sound]');
    b.innerHTML = this.svg(this.sound.on ? 'sound' : 'mute'); b.setAttribute('aria-pressed', String(this.sound.on));
  };

  /* ---- sizing ---- */
  Book.prototype.layout = function (first) {
    var sw = this.stage.clientWidth - 24, sh = this.stage.clientHeight - 20;
    var ar = this.meta.aspect || (this.meta.size ? this.meta.size.w / this.meta.size.h : .72);
    var canSpread = !this.opts.single && !this.meta.single && sw >= 640 && sw / sh > ar * 1.3;
    var wasSpread = this.spread, pageIndex = this.currentPageIndex();
    this.spread = canSpread;
    var H, W;
    if (this.spread) { H = Math.min(sh, sw / (2 * ar)); W = H * ar; }
    else { H = Math.min(sh, sw / ar); W = H * ar; }
    this.W = Math.floor(W); this.H = Math.floor(H);
    if (!first && wasSpread !== this.spread) this.pos = this.posOfPage(pageIndex);
    if (first) this.pos = 0;
    var bw = this.spread ? this.W * 2 : this.W;
    this.bookEl.style.width = bw + 'px'; this.bookEl.style.height = this.H + 'px';
    [this.slotV, this.slotR].forEach(function (s) { s.style.width = this.W + 'px'; s.style.height = this.H + 'px'; }, this);
    this.rectoX = this.spread ? (this.rtl ? 0 : this.W) : 0;
    this.versoX = this.spread ? (this.rtl ? this.W : 0) : -9999;
    this.slotR.style.left = this.rectoX + 'px'; this.slotV.style.left = this.versoX + 'px';
    this.spineEl.style.left = this.W + 'px';
    this.spineEl.style.display = this.spread ? '' : 'none';
    this.fsCache = {};
    this.cancelTurn();
    this.render();
  };

  /* ---- positions ---- */
  Book.prototype.maxPos = function () { return this.spread ? Math.floor(this.N / 2) : this.N - 1; };
  Book.prototype.versoIdx = function (s) { return s >= 1 ? 2 * s - 1 : -1; };
  Book.prototype.rectoIdx = function (s) { return 2 * s < this.N ? 2 * s : -1; };
  Book.prototype.posOfPage = function (i) { return this.spread ? (i <= 0 ? 0 : Math.ceil(i / 2)) : i; };
  Book.prototype.currentPageIndex = function () {
    if (!this.spread) return this.pos;
    var r = this.rectoIdx(this.pos), v = this.versoIdx(this.pos);
    return v >= 0 ? v : r;
  };
  Book.prototype.visiblePages = function () {
    if (!this.spread) return [this.pos];
    return [this.versoIdx(this.pos), this.rectoIdx(this.pos)].filter(function (i) { return i >= 0 && i < this.N; }, this);
  };

  /* ---- page nodes ---- */
  Book.prototype.pageNode = function (i, side) {
    var p = this.pages[i], node = el('div', 'mb-page');
    if (!p) { node.classList.add('blank'); return node; }
    node.classList.add(this.spread ? (side === 'l' ? 'side-l' : 'side-r') : 'single');
    if (p.hard) node.classList.add('hard');
    if (p.bg) node.style.background = p.bg;
    node.dataset.i = i;
    if (p.type === 'image') {
      var pic = el('div', 'mb-pic' + (p.fit === 'cover' ? ' cover' : ''));
      var img = new Image(); img.alt = p.alt || p.title || ''; img.src = p.image; img.draggable = false;
      pic.appendChild(img); node.appendChild(pic);
    } else if (p.type === 'blank') {
      node.appendChild(el('div', 'mb-blank'));
    } else {
      var sc = el('div', 'mb-scroll', p.html || '');
      node.appendChild(sc);
    }
    node.appendChild(el('div', 'mb-gutter'));
    return node;
  };
  Book.prototype.sideOf = function (which) { // which: 'recto' | 'verso' -> 'l' | 'r'
    if (which === 'recto') return this.rtl ? 'l' : 'r';
    return this.rtl ? 'r' : 'l';
  };
  // scale content so a short page fills the paper and a long one fits (then scrolls)
  Book.prototype.fit = function (node) {
    var sc = node.querySelector('.mb-scroll'); if (!sc) return;
    var pg = sc.querySelector('.pg'); if (!pg) return;
    var key = node.dataset.i + '@' + this.W + 'x' + this.H;
    if (this.fsCache[key]) { pg.style.setProperty('--fs', this.fsCache[key].fs); pg.classList.toggle('fill', this.fsCache[key].fill); return; }
    var base = this.W / 400, lo = .8 * base, hi = 1.45 * base, best = lo;
    for (var k = 0; k < 8; k++) {
      var mid = (lo + hi) / 2; pg.style.setProperty('--fs', mid);
      if (pg.scrollHeight <= sc.clientHeight + 1) { best = mid; lo = mid; } else hi = mid;
    }
    pg.style.setProperty('--fs', best);
    if (pg.scrollHeight > sc.clientHeight + 2) {      // still too long at the smallest size: it will scroll
      node.dataset.overflow = '1';
      if (global.console) console.warn('[morphbook] page ' + (+node.dataset.i + 1) + ' is too long for the paper');
    }
    var fill = pg.scrollHeight < sc.clientHeight * .9;
    pg.classList.toggle('fill', fill);
    this.fsCache[key] = { fs: best, fill: fill };
  };

  /* ---- static render ---- */
  Book.prototype.render = function () {
    var s = this.pos;
    this.slotV.innerHTML = ''; this.slotR.innerHTML = '';
    if (this.spread) {
      var v = this.versoIdx(s), r = this.rectoIdx(s);
      if (v >= 0) this.slotV.appendChild(this.pageNode(v, this.sideOf('verso')));
      if (r >= 0) this.slotR.appendChild(this.pageNode(r, this.sideOf('recto')));
    } else {
      this.slotR.appendChild(this.pageNode(s, 'r'));
    }
    var self = this;
    [this.slotV, this.slotR].forEach(function (slot) { if (slot.firstChild) self.fit(slot.firstChild); });
    this.updateChrome();
  };

  Book.prototype.updateChrome = function () {
    var L = this.L, s = this.pos, vis = this.visiblePages(), N = this.N;
    // centre a closed book (cover alone or back cover alone)
    var shift = 0;
    if (this.spread) {
      var v = this.versoIdx(s), r = this.rectoIdx(s);
      var dirSign = this.rtl ? 1 : -1;               // recto side is right in LTR, left in RTL
      if (v < 0 && r >= 0) shift = dirSign * this.W / 2;
      else if (r < 0 && v >= 0) shift = -dirSign * this.W / 2;
      this.bookEl.classList.toggle('open', v >= 0 && r >= 0);
      // page-stack thickness on each side
      var leftPages = Math.max(0, v), rightPages = Math.max(0, N - 1 - Math.max(r, v));
      this.slotV.style.setProperty('--stack', this.stackShadow(leftPages, this.rtl ? 1 : -1));
      this.slotR.style.setProperty('--stack', this.stackShadow(rightPages, this.rtl ? -1 : 1));
    }
    this.bookEl.style.transform = shift ? 'translateX(' + shift + 'px)' : '';
    var first = vis[0], label;
    if (vis.length === 1 && this.pages[first] && this.pages[first].type === 'cover') label = L.cover;
    else label = L.page + ' ' + vis.map(function (i) { return i + 1; }).join('–') + ' ' + L.of + ' ' + N;
    this.pill.textContent = label;
    this.range.value = String(this.currentPageIndex());
    // the footer follows the book's direction: in RTL the bar is mirrored, so "next" sits on the LEFT
    // pointing left (the way an Arabic book opens) and "prev" sits on the right pointing right
    var canBack = s > 0, canFwd = s < this.maxPos();
    this.prevBtn.disabled = !canBack;
    this.nextBtn.disabled = !canFwd;
    this.progEl.style.width = Math.round(s / Math.max(1, this.maxPos()) * 100) + '%';
    var self = this;
    Array.prototype.forEach.call(this.drawer.querySelectorAll('.mb-drow'), function (b) {
      b.setAttribute('aria-current', String(vis.indexOf(+b.dataset.i) >= 0));
    });
    this.live.textContent = label;
    this.stopRead();
    try { localStorage.setItem(this.storeKey(), String(this.currentPageIndex())); } catch (e) {}
    if (this.opts.onPage) this.opts.onPage(vis, this);
    if (this.ext) this.ext.onPage(vis);
    void self;
  };
  Book.prototype.stackShadow = function (n, dir) {
    var layers = Math.min(6, Math.ceil(n / 4)), out = [];
    for (var k = 1; k <= layers; k++) {
      out.push((dir * k * 1.5).toFixed(1) + 'px ' + (k * .8).toFixed(1) + 'px 0 ' +
        (k % 2 ? 'var(--stack-light,#e8e1d2)' : 'var(--stack-shade,#d8cfbd)'));
    }
    return out.length ? out.join(',') : '0 0 0 transparent';
  };
  Book.prototype.storeKey = function () { return 'morphbook:' + (this.meta.id || this.meta.title || 'book'); };
  Book.prototype.restore = function () {
    if (this.opts.restore === false) return;
    try {
      var i = parseInt(localStorage.getItem(this.storeKey()), 10);
      if (i > 0 && i < this.N) { this.pos = this.posOfPage(i); this.render(); }
    } catch (e) {}
  };

  /* -------------------------------------------------------------------
     Turning
     A turn always lifts the recto page of position `a` (spread a, or page a
     in one-page mode) toward position a+1. A backward turn is the same turn
     played from 1 to 0.
     ------------------------------------------------------------------- */
  Book.prototype.turnPages = function (a) {
    if (this.spread) return { front: this.rectoIdx(a), back: 2 * a + 1 < this.N ? 2 * a + 1 : -1,
      under: 2 * a + 2 < this.N ? 2 * a + 2 : -1, still: this.versoIdx(a) };
    return { front: a, back: -2 /* paper reverse */, under: a + 1 < this.N ? a + 1 : -1, still: -1 };
  };
  Book.prototype.startTurn = function (a, corner) {
    var t = this.turnPages(a);
    if (t.front < 0) return null;
    var W = this.W, H = this.H;
    var hard = !!((this.pages[t.front] && this.pages[t.front].hard) || (t.back >= 0 && this.pages[t.back] && this.pages[t.back].hard));
    if (reduceMotion) hard = true;
    var turn = { a: a, pages: t, hard: hard, mirror: this.rtl, C: { x: W, y: corner === 'top' ? 0 : H }, P: null, progress: 0 };
    // static slots show what lies beneath the turning sheet
    this.slotV.innerHTML = ''; this.slotR.innerHTML = '';
    if (this.spread && t.still >= 0) { var sv = this.pageNode(t.still, this.sideOf('verso')); this.slotV.appendChild(sv); this.fit(sv); }
    if (t.under >= 0) { var su = this.pageNode(t.under, this.spread ? this.sideOf('recto') : 'r'); this.slotR.appendChild(su); this.fit(su); }

    var layer = el('div', 'mb-flip');
    layer.style.width = W + 'px'; layer.style.height = H + 'px'; layer.style.left = this.rectoX + 'px';
    var frontNode = this.pageNode(t.front, this.spread ? this.sideOf('recto') : 'r');
    var backNode;
    if (t.back === -2) {              // one-page mode: the reverse of the paper shows faintly through
      backNode = this.pageNode(t.front, 'r'); backNode.classList.add('reverse');
      backNode.style.transform = 'scaleX(-1)';
      var veil = el('div', 'mb-shade'); veil.style.background = 'color-mix(in srgb,var(--paper) 86%,transparent)'; veil.style.zIndex = 30;
      backNode.appendChild(veil);
    } else backNode = this.pageNode(t.back, this.spread ? this.sideOf('verso') : 'l');

    if (hard) {
      // the stage already sets the perspective; a second one here would double it
      var sheet = el('div', 'mb-sheet');
      sheet.style.transformOrigin = (this.rtl ? 'right' : 'left') + ' center';
      var ff = el('div', 'mb-face front'), fb = el('div', 'mb-face back');
      ff.appendChild(frontNode); fb.appendChild(backNode);
      var shF = el('div', 'mb-shade'), shB = el('div', 'mb-shade');
      ff.appendChild(shF); fb.appendChild(shB);
      sheet.appendChild(ff); sheet.appendChild(fb); layer.appendChild(sheet);
      turn.els = { layer: layer, sheet: sheet, shF: shF, shB: shB };
    } else {
      var under = el('div', 'mb-undershade');
      var front = el('div', 'mb-front'); front.appendChild(frontNode);
      var fshade = el('div', 'mb-shade'); front.appendChild(fshade);
      var wrap = el('div', 'mb-flapwrap'), flap = el('div', 'mb-flap'); flap.appendChild(backNode);
      var bshade = el('div', 'mb-shade'); flap.appendChild(bshade);
      wrap.appendChild(flap);
      layer.appendChild(under); layer.appendChild(front); layer.appendChild(wrap);
      turn.els = { layer: layer, under: under, front: front, fshade: fshade, flap: flap, bshade: bshade, wrap: wrap };
    }
    this.bookEl.appendChild(layer);
    this.fit(frontNode); if (t.back !== -2) this.fit(backNode);
    this.turn = turn;
    return turn;
  };

  // constrain the pointer so the paper never tears off the spine
  Book.prototype.constrain = function (P, C) {
    var W = this.W, H = this.H;
    var Sc = { x: 0, y: C.y }, So = { x: 0, y: H - C.y };
    var d = sub(P, Sc), l = len(d);
    if (l > W) P = { x: Sc.x + d.x / l * W, y: Sc.y + d.y / l * W };
    var R2 = Math.sqrt(W * W + H * H); d = sub(P, So); l = len(d);
    if (l > R2) P = { x: So.x + d.x / l * R2, y: So.y + d.y / l * R2 };
    return P;
  };

  // draw the current turn
  Book.prototype.draw = function () {
    var t = this.turn; if (!t) return;
    var W = this.W, H = this.H, mir = t.mirror;
    var S = function (p) { return mir ? { x: W - p.x, y: p.y } : p; };
    if (t.hard) {
      var p = clamp(t.progress, 0, 1), ang = p * 180 * (mir ? 1 : -1);
      var lift = Math.sin(p * Math.PI);
      t.els.sheet.style.transform = 'translateZ(' + (lift * 18).toFixed(1) + 'px) rotateY(' + ang.toFixed(2) + 'deg)';
      t.els.shF.style.background = 'rgba(0,0,0,' + (p < .5 ? p * .5 : 0).toFixed(3) + ')';
      t.els.shB.style.background = 'rgba(0,0,0,' + (p > .5 ? (1 - p) * .5 : 0).toFixed(3) + ')';
      t.els.layer.style.zIndex = 30;
      return;
    }
    var C = t.C, P = t.P;
    var rect = [{ x: 0, y: 0 }, { x: W, y: 0 }, { x: W, y: H }, { x: 0, y: H }];
    var e = t.els;
    if (len(sub(C, P)) < .5) {       // flat
      e.front.style.clipPath = 'none'; e.wrap.style.display = 'none'; e.under.style.background = 'none'; e.fshade.style.background = 'none';
      return;
    }
    e.wrap.style.display = '';
    var M = { x: (C.x + P.x) / 2, y: (C.y + P.y) / 2 };
    var dist = len(sub(C, P)), n = { x: (C.x - P.x) / dist, y: (C.y - P.y) / dist };
    var folded = clipHalf(rect, M, n, 1);        // the part that lifts (corner side)
    var flat = clipHalf(rect, M, n, -1);         // the part still lying down
    // front page: only the flat part
    e.front.style.clipPath = polyCss(flat.map(S));
    // flap: back content u -> sheet point (W-u.x, u.y) -> reflected across the fold
    var refl = function (q) { var k = 2 * dot(sub(q, M), n); return { x: q.x - k * n.x, y: q.y - k * n.y }; };
    var mapN = function (u) { return refl({ x: W - u.x, y: u.y }); };
    var mapA = function (u) { return S(mapN(S(u))); };
    e.flap.style.transform = matrixOf(mapA);
    var flapClipN = folded.map(function (q) { return { x: W - q.x, y: q.y }; });
    e.flap.style.clipPath = polyCss(flapClipN.map(S));
    // under-page shadow cast by the flap, and the reveal clip
    var span = Math.min(dist * .55, W * .45) + 8;
    var nA = mir ? { x: -n.x, y: n.y } : n, MA = S(M);
    e.under.style.clipPath = polyCss(folded.map(S));
    e.under.style.background = gradientFrom(MA, nA, W, H, [[0, 'rgba(0,0,0,.45)'], [span * .35, 'rgba(0,0,0,.18)'], [span, 'rgba(0,0,0,0)']]);
    // the front page darkens a little where it starts to curl
    var nf = { x: -nA.x, y: -nA.y };
    e.fshade.style.background = gradientFrom(MA, nf, W, H, [[0, 'rgba(0,0,0,.2)'], [Math.min(40, span * .5), 'rgba(0,0,0,0)']]);
    // flap shading: dark crease, soft highlight, slight fall-off at its edge
    var dFlap = mir ? n : { x: -n.x, y: n.y }, mFlap = mir ? M : { x: W - M.x, y: M.y };
    var fw = dist / 2;
    e.bshade.style.background = gradientFrom(mFlap, dFlap, W, H, [[0, 'rgba(0,0,0,.28)'], [fw * .12, 'rgba(0,0,0,.08)'],
      [fw * .35, 'rgba(255,255,255,.14)'], [fw, 'rgba(0,0,0,.06)']]);
    // drop shadow grows as the sheet lifts, fades as it lands
    var prog = clamp((W - P.x) / (2 * W), 0, 1), sh = Math.sin(prog * Math.PI);
    e.wrap.style.filter = 'drop-shadow(0 0 ' + (4 + 16 * sh).toFixed(1) + 'px rgba(0,0,0,' + (.12 + .22 * sh).toFixed(3) + '))';
    t.progress = prog;
  };

  Book.prototype.setP = function (P) {
    var t = this.turn; if (!t) return;
    if (t.hard) { t.progress = clamp((this.W - P.x) / (2 * this.W), 0, 1); t.P = P; }
    else t.P = this.constrain(P, t.C);
    this.draw();
  };

  // the path a page follows when it turns by itself: an arc, as a hand lifts the corner
  Book.prototype.pathP = function (e, from, to) {
    var t = this.turn, C = t.C;
    var lift = Math.sin(e * Math.PI) * this.H * .16 * Math.abs(to.x - from.x) / (2 * this.W);
    var y = lerp(from.y, to.y, e) + (C.y === 0 ? lift : -lift);
    return { x: lerp(from.x, to.x, e), y: y };
  };
  Book.prototype.animate = function (to, ms, done) {
    var self = this, t = this.turn, from = t.P || { x: t.C.x, y: t.C.y }, start = performance.now();
    this.state = 'anim';
    cancelAnimationFrame(this.raf);
    var easing = ms > 500 ? easeInOut : easeOut;
    var step = function (now) {
      if (self.turn !== t) return;
      var k = clamp((now - start) / ms, 0, 1), e = easing(k);
      self.setP(self.pathP(e, from, to));
      if (k < 1) self.raf = requestAnimationFrame(step); else done && done();
    };
    this.raf = requestAnimationFrame(step);
  };
  Book.prototype.endTurn = function (completed) {
    var t = this.turn; if (!t) return;
    if (t.els && t.els.layer.parentNode) t.els.layer.parentNode.removeChild(t.els.layer);
    this.turn = null; this.state = 'idle';
    this.pos = completed ? t.a + 1 : t.a;
    this.render();
  };
  Book.prototype.cancelTurn = function () {
    cancelAnimationFrame(this.raf);
    if (this.turn && this.turn.els && this.turn.els.layer.parentNode) this.turn.els.layer.parentNode.removeChild(this.turn.els.layer);
    this.turn = null; this.state = 'idle';
  };

  // full automatic turns
  Book.prototype.next = function () {
    if (this.state === 'anim' || this.state === 'drag') return;
    if (this.state === 'peek') this.cancelTurn();
    if (this.pos >= this.maxPos()) return;
    var t = this.startTurn(this.pos, 'bottom'); if (!t) return;
    var self = this, W = this.W, H = this.H;
    t.P = { x: W - 1, y: H - 1 };
    this.sound.turn(1, t.hard);
    this.animate({ x: -W, y: H }, this.duration, function () { self.endTurn(true); });
  };
  Book.prototype.prev = function () {
    if (this.state === 'anim' || this.state === 'drag') return;
    if (this.state === 'peek') this.cancelTurn();
    if (this.pos <= 0) return;
    var t = this.startTurn(this.pos - 1, 'bottom'); if (!t) return;
    var self = this, W = this.W, H = this.H;
    t.P = { x: -W + 1, y: H - 1 }; this.setP(t.P);
    this.sound.turn(1, t.hard);
    this.animate({ x: W, y: H }, this.duration, function () { self.endTurn(false); });
  };
  // jump: one turn when near, a morph (View Transition) when far
  Book.prototype.goPage = function (i) {
    i = clamp(i, 0, this.N - 1);
    var target = this.posOfPage(i);
    if (target === this.pos) return;
    if (target === this.pos + 1) return this.next();
    if (target === this.pos - 1) return this.prev();
    this.cancelTurn();
    var self = this, back = target < this.pos;
    var apply = function () { self.pos = target; self.render(); };
    this.sound.turn(1.2, false);
    if (document.startViewTransition && !reduceMotion) {
      document.documentElement.setAttribute('data-vt', back ? 'back' : 'fwd');
      var vt = document.startViewTransition(apply);
      vt.finished.then(function () { document.documentElement.removeAttribute('data-vt'); });
    } else apply();
  };

  /* -------------------------------------------------------------------
     Pointer: grab a corner, peek on hover, click the edges
     ------------------------------------------------------------------- */
  // pointer position in the turning page's normalized frame
  Book.prototype.toN = function (cx, cy) {
    var r = this.bookEl.getBoundingClientRect();
    var lx = cx - r.left - this.rectoX, ly = cy - r.top;
    return { x: this.rtl ? this.W - lx : lx, y: ly };
  };
  Book.prototype.zone = function (p) {           // which grab zone the pointer is in
    var W = this.W, H = this.H, edge = Math.max(46, W * .2);
    if (p.y < -10 || p.y > H + 10) return null;
    var corner = p.y < H / 2 ? 'top' : 'bottom';
    if (p.x > W - edge && p.x <= W + 10 && this.pos < this.maxPos()) return { dir: 1, corner: corner };
    if (this.spread && p.x < -W + edge && p.x >= -W - 10 && this.pos > 0) return { dir: -1, corner: corner };
    if (!this.spread && p.x >= -10 && p.x < edge && this.pos > 0) return { dir: -1, corner: corner };
    return null;
  };
  Book.prototype.pointerToP = function (p, dir) {
    if (!this.spread && dir < 0) return { x: p.x * 2 - this.W, y: p.y };   // one page: the previous page slides in from the edge
    return p;
  };

  Book.prototype.bindEvents = function () {
    var self = this, r = this.root, stage = this.stage;
    var down = null;

    stage.addEventListener('pointerdown', function (ev) {
      if (ev.button > 0) return;
      if (ev.target.closest('button,a,input,select,textarea,.term,.hw,[data-goto],[data-quiz]')) return;
      var p = self.toN(ev.clientX, ev.clientY), z = self.zone(p);
      down = { x: ev.clientX, y: ev.clientY, t: performance.now(), z: z, p: p, moved: false };
      if (!z || self.state === 'anim') return;
      if (self.state === 'peek' && self.turn && self.turn.dir === z.dir) {
        // keep the peeking sheet and continue as a drag
      } else {
        self.cancelTurn();
        var a = z.dir > 0 ? self.pos : self.pos - 1;
        var t = self.startTurn(a, z.corner); if (!t) return;
        t.dir = z.dir;
        if (z.dir < 0) { t.P = { x: -self.W, y: t.C.y }; }
        else t.P = { x: t.C.x, y: t.C.y };
      }
      self.state = 'drag';
      self.sound.rustle();
      try { stage.setPointerCapture(ev.pointerId); } catch (e) {}
      self.setP(self.pointerToP(p, z.dir));
      ev.preventDefault();
    });

    stage.addEventListener('pointermove', function (ev) {
      var p = self.toN(ev.clientX, ev.clientY);
      if (down && Math.abs(ev.clientX - down.x) + Math.abs(ev.clientY - down.y) > 6) down.moved = true;
      if (self.state === 'drag' && self.turn) {
        self.setP(self.pointerToP(p, self.turn.dir));
        return;
      }
      if (ev.pointerType !== 'mouse' || self.state === 'anim') return;
      // peek: a hovering mouse near a corner lifts it a little
      var z = self.zone(p);
      // no peek over a playing video or a practice/lab/picture page: the peek redraws the page and would restart the video
      if (z && !self.turn && self.state === 'idle' && !(self.ext && self.ext.blockPeek && self.ext.blockPeek())) {
        var a = z.dir > 0 ? self.pos : self.pos - 1, t = self.startTurn(a, z.corner);
        if (!t) return;
        t.dir = z.dir; self.state = 'peek';
        t.P = z.dir > 0 ? { x: t.C.x, y: t.C.y } : { x: -self.W, y: t.C.y };
        self.setP(t.P);
      }
      if (self.state === 'peek' && self.turn) {
        var cornerNow = self.turn.C.y === 0 ? 'top' : 'bottom';
        if (z && z.dir === self.turn.dir && z.corner !== cornerNow && !self.turn.hard) {   // moved to the other corner
          self.cancelTurn(); self.render(); return;
        }
        if (!z || z.dir !== self.turn.dir) {
          var tt = self.turn, back = tt.dir > 0 ? { x: tt.C.x, y: tt.C.y } : { x: -self.W, y: tt.C.y };
          self.animate(back, 220, function () { self.endTurn(tt.dir < 0); });
          return;
        }
        // the corner follows the pointer, but never lifts less than `amt` or more than 2.4 × amt
        var amt = Math.max(30, self.W * .1), C = self.turn.C;
        var Cv = self.turn.dir > 0 ? C : { x: -self.W, y: C.y };          // where the grabbed corner sits now
        var inward = { x: self.turn.dir > 0 ? -1 : 1, y: C.y === 0 ? 1 : -1 };
        var v = sub(p, Cv), l = len(v);
        if (l < 1 || v.x * inward.x < 0) { v = inward; l = Math.SQRT2; }
        var want = clamp(l, amt, amt * 2.4);
        var target = { x: Cv.x + v.x / l * want, y: Cv.y + v.y / l * want };
        target.y = C.y === 0 ? Math.max(target.y, amt * .3) : Math.min(target.y, self.H - amt * .3);
        if (self.turn.hard) target = self.turn.dir > 0 ? { x: self.W - amt * 1.2, y: C.y } : { x: -self.W + amt * 1.2, y: C.y };
        self.setP(target);
      }
    });

    var release = function (ev) {
      if (!down) return;
      var d = down; down = null;
      if (self.state === 'drag' && self.turn) {
        var t = self.turn, W = self.W, H = self.H;
        var tap = !d.moved && performance.now() - d.t < 350;
        var complete;
        var p = self.pointerToP(self.toN(ev.clientX, ev.clientY), t.dir);
        var vx = (ev.clientX - d.x) * (self.rtl ? -1 : 1);
        if (tap) complete = t.dir > 0;                         // a tap on the edge turns the page
        // forward: past a quarter of the page from the spine, or flung; backward: mirrored
        else complete = t.dir > 0 ? (p.x < W * .25 || vx < -60) : (p.x < -W * .25 && vx <= 60);
        var to = complete ? { x: -W, y: t.C.y } : { x: W, y: t.C.y };
        var remain = Math.abs(to.x - (t.P ? t.P.x : W)) / (2 * W);
        self.sound.turn(.7 + remain * .5, t.hard);
        self.animate(to, Math.max(260, self.duration * (tap ? 1 : .75) * remain), function () { self.endTurn(complete); });
        return;
      }
      // a click (no corner grab) on the left/right half turns too
      if (!d.moved && !d.z && performance.now() - d.t < 400 && !ev.target.closest('button,a,input,.term,.hw,[data-goto],[data-quiz],.mb-scroll.scrolls')) {
        var sc = ev.target.closest('.mb-scroll');
        if (sc && sc.scrollHeight > sc.clientHeight + 4) return;
        if (window.getSelection && String(window.getSelection()).length > 2) return;
        var br = self.bookEl.getBoundingClientRect(), right = ev.clientX > br.left + br.width / 2;
        (right !== self.rtl) ? self.next() : self.prev();
      }
    };
    stage.addEventListener('pointerup', release);
    stage.addEventListener('pointercancel', function (ev) { release(ev); });
    stage.addEventListener('pointerleave', function () {
      if (self.state === 'peek' && self.turn) {
        var tt = self.turn, back = tt.dir > 0 ? { x: tt.C.x, y: tt.C.y } : { x: -self.W, y: tt.C.y };
        self.animate(back, 220, function () { self.endTurn(tt.dir < 0); });
      }
    });

    // toolbar and other clicks
    r.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-act],[data-goto],[data-quiz],.mb-drow');
      if (!b) return;
      if (b.classList.contains('mb-drow')) { self.closeAll(); self.goPage(+b.dataset.i); return; }
      if (b.hasAttribute('data-goto')) { ev.stopPropagation(); self.goPage(parseInt(b.getAttribute('data-goto'), 10)); return; }
      if (b.hasAttribute('data-quiz')) { ev.stopPropagation(); self.startQuiz(); return; }
      var act = b.getAttribute('data-act');
      if (act === 'next') self.next();           // the RTL footer is mirrored, so no swap is needed here
      else if (act === 'prev') self.prev();
      else if (act === 'toc') self.openDrawer();
      else if (act === 'quiz') self.startQuiz();
      else if (act === 'qclose') self.closeAll();
      else if (act === 'sound') { self.sound.on = !self.sound.on; self.setSoundIcon(); if (self.sound.on) self.sound.rustle(); }
      else if (act === 'read') self.toggleRead();
      else if (act === 'dark') { var dk = r.getAttribute('data-mode') === 'dark'; dk ? r.removeAttribute('data-mode') : r.setAttribute('data-mode', 'dark');
        try { localStorage.setItem('morphbook:mode', dk ? 'light' : 'dark'); } catch (e) {} self.fsCache = {}; }
      else if (act === 'full') { if (document.fullscreenElement) document.exitFullscreen(); else if (r.requestFullscreen) r.requestFullscreen(); }
      else if (act === 'print') self.print();
    });
    this.scrim.addEventListener('click', function () { self.closeAll(); });
    this.range.addEventListener('change', function () { self.goPage(parseInt(self.range.value, 10)); });

    var onKey = function (e) {
      if (!r.isConnected || e.target.closest && e.target.closest('input,textarea,select')) return;
      if (e.key === 'Escape') { self.closeAll(); return; }
      if (self.modal.classList.contains('on')) return;
      var fwd = self.rtl ? 'ArrowLeft' : 'ArrowRight', bwd = self.rtl ? 'ArrowRight' : 'ArrowLeft';
      if (e.key === fwd || e.key === 'PageDown') { e.preventDefault(); self.next(); }
      else if (e.key === bwd || e.key === 'PageUp') { e.preventDefault(); self.prev(); }
      else if (e.key === ' ' && e.target === document.body) { e.preventDefault(); self.next(); }
      else if (e.key === 'Home') self.goPage(0);
      else if (e.key === 'End') self.goPage(self.N - 1);
    };
    document.addEventListener('keydown', onKey);

    // glossary popovers
    var hit = function (e) { return e.target.closest ? e.target.closest('.term,.hw') : null; };
    r.addEventListener('mouseover', function (e) { var h = hit(e); if (h) self.showPop(h); });
    r.addEventListener('mouseout', function (e) { if (hit(e)) self.pop.classList.remove('on'); });
    r.addEventListener('click', function (e) { var h = hit(e); if (h) { e.stopPropagation(); self.showPop(h); } else if (!e.target.closest('.mb-pop')) self.pop.classList.remove('on'); });

    var tid, onResize = function () { clearTimeout(tid); tid = setTimeout(function () { if (r.isConnected) self.layout(false); }, 160); };
    global.addEventListener('resize', onResize);
    this._off = function () { document.removeEventListener('keydown', onKey); global.removeEventListener('resize', onResize); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { self.fsCache = {}; if (self.state === 'idle') self.render(); });
    try { if (localStorage.getItem('morphbook:mode') === 'dark') r.setAttribute('data-mode', 'dark'); } catch (e) {}
  };

  Book.prototype.destroy = function () {
    if (this.ext) { this.ext.destroy(); this.ext = null; }
    this.cancelTurn(); this.stopRead();
    if (this._off) this._off();
    if (this.sound.ctx) try { this.sound.ctx.close(); } catch (e) {}
    this.root.innerHTML = ''; this.root.className = '';
  };

  /* -------------------------------------------------------------------
     Drawer, popover, read aloud, print
     ------------------------------------------------------------------- */
  Book.prototype.openDrawer = function () { this.drawer.classList.add('open'); this.scrim.classList.add('on'); };
  Book.prototype.closeAll = function () {
    this.drawer.classList.remove('open'); this.scrim.classList.remove('on');
    this.pop.classList.remove('on'); this.modal.classList.remove('on');
  };
  Book.prototype.showPop = function (h) {
    var def = h.getAttribute('data-def'); if (!def) return;
    this.pop.firstChild.textContent = h.textContent; this.pop.lastChild.textContent = def;
    this.pop.classList.add('on');
    var rc = h.getBoundingClientRect(), w = this.pop.offsetWidth || 280;
    var left = clamp(rc.left, 8, global.innerWidth - w - 8), top = rc.bottom + 10;
    if (top + this.pop.offsetHeight > global.innerHeight - 8) top = Math.max(8, rc.top - this.pop.offsetHeight - 10);
    this.pop.style.left = left + 'px'; this.pop.style.top = top + 'px';
  };
  Book.prototype.toggleRead = function () {
    var ss = global.speechSynthesis; if (!ss) return;
    if (this.speaking) { this.stopRead(); return; }
    var self = this;
    var text = this.visiblePages().map(function (i) {
      var p = self.pages[i]; if (!p) return '';
      if (p.narration) return p.narration;
      var tmp = el('div', null, p.html || ''); return tmp.textContent.replace(/\s+/g, ' ');
    }).join('. ');
    if (!text.trim()) return;
    var u = new SpeechSynthesisUtterance(text), lang = this.meta.voiceLang || (this.rtl ? 'ar-EG' : 'en-US');
    u.lang = lang; u.rate = this.meta.voiceRate || .95;
    var voices = ss.getVoices(), best = voices.filter(function (v) { return v.lang === lang; })[0] ||
      voices.filter(function (v) { return v.lang.slice(0, 2) === lang.slice(0, 2); })[0];
    if (best) u.voice = best;
    u.onend = function () { self.stopRead(); };
    this.speaking = true;
    var b = this.root.querySelector('[data-act=read]'); b.innerHTML = this.svg('stop'); b.setAttribute('aria-pressed', 'true');
    ss.speak(u);
  };
  Book.prototype.stopRead = function () {
    if (global.speechSynthesis && this.speaking) global.speechSynthesis.cancel();
    this.speaking = false;
    var b = this.root && this.root.querySelector('[data-act=read]');
    if (b) { b.innerHTML = this.svg('read'); b.setAttribute('aria-pressed', 'false'); }
  };
  Book.prototype.print = function () {
    var self = this; this.printEl.innerHTML = '';
    this.pages.forEach(function (p, i) { self.printEl.appendChild(self.pageNode(i, 'r')); });
    global.print();
  };

  /* -------------------------------------------------------------------
     Quiz
     ------------------------------------------------------------------- */
  Book.prototype.startQuiz = function () {
    if (!this.quiz.length) return;
    this.q = { i: 0, score: 0 };
    this.modal.classList.add('on');
    this.renderQ();
  };
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  Book.prototype.renderQ = function () {
    var self = this, body = this.modal.querySelector('.mb-qbody'), item = this.quiz[this.q.i], L = this.L;
    if (!item) return this.finishQ();
    this.modal.querySelector('.mb-qfoot span').textContent = L.q + ' ' + (this.q.i + 1) + ' / ' + this.quiz.length;
    body.innerHTML = '';
    var h = el('h3'); h.textContent = item.q; body.appendChild(h);
    var answer = item.a != null ? item.a : item.correct, locked = false;
    shuffle(item.options).forEach(function (opt) {
      var b = el('button', 'mb-qopt'); b.textContent = opt;
      b.addEventListener('click', function () {
        if (locked) return; locked = true;
        var right = opt === answer;
        if (right) { self.q.score++; b.classList.add('right'); self.chime(true); }
        else {
          b.classList.add('wrong'); self.chime(false);
          Array.prototype.forEach.call(body.querySelectorAll('.mb-qopt'), function (o) { if (o.textContent === answer) o.classList.add('right'); });
        }
        if (item.explanation) { var p = el('p', 'mb-qexpl'); p.textContent = item.explanation; body.appendChild(p); }
        setTimeout(function () { self.q.i++; self.renderQ(); }, right ? 1100 : 2400);
      });
      body.appendChild(b);
    });
  };
  Book.prototype.finishQ = function () {
    var L = this.L, body = this.modal.querySelector('.mb-qbody'), n = this.quiz.length, s = this.q.score;
    var pct = Math.round(s / n * 100);
    if (s >= this.best) { this.best = s; this.scoreEl.hidden = false; this.scoreEl.textContent = '🏆 ' + s + '/' + n; }
    body.innerHTML = '<div class="mb-ring" style="--pct:' + pct + '"><span>' + pct + '%</span></div>' +
      '<h3 style="text-align:center">' + (pct >= 70 ? L.great : L.keep) + '</h3>' +
      '<p style="text-align:center">' + L.score + ': ' + s + ' / ' + n + '</p>';
    var again = el('button', 'mb-qopt'); again.style.textAlign = 'center'; again.textContent = L.again;
    var self = this; again.addEventListener('click', function () { self.startQuiz(); });
    body.appendChild(again);
    this.modal.querySelector('.mb-qfoot span').textContent = '';
    if (pct >= 70) this.chime(true, true);
  };
  Book.prototype.chime = function (good, fanfare) {
    if (!this.sound.on || !this.sound.init()) return;
    var c = this.sound.ctx, t = c.currentTime + .01, notes = good ? (fanfare ? [523, 659, 784, 1047] : [660, 880]) : [220, 196];
    notes.forEach(function (f, k) {
      var o = c.createOscillator(), g = c.createGain();
      o.type = good ? 'triangle' : 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(.0001, t + k * .09); g.gain.exponentialRampToValueAtTime(.12, t + k * .09 + .02);
      g.gain.exponentialRampToValueAtTime(.0001, t + k * .09 + .3);
      o.connect(g); g.connect(c.destination); o.start(t + k * .09); o.stop(t + k * .09 + .32);
    });
  };

  /* -------------------------------------------------------------------
     Public API
     ------------------------------------------------------------------- */
  var MorphBook = {
    version: '1.1.0',
    mount: function (root, data, opts) {
      if (typeof root === 'string') root = document.querySelector(root);
      return new Book(root, data, opts);
    },
    PaperSound: PaperSound,
    _geometry: { clipHalf: clipHalf, matrixOf: matrixOf }
  };
  global.MorphBook = MorphBook;
})(typeof window !== 'undefined' ? window : this);
