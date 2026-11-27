/*!
 * MorphBook extras 1.1 — part of the MorphBook engine (load right after morphbook.js).
 * Turned on for every book automatically. Adds:
 *   · page types: practice (flip · fill · sort · order), video, picture, lab, glossary
 *   · automatic glossary: terms listed once (meta.glossary or any .term already in the book) are linked on every page,
 *     Arabic prefixes included (و ف ب ك ل ال)
 *   · search the whole book ("/" key), select-a-word bar (meaning · search · online · listen)
 *   · reading progress (✓ in the contents, time per page), labs that pause when their page is not on screen
 *   · picture slots (copy the AI image prompt, upload, save a copy with the pictures inside)
 * Turn off for one book with  MorphBook.mount(el, data, { extras: false })  or  meta.extras = false.
 */
(function (global) {
  'use strict';
  var MorphBook = global.MorphBook; if (!MorphBook) return;

  /* ------------------------------------------------------------ strings */
  var S = {
    en: { search: 'Search the book', searchPh: 'Search the book… (e.g. evaporation)', type2: 'Type a word of two letters or more…', none: 'No results in this book',
      page: 'Page', times: function (n, d) { return n === 2 ? 'twice' : d + ' times'; }, meaning: '📖 Meaning', inBook: '🔎 In the book', online: '🌐 Online', listen: '🔊 Listen',
      notIn: 'This word is not in the book’s glossary.', findMeaning: '🌐 Look up its meaning', explained: '↩ Explained on page', offline: 'You are offline right now',
      noVoice: 'Reading aloud is not available in this browser', copied: 'Copied ✓', tapFlip: 'tap the card to flip it', meaningLbl: 'meaning', prev: '→ Previous', next: 'Next →',
      prevL: '← Previous', nextL: 'Next →', score: 'Your score', of: 'of', again: 'Try again', result: 'See result', right: '✔ Well done! ', wrong: '✘ Not this one. ',
      pickFirst: 'Pick a card first', wrongBin: 'Not this group — try the other one', allSorted: '✔ All cards sorted — well done!', rightSentence: '✔ Correct sentence!',
      correctIs: '✘ The correct order: ', restart: '↺ Start the sentence again', allBuilt: '🌟 Well done! You built every sentence.', fromStart: 'Start again',
      play: '▶ Play the video', watchOn: '▶ Watch on YouTube ↗', noVideo: 'No video link has been added yet.', videoOff: '📡 You are offline.<br>The video needs internet; the rest of the book works without it.',
      retry: 'Try again', videoNote: 'The video needs internet; the rest of the book works offline.',
      slot: '🖼️ Picture space', slotHow: 'Copy the picture description → paste it into ChatGPT, Gemini or Codex → upload the picture here (or drag it in)',
      copyPrompt: '🎨 Copy the picture description', upload: '⬆ Upload a picture', change: '⬆ Change', saveCopy: '💾 Save a copy with the picture', remove: 'Remove the picture',
      added: 'Picture added ✓', tooBig: 'The picture is too big to keep here — save a copy of the book', saving: 'Saving a copy of the book with its pictures…', withPics: 'with pictures',
      glossary: 'Glossary', labRun: 'lab running', labStop: 'lab paused', sun: 'Sun heat', vapour: 'rising vapour', heat: 'heat' },
    'ar-fusha': { search: 'ابحث في الكتاب', searchPh: 'ابحث في الكتاب… (مثال: التكاثف)', type2: 'اكتب كلمةً من حرفين أو أكثر…', none: 'لا توجد نتائج في هذا الكتاب',
      page: 'صفحة', times: function (n, d) { return n === 2 ? 'مرّتان' : d + (n <= 10 ? ' مرّات' : ' مرّة'); }, meaning: '📖 المعنى', inBook: '🔎 في الكتاب', online: '🌐 أونلاين', listen: '🔊 استمع',
      notIn: 'هذه الكلمة ليست في مسرد الكتاب.', findMeaning: '🌐 ابحث عن معناها', explained: '↩ صفحة الشرح', offline: 'أنت غير متّصل بالإنترنت الآن',
      noVoice: 'النطق غير متاح في هذا المتصفّح', copied: 'تمّ النسخ ✓', tapFlip: 'اضغط البطاقة لتقلبها', meaningLbl: 'المعنى', prev: '→ السابقة', next: 'التالية ←',
      prevL: '→ السابقة', nextL: 'التالية ←', score: 'نتيجتك', of: 'من', again: 'أعِد المحاولة', result: 'النتيجة', right: '✔ أحسنت! ', wrong: '✘ ليست هذه. ',
      pickFirst: 'اختر بطاقةً أوّلًا', wrongBin: 'ليست هذه المجموعة — جرّب الأخرى', allSorted: '✔ صنّفت كلّ البطاقات — أحسنت!', rightSentence: '✔ جملةٌ صحيحة!',
      correctIs: '✘ الترتيب الصحيح: ', restart: '↺ ابدأ الجملة من جديد', allBuilt: '🌟 أحسنت! بنيت كلّ الجمل.', fromStart: 'من جديد',
      play: '▶ شغّل الفيديو', watchOn: '▶ شاهِد على يوتيوب ↗', noVideo: 'لم يُضَف رابط الفيديو بعد.', videoOff: '📡 أنت غير متّصل بالإنترنت.<br>يحتاج الفيديو إلى اتصال، وباقي الكتاب يعمل بدونه.',
      retry: 'حاول مرّةً أخرى', videoNote: 'يحتاج الفيديو إلى اتصالٍ بالإنترنت، وباقي الكتاب يعمل بدونه.',
      slot: '🖼️ مكان صورة', slotHow: 'انسخ وصف الصورة ← ألصقه في ChatGPT أو Gemini أو Codex ← ارفع الصورة هنا (أو اسحبها وأفلتها)',
      copyPrompt: '🎨 انسخ وصف الصورة', upload: '⬆ ارفع صورة', change: '⬆ تغيير', saveCopy: '💾 احفظ نسخةً بالصورة', remove: 'احذف الصورة',
      added: 'أُضيفت الصورة ✓', tooBig: 'الصورة أكبر من مساحة التخزين — احفظ نسخةً من الكتاب', saving: 'جارٍ حفظ نسخةٍ من الكتاب بالصور…', withPics: 'مع الصور',
      glossary: 'مسرد المصطلحات', labRun: 'المختبر يعمل', labStop: 'المختبر متوقّف', sun: 'حرارة الشمس', vapour: 'جزيئات بخارٍ صاعدة الآن', heat: 'حرارة الشمس' }
  };
  S.ar = Object.assign({}, S['ar-fusha'], {      // Egyptian label set for books written in colloquial
    searchPh: 'دوّر في الكتاب… (مثلًا: التكاثف)', search: 'دوّر في الكتاب', type2: 'اكتب كلمة من حرفين أو أكتر…', none: 'مفيش نتايج في الكتاب ده',
    notIn: 'الكلمة دي مش في قاموس الكتاب.', findMeaning: '🌐 دوّر على معناها', offline: 'إنت مش متوصّل بالنت دلوقتي', copied: 'اتنسخ ✓',
    tapFlip: 'دوس على الكارت عشان تقلبه', score: 'نتيجتك', again: 'جرّب تاني', right: '✔ برافو! ', wrong: '✘ مش دي. ', pickFirst: 'اختار كارت الأول',
    wrongBin: 'مش المجموعة دي — جرّب التانية', allSorted: '✔ صنّفت كل الكروت — برافو!', rightSentence: '✔ جملة صح!', correctIs: '✘ الترتيب الصح: ',
    restart: '↺ ابدأ الجملة من الأول', allBuilt: '🌟 برافو! كوّنت كل الجمل.', fromStart: 'من الأول', play: '▶ شغّل الفيديو', watchOn: '▶ اتفرّج على يوتيوب ↗',
    noVideo: 'لسه ماتحطّش لينك الفيديو.', videoOff: '📡 إنت مش متوصّل بالنت.<br>الفيديو محتاج نت، وباقي الكتاب شغّال من غيره.', retry: 'جرّب تاني',
    videoNote: 'الفيديو محتاج نت، وباقي الكتاب شغّال من غيره.', slot: '🖼️ مكان صورة', slotHow: 'انسخ وصف الصورة ← حطّه في ChatGPT أو Gemini أو Codex ← ارفع الصورة هنا (أو اسحبها)',
    copyPrompt: '🎨 انسخ وصف الصورة', upload: '⬆ ارفع صورة', change: '⬆ غيّر', saveCopy: '💾 احفظ نسخة بالصورة', added: 'الصورة اتضافت ✓',
    tooBig: 'الصورة كبيرة على التخزين هنا — احفظ نسخة من الكتاب', saving: 'بنحفظ نسخة من الكتاب بالصور…', glossary: 'قاموس الكلمات',
    labRun: 'المعمل شغّال', labStop: 'المعمل واقف', vapour: 'جزيئات بخار طالعة دلوقتي'
  });
  function strings(book) {
    var m = book.meta || {}, lang = m.lang || (book.rtl ? 'ar' : 'en');
    var key = lang === 'ar' ? (m.arabic === 'fusha' ? 'ar-fusha' : 'ar') : 'en';
    return Object.assign({}, S[key] || S.en, m.extrasLabels || {});
  }

  /* ------------------------------------------------------------ helpers */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function attr(o) { return esc(JSON.stringify(o)); }
  var AD = '٠١٢٣٤٥٦٧٨٩';
  function digits(book, n) { return book.rtl && (book.meta.lang || 'ar') === 'ar' ? String(n).replace(/\d/g, function (d) { return AD[d]; }) : String(n); }
  var DIAC_RE = /[ً-ْـٰ]/;
  function normMap(s) {                         // Arabic-tolerant matching, with a map back to the original characters
    var out = '', map = [];
    for (var i = 0; i < s.length; i++) {
      var c = s[i]; if (DIAC_RE.test(c)) continue;
      if ('أإآٱ'.indexOf(c) >= 0) c = 'ا'; else if (c === 'ى') c = 'ي'; else if (c === 'ة') c = 'ه'; else c = c.toLowerCase();
      out += c; map.push(i);
    }
    return { s: out, map: map };
  }
  function norm(s) { return normMap(s).s; }
  function stripPrefix(w) { return w.replace(/^(?:وال|فال|بال|كال|لل|ال|و|ف|ب|ل|ك)(?=..)/, ''); }
  function ytId(s) { s = String(s || '').trim(); var m = s.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/); return m ? m[1] : (/^[\w-]{11}$/.test(s) ? s : ''); }
  function parse(html) { var t = document.createElement('template'); t.innerHTML = html; return t; }

  /* ------------------------------------------------------------ labs (add your own: MorphBook.labs.name = { html, run }) */
  var LABS = MorphBook.labs = MorphBook.labs || {};
  LABS.evaporation = {
    html: function (p, T) {
      return '<div class="lab2" data-live="evaporation"><canvas width="560" height="300" aria-label="' + esc(p.title || T.sun) + '"></canvas>' +
        '<label class="lab2-ctl">' + esc(p.control || T.sun) + ' <input type="range" min="0" max="100" value="' + (p.value != null ? +p.value : 55) + '" aria-label="' + esc(p.control || T.sun) + '"></label>' +
        '<p class="lab2-out" aria-live="polite">…</p></div>';
    },
    run: function (wrap, api) {
      var cv = wrap.querySelector('canvas'), ctx = cv.getContext('2d'), range = wrap.querySelector('input'), out = wrap.querySelector('.lab2-out'), T = api.T;
      var W = cv.width, H = cv.height, parts = [], raf = 0, on = false, last = 0, acc = 0;
      var st = api.state(); if (st.v != null) range.value = st.v;
      range.addEventListener('input', function () { st.v = +range.value; if (!on) draw(); });
      function step(dt) {
        var heat = +range.value / 100; acc += dt * (2 + heat * 26);
        while (acc > 1) { acc--; parts.push({ x: 40 + Math.random() * (W - 80), y: H - 70, v: 20 + heat * 70 + Math.random() * 20, w: Math.random() * 6.28 }); }
        parts.forEach(function (q) { q.y -= q.v * dt; q.w += dt * 2; q.x += Math.sin(q.w) * .4; });
        parts = parts.filter(function (q) { return q.y > 40; });
      }
      function draw() {
        var heat = +range.value / 100;
        var g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#8fd0ff'); g.addColorStop(1, '#e8f6ff'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(255,255,255,.95)'; [[380, 42], [420, 34], [455, 44]].forEach(function (c) { ctx.beginPath(); ctx.arc(c[0], c[1], 26, 0, 7); ctx.fill(); });
        var sr = 22 + heat * 18; ctx.fillStyle = 'rgba(255,200,60,' + (.25 + heat * .35) + ')'; ctx.beginPath(); ctx.arc(70, 58, sr * 1.7, 0, 7); ctx.fill();
        ctx.fillStyle = '#ffc93c'; ctx.beginPath(); ctx.arc(70, 58, sr, 0, 7); ctx.fill();
        ctx.fillStyle = '#2f8fd8'; ctx.fillRect(0, H - 64, W, 64); ctx.fillStyle = '#5bb2f0';
        for (var x = 0; x < W; x += 40) { ctx.beginPath(); ctx.arc(x + 20, H - 64, 20, Math.PI, 0); ctx.fill(); }
        parts.forEach(function (q) { ctx.fillStyle = 'rgba(255,255,255,' + Math.min(.95, (q.y - 40) / 120) + ')'; ctx.beginPath(); ctx.arc(q.x, q.y, 5, 0, 7); ctx.fill(); });
        out.textContent = (T.heat) + ': ' + api.digits(range.value) + '٪ · ' + T.vapour + ': ' + api.digits(parts.length) + ' · ' + (on ? T.labRun : T.labStop);
      }
      function frame(t) { if (!on) return; var dt = Math.min(.05, (t - last) / 1000 || 0); last = t; step(dt); draw(); api.frame(); raf = requestAnimationFrame(frame); }
      draw();
      return { start: function () { if (on) return; on = true; last = performance.now(); raf = requestAnimationFrame(frame); },
               stop: function () { on = false; cancelAnimationFrame(raf); draw(); }, get on() { return on; } };
    }
  };
  LABS.vapour = LABS.evaporation;

  /* ------------------------------------------------------------ page types -> HTML (runs inside prepPages, before anything is drawn) */
  function pg(book, i, cls, body) { return '<div class="pg ' + (cls || '') + '">' + body + '<div class="pgnum">' + digits(book, i + 1) + '</div></div>'; }
  function head(p) { return (p.title ? '<h2>' + esc(p.title) + '</h2>' : '') + (p.intro ? '<p class="tag">' + esc(p.intro) + '</p>' : ''); }
  var KINDS = {
    practice: function (p, i, book, T) {
      var kind = p.kind || 'fill', data = kind === 'sort' ? { bins: p.bins || [], items: p.items || [] } : (p.items || p.cards || []);
      return pg(book, i, 'pg-practice', head(p) + '<div class="px px-' + esc(kind) + '" data-practice="' + esc(kind) + '" data-items="' + attr(data) + '"><div class="px-wait">…</div></div>');
    },
    video: function (p, i, book, T) {
      return pg(book, i, 'pg-video', head(p) + '<div class="yt" data-youtube="' + esc(ytId(p.youtube || p.url)) + '" data-title="' + esc(p.videoTitle || p.title || '') + '"><div class="yt-wait">▶</div></div>' +
        '<p class="yt-note">' + esc(p.note || T.videoNote) + '</p>');
    },
    picture: function (p, i, book, T) {
      return pg(book, i, 'pg-picture', head(p) + '<div class="imgslot" style="aspect-ratio:' + esc(p.ratio || '4/3') + '" data-slot="' + esc(p.slot || ('picture-' + (i + 1))) +
        '" data-prompt="' + esc(p.prompt || '') + '"' + (p.image ? ' data-src="' + esc(p.image) + '"' : '') + '><div class="imgslot-wait">…</div></div>' + (p.after ? '<p>' + esc(p.after) + '</p>' : ''));
    },
    lab: function (p, i, book, T) {
      var L = LABS[p.lab || 'evaporation'];
      return pg(book, i, 'pg-lab', head(p) + (L ? L.html(p, T) : '<p>Unknown lab: ' + esc(p.lab) + '</p>') +
        (p.note ? '<div class="kterm"><b>' + esc(p.noteTitle || '💡') + '</b><span>' + esc(p.note) + '</span></div>' : ''));
    }
  };
  function harvestGlossary(book) {
    var list = [], seen = {};
    function add(term, def, page) { var k = norm(term).trim(); if (!k || seen[k] != null) { if (seen[k] != null && list[seen[k]].page == null && page != null) list[seen[k]].page = page; return; } seen[k] = list.length; list.push({ term: term, def: def, page: page }); }
    (book.meta.glossary || []).forEach(function (g) { if (g && g.term) add(String(g.term), String(g.def || ''), g.page != null ? +g.page : null); });
    book.pages.forEach(function (p, i) {
      if (!p.html || p.html.indexOf('term') < 0) return;
      Array.prototype.forEach.call(parse(p.html).content.querySelectorAll('.term[data-def]'), function (t) { add(t.textContent.trim(), t.getAttribute('data-def'), i); });
    });
    return list;
  }
  var LET = '\\u0621-\\u064A\\w';
  function termRegex(term) {
    var plain = term.replace(/[ً-ْـٰ]/g, '').trim(), arabic = /[ء-ي]/.test(plain);
    var core = arabic && /^ال/.test(plain) && plain.length > 4 ? plain.slice(2) : plain;
    var D = '[\\u064B-\\u0652\\u0640\\u0670]*';
    var body = core.split('').map(function (ch) { return /\s/.test(ch) ? '\\s+' : ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + (arabic ? D : ''); }).join('');
    var pre = arabic ? '(?:[وف]' + D + ')?(?:[بكل]' + D + ')?(?:ال|ل)?' : '';
    try { return new RegExp('(^|[^' + LET + '])(' + pre + body + ')(?![' + LET + '])', arabic ? 'u' : 'iu'); } catch (e) { return null; }
  }
  var SKIP = 'h1,h2,h3,h4,button,a,svg,script,style,.term,.hw,.px,.yt,.imgslot,.lab2,.pgnum,.tocrow,.gloss,.mb-noterm,[data-noterm],.dlg>b,.kterm>b';
  function autolink(book, gl) {
    if (book.meta.autoGlossary === false || !gl.length) return 0;
    var rx = gl.map(function (g) { return { g: g, re: termRegex(g.term), n: norm(g.term) }; }).filter(function (x) { return x.re; })
      .sort(function (a, b) { return b.n.length - a.n.length; });
    var count = 0;
    book.pages.forEach(function (p) {
      if (p.type !== 'html' || !p.html || p.autoGlossary === false || p.glossaryPage) return;
      var t = parse(p.html), root = t.content, used = {}, changed = false;
      Array.prototype.forEach.call(root.querySelectorAll('.term'), function (x) { used[norm(x.textContent.trim())] = 1; });
      rx.forEach(function (x) {
        if (used[x.n]) return;
        var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n;
        while ((n = w.nextNode())) {
          if (!n.nodeValue.trim() || (n.parentElement && n.parentElement.closest(SKIP))) continue;
          var m = x.re.exec(n.nodeValue); if (!m) continue;
          var start = m.index + m[1].length, r = document.createRange();
          r.setStart(n, start); r.setEnd(n, start + m[2].length);
          var span = document.createElement('span'); span.className = 'term'; span.setAttribute('data-def', x.g.def);
          try { r.surroundContents(span); used[x.n] = 1; changed = true; count++; } catch (e) {}
          break;
        }
      });
      if (changed) p.html = t.innerHTML;
    });
    return count;
  }
  MorphBook.prepareExtras = function (book) {
    if (book.opts.extras === false || book.meta.extras === false) return;
    var T = strings(book);
    book.pages.forEach(function (p, i) {
      p.type = p.type || (p.image ? 'image' : 'html');
      if (KINDS[p.type]) {
        p.narration = p.narration || [p.title, p.intro].filter(Boolean).join('. ');
        p.html = KINDS[p.type](p, i, book, T); p.kind0 = p.type; p.type = 'html';
      }
    });
    var gl = harvestGlossary(book);
    book.glossary = gl;
    book.autoLinked = autolink(book, gl);
    book.pages.forEach(function (p, i) {
      if (p.type !== 'glossary') return;
      p.glossaryPage = true; p.type = 'html';
      var rows = gl.slice().sort(function (a, b) { return stripPrefix(norm(a.term)).localeCompare(stripPrefix(norm(b.term)), book.meta.lang || 'en'); }).map(function (g) {
        return '<li><button class="glrow"' + (g.page != null ? ' data-goto="' + g.page + '"' : '') + '><b>' + esc(g.term) + '</b><span>' + esc(g.def) + '</span></button></li>';
      }).join('');
      p.title = p.title || T.glossary;
      p.html = pg(book, i, 'pg-glossary', '<h2>' + esc(p.title) + '</h2>' + (p.intro ? '<p class="tag">' + esc(p.intro) + '</p>' : '') + '<ul class="gloss">' + rows + '</ul>');
    });
  };

  /* ------------------------------------------------------------ runtime (one per mounted book; destroy() undoes everything) */
  MorphBook.extras = function (book) {
    if (book.opts.extras === false || book.meta.extras === false) return null;
    var root = book.root, meta = book.meta || {}, pages = book.pages || [], T = strings(book);
    var ID = meta.id || meta.title || 'book', GL = book.glossary || [];
    var offs = [], timers = [], nodes = [], lastVis = [], running = [];
    var api = { stats: { labFrames: 0, labRunning: false }, hydrated: 0 };
    function on(t, ev, fn, o) { t.addEventListener(ev, fn, o); offs.push(function () { t.removeEventListener(ev, fn, o); }); }
    function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
    function keep(n, parent) { n.setAttribute('data-mbx', ''); (parent || document.body).appendChild(n); nodes.push(n); return n; }
    function num(n) { return digits(book, n); }
    function pageOf(n) { var p = n.closest && n.closest('.mb-page'); return p ? +p.dataset.i : -1; }
    function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
    function each(sel, fn, scope) { Array.prototype.forEach.call((scope || root).querySelectorAll(sel), fn); }
    var toastEl = keep(el('div', 'mbx-toast')), toastT = 0;
    function toast(m) { toastEl.textContent = m; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('on'); }, 2200); }
    function copy(text) {
      var done = function () { toast(T.copied); };
      var fb = function () { var t = el('textarea'); t.value = text; t.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (e) {} t.remove(); done(); };
      try { navigator.clipboard.writeText(text).then(done, fb); } catch (e) { fb(); }
    }
    function speak(text) {
      try { speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(text); u.lang = meta.voiceLang || (book.rtl ? 'ar-EG' : 'en-US'); speechSynthesis.speak(u); } catch (e) { toast(T.noVoice); }
    }
    function chime(ok) { try { book.chime(ok); } catch (e) {} }
    // the engine must not start a page turn from our interactive areas
    on(document, 'pointerdown', function (e) { if (e.target.closest && root.contains(e.target) && e.target.closest('.px,.lab2,.yt,.imgslot,.mbx-panel')) e.stopPropagation(); }, true);

    /* ---- search ---- */
    var INDEX = pages.map(function (p, i) {
      var d = parse(p.html || '').content, extra = [];
      Array.prototype.forEach.call(d.querySelectorAll('[data-items]'), function (x) {
        (x.getAttribute('data-items').match(/"(?:s|front|back|t|words)":\s*("[^"]+"|\[[^\]]*\])/g) || []).forEach(function (m) { extra.push(m.replace(/^"[a-z]+":\s*/, '').replace(/[\[\]"]/g, ' ')); });
      });
      Array.prototype.forEach.call(d.querySelectorAll('svg,script,style'), function (x) { x.remove(); });
      var raw = [p.title || '', d.textContent, p.type === 'image' ? (p.narration || '') : '', extra.join(' · ')].join(' · ').replace(/\s+/g, ' ').trim();
      return { i: i, title: p.title || '', raw: raw, nm: normMap(raw) };
    });
    function doSearch(q) {
      var nq = norm(q.trim()); if (nq.length < 2) return [];
      var out = [];
      INDEX.forEach(function (it) {
        var pos = it.nm.s.indexOf(nq); if (pos < 0) return;
        var a = it.nm.map[pos], b = it.nm.map[pos + nq.length - 1] + 1, s0 = Math.max(0, a - 40), s1 = Math.min(it.raw.length, b + 50);
        out.push({ i: it.i, title: it.title, count: it.nm.s.split(nq).length - 1,
          snip: (s0 > 0 ? '…' : '') + esc(it.raw.slice(s0, a)) + '<mark>' + esc(it.raw.slice(a, b)) + '</mark>' + esc(it.raw.slice(b, s1)) + (s1 < it.raw.length ? '…' : '') });
      });
      return out;
    }
    var panel = keep(el('div', 'mbx-panel', '<input type="search" placeholder="' + esc(T.searchPh) + '" aria-label="' + esc(T.search) + '"><div class="mbx-res" role="listbox"></div>'), root);
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', T.search);
    var sIn = panel.querySelector('input'), sRes = panel.querySelector('.mbx-res'), sT = 0;
    function results() {
      var q = sIn.value, r = doSearch(q);
      if (norm(q.trim()).length < 2) { sRes.innerHTML = '<div class="mbx-empty">' + esc(T.type2) + '</div>'; return; }
      if (!r.length) { sRes.innerHTML = '<div class="mbx-empty">' + esc(T.none) + '</div>'; return; }
      sRes.innerHTML = r.map(function (x) {
        return '<button data-sp="' + x.i + '"><b>' + esc(T.page) + ' ' + num(x.i + 1) + ' · ' + esc(x.title) + (x.count > 1 ? ' (' + esc(T.times(x.count, num(x.count))) + ')' : '') + '</b><small>' + x.snip + '</small></button>';
      }).join('');
    }
    function openSearch(q) { panel.classList.add('open'); if (q != null) sIn.value = q; results(); try { sIn.focus({ preventScroll: true }); sIn.select(); } catch (e) {} }
    function closeSearch() { panel.classList.remove('open'); }
    on(sIn, 'input', function () { clearTimeout(sT); sT = setTimeout(results, 120); });
    on(sIn, 'keydown', function (e) { if (e.key === 'Enter') { var f = sRes.querySelector('[data-sp]'); if (f) f.click(); } if (e.key === 'Escape') closeSearch(); e.stopPropagation(); });
    on(sRes, 'click', function (e) {
      var b = e.target.closest('[data-sp]'); if (!b) return;
      var i = +b.dataset.sp, q = sIn.value; closeSearch(); book.goPage(i);
      timers.push(setTimeout(function () { highlight(i, q); }, 700));
    });
    function unmark() { each('mark.mbx-hit', function (m) { var p = m.parentNode; p.replaceChild(document.createTextNode(m.textContent), m); p.normalize(); }); }
    function highlight(i, q) {
      unmark(); var nq = norm(q.trim()); if (nq.length < 2) return;
      var node = root.querySelector('.mb-slot .mb-page[data-i="' + i + '"]'); if (!node) return;
      var w = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null), list = [];
      while (w.nextNode()) list.push(w.currentNode);
      list.forEach(function (t) {
        if (t.parentElement.closest('svg,script,style')) return;
        var m = normMap(t.nodeValue), pos = m.s.indexOf(nq); if (pos < 0) return;
        var r = document.createRange(); r.setStart(t, m.map[pos]); r.setEnd(t, m.map[pos + nq.length - 1] + 1);
        try { r.surroundContents(el('mark', 'mbx-hit')); } catch (e) {}
      });
      api.lastHighlights = root.querySelectorAll('mark.mbx-hit').length;
      timers.push(setTimeout(unmark, 9000));
    }
    var bar = root.querySelector('.mb-bar'), sb = null;
    if (bar) {
      sb = el('button', 'mb-tool', '<svg viewBox="0 0 24 24" aria-hidden="true" style="fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/></svg>');
      sb.setAttribute('data-act', 'mbx-search'); sb.setAttribute('aria-label', T.search); sb.title = T.search + ' ( / )';
      bar.insertBefore(sb, bar.querySelector('[data-act=quiz]') || bar.querySelector('[data-act=sound]') || null);
      nodes.push(sb);
      on(sb, 'click', function (e) { e.stopPropagation(); panel.classList.contains('open') ? closeSearch() : openSearch(); });
    }
    on(document, 'keydown', function (e) {
      if (!document.contains(root) || (e.target.closest && e.target.closest('input,textarea,select,[contenteditable]'))) return;
      if (e.key === '/') { e.preventDefault(); openSearch(); }
      else if (e.key === 'Escape') { closeSearch(); hideSel(); hideCard(); }
    });
    on(document, 'click', function (e) { if (panel.classList.contains('open') && !e.target.closest('.mbx-panel,[data-act=mbx-search]')) closeSearch(); });

    /* ---- select a word ---- */
    var selBar = keep(el('div', 'mbx-sel', '<button data-s="mean">' + T.meaning + '</button><button data-s="find">' + T.inBook + '</button><button data-s="web">' + T.online + '</button><button data-s="say">' + T.listen + '</button>'));
    var card = keep(el('div', 'mbx-card')), selText = '', selRect = null;
    function place(box, r) {
      box.style.left = '0px'; box.style.top = '0px';
      var w = box.offsetWidth, h = box.offsetHeight, x = r.left + r.width / 2 - w / 2, y = r.top - h - 10;
      if (y < 8) y = r.bottom + 10;
      box.style.left = Math.max(8, Math.min(innerWidth - w - 8, x)) + 'px'; box.style.top = Math.max(8, Math.min(innerHeight - h - 8, y)) + 'px';
    }
    function hideSel() { selBar.classList.remove('open'); }
    function hideCard() { card.classList.remove('open'); }
    function onSelect() {
      timers.push(setTimeout(function () {
        var s = window.getSelection(), q = s ? s.toString().replace(/\s+/g, ' ').trim() : '';
        if (!q || q.length < 2 || q.length > 50 || !s.anchorNode || !s.anchorNode.parentElement || !s.anchorNode.parentElement.closest('.mb-slot .pg') || !root.contains(s.anchorNode)) return;
        selText = q; selRect = s.getRangeAt(0).getBoundingClientRect(); selBar.classList.add('open'); place(selBar, selRect); api.selection = q;
      }, 20));
    }
    on(root, 'mouseup', onSelect); on(root, 'touchend', onSelect);
    function findTerm(q) {
      var a = norm(q), b = stripPrefix(a);
      for (var i = 0; i < GL.length; i++) { var t = norm(GL[i].term), tb = stripPrefix(t); if (t === a || tb === b || tb === a || t === b) return GL[i]; }
      return null;
    }
    function web(q) { if (!navigator.onLine) { toast(T.offline); return; } window.open('https://www.google.com/search?q=' + encodeURIComponent((book.rtl ? 'معنى ' : 'meaning of ') + q), '_blank', 'noopener'); }
    function showMeaning(q, r) {
      var g = findTerm(q);
      card.innerHTML = g
        ? '<h5>' + esc(g.term) + '</h5><div>' + esc(g.def) + '</div><div class="row">' + (g.page != null ? '<button data-c="go" data-p="' + g.page + '">' + esc(T.explained) + ' (' + num(g.page + 1) + ')</button>' : '') + '<button data-c="say">' + T.listen + '</button></div>'
        : '<h5>' + esc(q) + '</h5><div>' + esc(T.notIn) + '</div><div class="row"><button data-c="web">' + T.findMeaning + '</button><button data-c="say">' + T.listen + '</button></div>';
      card.dataset.q = q; card.classList.add('open'); place(card, r); api.meaning = g ? g.term : null;
    }
    on(selBar, 'click', function (e) {
      var b = e.target.closest('[data-s]'); if (!b) return; var k = b.dataset.s; hideSel();
      if (k === 'mean') showMeaning(selText, selRect);
      else if (k === 'find') { window.getSelection().removeAllRanges(); openSearch(selText); }
      else if (k === 'web') web(selText); else if (k === 'say') speak(selText);
    });
    on(card, 'click', function (e) {
      var b = e.target.closest('[data-c]'); if (!b) return;
      if (b.dataset.c === 'go') { hideCard(); book.goPage(+b.dataset.p); }
      else if (b.dataset.c === 'web') web(card.dataset.q); else if (b.dataset.c === 'say') speak(card.querySelector('h5').textContent);
    });
    on(document, 'pointerdown', function (e) { if (!e.target.closest('.mbx-sel')) hideSel(); if (!e.target.closest('.mbx-card,.mbx-sel')) hideCard(); });

    /* ---- practice ---- */
    var PST = {};
    function shuffleOnce(st, key, n) {
      if (!st[key]) { var a = []; for (var i = 0; i < n; i++) a.push(i); for (var j = n - 1; j > 0; j--) { var k = Math.floor(Math.random() * (j + 1)), t = a[j]; a[j] = a[k]; a[k] = t; }
        if (n > 1 && a.every(function (v, i) { return v === i; })) a.reverse(); st[key] = a; }
      return st[key];
    }
    var PR = {
      flip: function (box, D, st) {
        st.i = st.i || 0; var c = D[st.i] || {};
        box.innerHTML = '<div class="px-count">' + num(st.i + 1) + ' / ' + num(D.length) + ' · ' + esc(st.back ? T.meaningLbl : T.tapFlip) + '</div>' +
          '<button class="px-card' + (st.back ? ' back' : '') + '" data-a="flip">' + esc(st.back ? c.back : c.front) + '</button>' +
          '<div class="px-row"><button class="px-btn" data-a="prev">' + esc(book.rtl ? T.prev : T.prevL) + '</button><button class="px-btn pri" data-a="next">' + esc(book.rtl ? T.next : T.nextL) + '</button></div>';
      },
      fill: function (box, D, st) {
        st.i = st.i || 0; st.score = st.score || 0;
        if (st.i >= D.length) { box.innerHTML = '<div class="px-sent" style="margin:auto">' + esc(T.score) + ': ' + num(st.score) + ' ' + esc(T.of) + ' ' + num(D.length) + (st.score === D.length ? ' 🌟' : '') + '</div><div class="px-row"><button class="px-btn pri" data-a="again">' + esc(T.again) + '</button></div>'; return; }
        var it = D[st.i], ans = st.ans, gap = ans == null ? '＿＿＿' : esc(it.o[it.a]);
        box.innerHTML = '<div class="px-count">' + num(st.i + 1) + ' / ' + num(D.length) + '</div>' +
          '<div class="px-sent">' + esc(it.s).replace('___', '<span class="px-gap">' + gap + '</span>') + '</div>' +
          '<div class="px-row">' + it.o.map(function (o, k) { var cls = ans == null ? '' : (k === it.a ? ' ok' : (k === ans ? ' bad' : ''));
            return '<button class="px-btn' + cls + '" data-a="pick" data-k="' + k + '"' + (ans != null ? ' disabled' : '') + '>' + esc(o) + '</button>'; }).join('') + '</div>' +
          '<div class="px-fb ' + (ans == null ? '' : ans === it.a ? 'ok' : 'bad') + '">' + (ans == null ? '' : esc(ans === it.a ? T.right : T.wrong) + esc(it.e || '')) + '</div>' +
          (ans != null ? '<div class="px-row"><button class="px-btn pri" data-a="next">' + esc(st.i + 1 < D.length ? (book.rtl ? T.next : T.nextL) : T.result) + '</button></div>' : '');
      },
      sort: function (box, D, st) {
        st.placed = st.placed || {};
        var order = shuffleOnce(st, 'order', D.items.length), left = order.filter(function (k) { return st.placed[k] == null; });
        box.innerHTML = '<div class="px-row">' + (left.length ? left.map(function (k) {
            return '<button class="px-btn' + (st.sel === k ? ' sel' : '') + (st.wrong === k ? ' bad' : '') + '" data-a="sel" data-k="' + k + '">' + esc(D.items[k].t) + '</button>'; }).join('')
            : '<span class="px-fb ok">' + esc(T.allSorted) + '</span>') + '</div>' +
          '<div class="px-bins">' + D.bins.map(function (b, bi) {
            return '<button class="px-bin" data-a="bin" data-b="' + bi + '"><h4>' + esc(b) + '</h4>' + order.filter(function (k) { return st.placed[k] === bi; }).map(function (k) {
              return '<span class="px-btn ok px-chip">' + esc(D.items[k].t) + '</span>'; }).join('') + '</button>'; }).join('') + '</div>' +
          '<div class="px-fb ' + (st.msgOk ? 'ok' : 'bad') + '">' + esc(st.msg || '') + '</div>';
      },
      order: function (box, D, st) {
        st.i = st.i || 0; st.pick = st.pick || [];
        if (st.i >= D.length) { box.innerHTML = '<div class="px-sent" style="margin:auto">' + esc(T.allBuilt) + '</div><div class="px-row"><button class="px-btn pri" data-a="again">' + esc(T.fromStart) + '</button></div>'; return; }
        var it = D[st.i], sh = shuffleOnce(st, 'sh' + st.i, it.words.length), full = st.pick.length === it.words.length, ok = full && st.pick.every(function (k, j) { return k === j; });
        box.innerHTML = '<div class="px-count">' + num(st.i + 1) + ' / ' + num(D.length) + (it.hint ? ' · ' + esc(it.hint) : '') + '</div>' +
          '<div class="px-line">' + st.pick.map(function (k) { return '<span class="px-btn sel">' + esc(it.words[k]) + '</span>'; }).join('') + '</div>' +
          '<div class="px-row">' + sh.map(function (k) { var used = st.pick.indexOf(k) >= 0; return '<button class="px-btn" data-a="word" data-k="' + k + '"' + (used || full ? ' disabled' : '') + '>' + esc(it.words[k]) + '</button>'; }).join('') + '</div>' +
          '<div class="px-fb ' + (full ? (ok ? 'ok' : 'bad') : '') + '">' + (full ? esc(ok ? T.rightSentence : T.correctIs + it.words.join(' ')) : '') + '</div>' +
          '<div class="px-row">' + (full && ok ? '<button class="px-btn pri" data-a="next">' + esc(book.rtl ? T.next : T.nextL) + '</button>' : '<button class="px-btn" data-a="reset">' + esc(T.restart) + '</button>') + '</div>';
      }
    };
    function practiceClick(kind, D, st, b) {
      var a = b.dataset.a, k = +b.dataset.k;
      if (kind === 'flip') {
        if (a === 'flip') st.back = !st.back;
        if (a === 'next') { st.i = (st.i + 1) % D.length; st.back = false; }
        if (a === 'prev') { st.i = (st.i - 1 + D.length) % D.length; st.back = false; }
      } else if (kind === 'fill') {
        if (a === 'pick' && st.ans == null) { st.ans = k; if (k === D[st.i].a) st.score++; chime(k === D[st.i].a); }
        if (a === 'next') { st.i++; st.ans = null; }
        if (a === 'again') { st.i = 0; st.score = 0; st.ans = null; }
      } else if (kind === 'sort') {
        if (a === 'sel') { st.sel = k; st.wrong = null; st.msg = ''; }
        if (a === 'bin') {
          if (st.sel == null) { st.msg = T.pickFirst; st.msgOk = false; }
          else if (D.items[st.sel].bin === +b.dataset.b) { st.placed[st.sel] = +b.dataset.b; st.sel = null; st.msg = ''; chime(true); }
          else { st.wrong = st.sel; st.msg = T.wrongBin; st.msgOk = false; chime(false); }
        }
      } else if (kind === 'order') {
        var it = D[st.i];
        if (a === 'word' && st.pick.indexOf(k) < 0) { st.pick.push(k); if (st.pick.length === it.words.length) chime(st.pick.every(function (x, j) { return x === j; })); }
        if (a === 'reset') st.pick = [];
        if (a === 'next') { st.i++; st.pick = []; }
        if (a === 'again') { st.i = 0; st.pick = []; for (var key in st) if (/^sh/.test(key)) delete st[key]; }
      }
      each('[data-practice="' + kind + '"]', function (box) { if (box.__st === st) PR[kind](box, box.__d, st); });   // every copy on screen
    }
    function hydratePractice(box) {
      var kind = box.dataset.practice, i = pageOf(box), D;
      if (!PR[kind]) return;
      try { D = JSON.parse(box.dataset.items); } catch (e) { return; }
      var st = PST[i + ':' + kind] || (PST[i + ':' + kind] = {});
      box.__st = st; box.__d = D; PR[kind](box, D, st);
      box.addEventListener('click', function (e) { var b = e.target.closest('[data-a]'); if (b && !b.disabled) practiceClick(kind, D, st, b); });
    }

    /* ---- labs that pause themselves ---- */
    var LST = {};
    function refreshLive() {
      running = running.filter(function (r) {
        var ok = document.contains(r.el) && r.el.closest('.mb-slot') && lastVis.indexOf(pageOf(r.el)) >= 0 && !document.hidden;
        if (!ok) r.inst.stop(); return ok;
      });
      if (!document.hidden) each('.mb-slot [data-live]', function (w) {
        if (lastVis.indexOf(pageOf(w)) < 0) return;
        var L = LABS[w.dataset.live];
        if (!w.__live && L) w.__live = L.run(w, { T: T, digits: num, frame: function () { api.stats.labFrames++; },
          state: function () { var k = pageOf(w) + ':' + w.dataset.live; return LST[k] || (LST[k] = {}); } });
        if (w.__live && !w.__live.on) { w.__live.start(); running.push({ el: w, inst: w.__live }); }
      });
      api.stats.labRunning = running.length > 0;
    }
    on(document, 'visibilitychange', refreshLive);

    /* ---- reading progress ---- */
    var PKEY = 'mbx-progress:' + ID, PROG = store(PKEY) || { seen: {}, time: {} };
    PROG.seen = PROG.seen || {}; PROG.time = PROG.time || {}; api.progress = PROG;
    function markToc() { each('.tocrow[data-goto]', function (b) { b.classList.toggle('seen', !!PROG.seen[b.getAttribute('data-goto')]); }); }
    var tick = 0;
    timers.push(setInterval(function () {
      if (document.hidden || !document.contains(root)) return;
      lastVis.forEach(function (i) { PROG.time[i] = (PROG.time[i] || 0) + 1; });
      if (++tick % 5 === 0) store(PKEY, PROG);
    }, 1000));
    on(window, 'pagehide', function () { store(PKEY, PROG); });

    /* ---- picture slots ---- */
    var IMGS = Object.assign({}, meta.images || {}, global.MBX_IMAGES || {});
    api.images = IMGS;
    function imgKey(slot) { return 'mbx-img:' + ID + ':' + slot; }
    function imgFor(box) { var s = box.dataset.slot; if (IMGS[s]) return IMGS[s]; try { var v = localStorage.getItem(imgKey(s)); if (v) return v; } catch (e) {} return box.dataset.src || null; }
    function shrink(file, cb) {
      var fr = new FileReader();
      fr.onload = function () { var im = new Image(); im.onload = function () { var k = Math.min(1, 1400 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); cb(c.toDataURL('image/jpeg', .86)); }; im.src = fr.result; };
      fr.readAsDataURL(file);
    }
    function setImg(slot, url) {
      if (url) IMGS[slot] = url; else delete IMGS[slot];
      try { url ? localStorage.setItem(imgKey(slot), url) : localStorage.removeItem(imgKey(slot)); } catch (e) { if (url) toast(T.tooBig); }
      each('.imgslot[data-slot="' + slot + '"]', renderSlot);
    }
    var canSave = !book.opts.studio;
    function renderSlot(box) {
      var src = imgFor(box);
      box.classList.toggle('has', !!src);
      box.innerHTML = src
        ? '<img alt="" src="' + esc(src) + '"><div class="is-tools"><button class="px-btn" data-i="up">' + esc(T.change) + '</button>' + (canSave ? '<button class="px-btn" data-i="save">' + esc(T.saveCopy) + '</button>' : '') + '<button class="px-btn" data-i="del" aria-label="' + esc(T.remove) + '">✕</button></div>'
        : '<div class="is-ph"><b>' + esc(T.slot) + '</b><span>' + esc(T.slotHow) + '</span><div class="is-tools">' + (box.dataset.prompt ? '<button class="px-btn pri" data-i="prompt">' + esc(T.copyPrompt) + '</button>' : '') + '<button class="px-btn" data-i="up">' + esc(T.upload) + '</button></div></div>';
      var f = el('input'); f.type = 'file'; f.accept = 'image/*'; f.hidden = true; box.appendChild(f);
    }
    function hydrateSlot(box) {
      renderSlot(box);
      box.addEventListener('click', function (e) {
        var b = e.target.closest('[data-i]'); if (!b) return; var slot = box.dataset.slot;
        if (b.dataset.i === 'prompt') copy(box.dataset.prompt);
        if (b.dataset.i === 'up') { var f = box.querySelector('input[type=file]'); f.onchange = function () { if (f.files[0]) shrink(f.files[0], function (u) { setImg(slot, u); toast(T.added); }); }; f.click(); }
        if (b.dataset.i === 'del') setImg(slot, null);
        if (b.dataset.i === 'save') saveCopy();
      });
      box.addEventListener('dragover', function (e) { e.preventDefault(); });
      box.addEventListener('drop', function (e) { e.preventDefault(); var f = e.dataTransfer.files[0]; if (f && /^image\//.test(f.type)) shrink(f, function (u) { setImg(box.dataset.slot, u); toast(T.added); }); });
    }
    function saveCopy() {                        // the same single file, with the pictures written inside it
      var doc = document.documentElement.cloneNode(true);
      doc.removeAttribute('data-vt');
      var host = doc.querySelector('#book'); if (host) { host.innerHTML = ''; ['class', 'dir', 'lang', 'data-theme', 'data-mode', 'style'].forEach(function (a) { host.removeAttribute(a); }); }
      Array.prototype.forEach.call(doc.querySelectorAll('[data-mbx]'), function (n) { n.remove(); });
      var s = doc.querySelector('#mbx-images');
      if (!s) { s = document.createElement('script'); s.id = 'mbx-images'; var data = doc.querySelector('#book-data'); data.parentNode.insertBefore(s, data); }
      s.textContent = 'window.MBX_IMAGES=' + JSON.stringify(IMGS).replace(/</g, '\\u003c') + ';';
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['<!DOCTYPE html>\n' + doc.outerHTML], { type: 'text/html' }));
      a.download = String(meta.title || 'book').replace(/[\\/:*?"<>|]+/g, '-') + ' - ' + T.withPics + '.html';
      document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 800);
      toast(T.saving);
    }
    api.saveCopy = saveCopy;

    /* ---- video ---- */
    var VST = {};
    function renderVideo(box) {
      var id = box.dataset.youtube, st = VST[pageOf(box)];
      if (!/^[\w-]{11}$/.test(id || '')) { box.innerHTML = '<div class="yt-msg">' + esc(T.noVideo) + '</div>'; return; }
      if (!st) { box.innerHTML = '<button class="yt-play" data-v="play">' + esc(T.play) + '</button>'; return; }
      if (st === 'offline') { box.innerHTML = '<div class="yt-msg">' + T.videoOff + '<br><button class="yt-play" data-v="play" style="margin-top:.6em">' + esc(T.retry) + '</button></div>'; return; }
      if (st === 'file') {                      // YouTube refuses to play inside a page opened as a file
        box.innerHTML = '<a class="yt-card" href="https://www.youtube.com/watch?v=' + id + '" target="_blank" rel="noopener" style="background-image:url(https://i.ytimg.com/vi/' + id + '/hqdefault.jpg)"><span class="yt-play">' + esc(T.watchOn) + '</span></a>';
        return;
      }
      box.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1&hl=' + (book.rtl ? 'ar' : 'en') + '" title="' + esc(box.dataset.title || 'video') +
        '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>';
    }
    function hydrateVideo(box) {
      renderVideo(box);
      box.addEventListener('click', function (e) {
        if (!e.target.closest('[data-v=play]')) return;
        VST[pageOf(box)] = !navigator.onLine ? 'offline' : location.protocol === 'file:' ? 'file' : 'embed';
        renderVideo(box); api.videoMode = VST[pageOf(box)];
      });
    }

    /* ---- wiring ---- */
    function hydrate(n) {
      if (n.__mbx) return; n.__mbx = true; api.hydrated++;
      each('[data-practice]', hydratePractice, n); each('.imgslot[data-slot]', hydrateSlot, n); each('.yt[data-youtube]', hydrateVideo, n);
      if (n.querySelector('.tocrow')) markToc();
    }
    var mo = new MutationObserver(function (list) {
      var any = false;
      list.forEach(function (m) { Array.prototype.forEach.call(m.addedNodes, function (n) {
        if (n.nodeType !== 1) return;
        if (n.classList.contains('mb-page')) { hydrate(n); any = true; }
        else if (n.querySelector && n.querySelector('.mb-page')) { each('.mb-page', hydrate, n); any = true; }
      }); });
      if (any) refreshLive();
    });
    mo.observe(root, { childList: true, subtree: true });
    api.onPage = function (vis) {
      lastVis = vis.slice(); hideSel(); hideCard();
      vis.forEach(function (i) { PROG.seen[i] = 1; }); store(PKEY, PROG); markToc();
      each('.mb-page', hydrate); refreshLive();
    };
    api.search = openSearch; api.closeSearch = closeSearch;
    api.blockPeek = function () { return !!root.querySelector('.mb-slot .yt, .mb-slot .px, .mb-slot .lab2, .mb-slot .imgslot'); };
    // pictures: the Studio lists every picture space of the book and fills them
    api.slots = function () {
      var out = [], seen = {};
      pages.forEach(function (p, i) {
        Array.prototype.forEach.call(parse(p.html || '').content.querySelectorAll('.imgslot[data-slot]'), function (b) {
          var id = b.getAttribute('data-slot'); if (seen[id]) return; seen[id] = 1;
          out.push({ slot: id, page: i, title: p.title || '', prompt: b.getAttribute('data-prompt') || '', has: !!IMGS[id] });
        });
      });
      return out;
    };
    api.setImage = function (slot, url) { setImg(slot, url); };
    api.allImages = function () {          // pictures added in this browser (kept or in localStorage) — the Studio writes them into the download
      var out = Object.assign({}, IMGS);
      api.slots().forEach(function (x) { if (!out[x.slot]) { try { var v = localStorage.getItem(imgKey(x.slot)); if (v) out[x.slot] = v; } catch (e) {} } });
      return out;
    };
    api.destroy = function () {
      running.forEach(function (r) { r.inst.stop(); }); running = [];
      mo.disconnect(); offs.forEach(function (f) { f(); }); timers.forEach(function (t) { clearTimeout(t); clearInterval(t); });
      nodes.forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); }); store(PKEY, PROG);
    };
    api.onPage(Array.prototype.map.call(root.querySelectorAll('.mb-slot .mb-page'), function (n) { return +n.dataset.i; }));
    return api;
  };
})(typeof window !== 'undefined' ? window : this);
