  // ================= AI route: interview → prompt → paste → book =================
  Object.assign(T.ar, {
    tag: 'كتاب تفاعلي بيتقلّب بجد — بالذكاء الاصطناعي أو من PDF', tabAi: '✨ كتاب بالذكاء الاصطناعي', tabPdf: '📄 من ملف PDF',
    s1: 'الدرس', topic: 'موضوع الدرس', ivSubject: 'المادة', ivStage: 'المرحلة', ivObj: 'أهداف الدرس (هدف في كل سطر — اختياري)',
    s2: 'الكتاب', ivLang: 'لغة الكتاب', ivLen: 'عدد الصفحات', ivStyle: 'طريقة الحكي', ivChars: 'أسماء الشخصيات (اختياري)',
    s3: 'التفاعل', ivQuiz: 'عدد أسئلة الاختبار', ivNotes: 'ملاحظات للذكاء الاصطناعي (اختياري)',
    s4: 'انسخ الطلب', s4h: 'هنكتب لك طلب جاهز فيه كل اختياراتك. انسخه وحطّه في ChatGPT أو Gemini أو Claude.',
    makePrompt: '📋 اكتب الطلب وانسخه', s5: 'الصق رد الذكاء الاصطناعي', pastePh: 'الصق هنا الرد كله زي ما هو…', buildAi: '✨ ابني الكتاب',
    copied: 'اتنسخ ✔ — حطّه في ChatGPT أو Gemini', needTopic: 'اكتب موضوع الدرس الأول', empty2: 'الصق رد الذكاء الاصطناعي الأول',
    okBuilt: '✅ الكتاب جاهز! قلّبه وجرّبه، وبعدين نزّله.', fixedAuto: 'صلّحنا لوحدنا:', warnTitle: 'ملاحظات (الكتاب اتبنى):',
    badTitle: 'في مشاكل في الرد — الكتاب ماتبناش:', copyFix: '📋 انسخ رسالة التصحيح وابعتها للذكاء الاصطناعي', fixCopied: 'اتنسخت ✔ — ابعتها في نفس المحادثة',
    yt: 'لينك فيديو يوتيوب'
  });
  Object.assign(T.en, {
    tag: 'Interactive books that really turn — with AI or from a PDF', tabAi: '✨ Book with AI', tabPdf: '📄 From a PDF',
    s1: 'The lesson', topic: 'Lesson topic', ivSubject: 'Subject', ivStage: 'Stage', ivObj: 'Learning objectives (one per line — optional)',
    s2: 'The book', ivLang: 'Book language', ivLen: 'Pages', ivStyle: 'Storytelling', ivChars: 'Character names (optional)',
    s3: 'Interaction', ivQuiz: 'Quiz questions', ivNotes: 'Notes for the AI (optional)',
    s4: 'Copy the prompt', s4h: 'We write a ready prompt with all your choices. Copy it into ChatGPT, Gemini or Claude.',
    makePrompt: '📋 Write and copy the prompt', s5: 'Paste the AI’s reply', pastePh: 'Paste the whole reply here, as it is…', buildAi: '✨ Build the book',
    copied: 'Copied ✔ — paste it into ChatGPT or Gemini', needTopic: 'Type the lesson topic first', empty2: 'Paste the AI’s reply first',
    okBuilt: '✅ The book is ready! Turn the pages, then download it.', fixedAuto: 'Fixed for you:', warnTitle: 'Notes (the book was built):',
    badTitle: 'The reply has problems — the book was not built:', copyFix: '📋 Copy the fix message and send it to the AI', fixCopied: 'Copied ✔ — send it in the same chat',
    yt: 'YouTube video link'
  });

  var SUBJECTS = [['science', 'علوم', 'Science'], ['maths', 'رياضيات', 'Maths'], ['arabic', 'لغة عربية', 'Arabic'], ['english', 'لغة إنجليزية', 'English'],
    ['social', 'دراسات اجتماعية', 'Social studies'], ['religion', 'تربية دينية', 'Religion'], ['other', 'أخرى', 'Other']];
  var LANGUAGE_SUBJECTS = ['arabic', 'english', 'social', 'religion'];
  var STAGES = [['kg', 'رياض أطفال', 'KG'], ['p13', 'ابتدائي 1–3', 'Primary 1–3'], ['p46', 'ابتدائي 4–6', 'Primary 4–6'], ['prep', 'إعدادي', 'Prep (7–9)'], ['sec', 'ثانوي', 'Secondary']];
  var LEVEL = {
    kg: { words: '35–60', rule: 'Ages 4–6. Sentences of at most 8 words, one idea per page, the new word explained right where it appears, lots of emoji pictures, almost no boxes.' },
    p13: { words: '60–90', rule: 'Ages 6–9. Sentences of at most 12 words, one idea per block, every new word explained where it appears, one control or question per interactive page.' },
    p46: { words: '90–120', rule: 'Ages 9–12. Short clear paragraphs with a small worked example; key words explained; light reasoning questions.' },
    prep: { words: '100–130', rule: 'Ages 12–15. Clear explanations with worked examples, correct terms and units, recall and reasoning questions.' },
    sec: { words: '110–140', rule: 'Ages 15–18. Full explanations: definitions, units, conditions and limits, short derivations where useful, application and analysis questions.' }
  };
  var LANGS = [['fusha', 'فصحى مبسّطة', 'Simple MSA Arabic', true], ['egy', 'عامية مصرية', 'Egyptian Arabic'], ['en', 'English', 'English']];
  var LENGTHS = [[8, '8'], [12, '12', '', true], [16, '16'], [20, '20']];
  var STYLES = [['journey', 'رحلة اكتشاف مع شخصيات', 'Discovery journey with characters', true], ['mystery', 'لغز نحلّه', 'A mystery to solve'],
    ['narrator', 'راوي يحكي', 'A narrator tells it'], ['lesson', 'شرح مباشر بأسئلة مشوّقة', 'Straight lesson with hooks']];
  var MODS = [['practice', 'صفحات تدريب', 'Practice pages', true], ['glossary', 'مسرد المصطلحات', 'Glossary page', true], ['quiz', 'اختبار في الآخر', 'End quiz', true],
    ['picture', 'صفحة صورة نشاط', 'Activity picture page'], ['video', 'صفحة فيديو يوتيوب', 'YouTube video page'], ['lab', 'مختبر التبخّر (لدروس الماء والحرارة)', 'Evaporation lab (water / heat lessons)']];
  var QUIZ = [[5, '5', '', true], [8, '8'], [10, '10']];
  var IV = { topic: '', subject: 'science', stage: 'p46', obj: '', lang: 'fusha', len: 12, style: 'journey', chars: '', mods: ['practice', 'glossary', 'quiz'], quiz: 5, yt: '', notes: '' };
  try { Object.assign(IV, JSON.parse(localStorage.getItem('mbs-interview') || '{}')); } catch (e) {}
  function saveIV() { try { localStorage.setItem('mbs-interview', JSON.stringify(IV)); } catch (e) {} }

  function chips(id, opts, key, multi) {
    var box = $(id); box.innerHTML = '';
    opts.forEach(function (o) {
      if (key === 'mods' && o[0] === 'lab' && IV.subject !== 'science') return;     // a lab teaches nothing in a language lesson
      var b = document.createElement('button'); b.type = 'button';
      var on = multi ? IV[key].indexOf(o[0]) >= 0 : IV[key] === o[0];
      b.setAttribute('aria-pressed', String(on));
      b.innerHTML = (ui === 'ar' ? o[1] : (o[2] || o[1])) + (o[3] ? '<span class="rec">★</span>' : '');
      b.onclick = function () {
        if (multi) { var i = IV[key].indexOf(o[0]); if (i >= 0) IV[key].splice(i, 1); else IV[key].push(o[0]); }
        else IV[key] = o[0];
        if (key === 'subject') {
          if (o[0] !== 'science') IV.mods = IV.mods.filter(function (m) { return m !== 'lab'; });
          var label = SUBJECTS.filter(function (s) { return s[0] === o[0]; })[0];
          if (label && o[0] !== 'other') $('subject').value = ui === 'ar' ? label[1] : label[2];
          if (o[0] === 'english' && IV.lang !== 'en') IV.lang = 'en';
        }
        if (key === 'stage' && !$('grade').value) { /* the teacher can still type an exact grade */ }
        saveIV(); renderIV();
      };
      box.appendChild(b);
    });
  }
  function renderIV() {
    chips('ivSubject', SUBJECTS, 'subject'); chips('ivStage', STAGES, 'stage'); chips('ivLang', LANGS, 'lang');
    chips('ivLen', LENGTHS, 'len'); chips('ivStyle', STYLES, 'style'); chips('ivMods', MODS, 'mods', true); chips('ivQuiz', QUIZ, 'quiz');
    $('ivQuizBox').hidden = IV.mods.indexOf('quiz') < 0; $('ivYtBox').hidden = IV.mods.indexOf('video') < 0;
    $('ivChars').placeholder = themePack === 'studio' ? (ui === 'ar' ? 'يوسف ومريم ونجم (شخصيات ثيم الاستوديو)' : 'Youssef, Mariam and Negm (Studio theme characters)') : (ui === 'ar' ? 'مثال: كريم وسلمى' : 'e.g. Karim and Salma');
  }
  [['ivTopic', 'topic'], ['ivObj', 'obj'], ['ivChars', 'chars'], ['ivYt', 'yt'], ['ivNotes', 'notes']].forEach(function (x) {
    $(x[0]).value = IV[x[1]] || ''; $(x[0]).addEventListener('input', function () { IV[x[1]] = $(x[0]).value; saveIV(); });
  });

  // ---------- the page plan: exact indices, so the contents page and glossary links are right ----------
  function plan() {
    var N = IV.len, mods = IV.mods, has = function (m) { return mods.indexOf(m) >= 0; };
    var yt = ytId(IV.yt), tail = [];
    var practiceN = has('practice') ? (N <= 8 ? 1 : N <= 12 ? 2 : N <= 16 ? 3 : 4) : 0;
    var kinds = LANGUAGE_SUBJECTS.indexOf(IV.subject) >= 0 ? ['fill', 'flip', 'order', 'sort'] : ['flip', 'fill', 'sort', 'order'];
    for (var k = 0; k < practiceN; k++) tail.push({ kind: 'practice', sub: kinds[k] });
    if (has('lab') && IV.subject === 'science') tail.push({ kind: 'lab' });
    if (has('picture')) tail.push({ kind: 'picture' });
    if (has('video') && yt) tail.push({ kind: 'video', yt: yt });
    if (has('quiz')) tail.push({ kind: 'quizpage' });
    if (has('glossary')) tail.push({ kind: 'glossary' });
    var chapters = N - 3 - tail.length, minCh = Math.max(3, Math.round(N * 0.4));   // cover + contents + back; at least 40% teaching pages
    function practices() { return tail.filter(function (t) { return t.kind === 'practice'; }).length; }
    while (chapters < minCh && practices() > 1) { tail.splice(tail.map(function (t) { return t.kind; }).lastIndexOf('practice'), 1); chapters++; }
    while (chapters < 3 && practices()) { tail.splice(tail.map(function (t) { return t.kind; }).lastIndexOf('practice'), 1); chapters++; }
    var rows = [{ kind: 'cover' }, { kind: 'contents' }];
    for (var c = 0; c < chapters; c++) rows.push({ kind: c === 0 ? 'hook' : 'chapter' });
    return rows.concat(tail, [{ kind: 'back' }]);
  }
  function planText(rows) {
    var D = {
      cover: '{"type":"cover"} — built from meta (title, subtitle, author)',
      contents: 'contents page (type html): the chapter titles as <button class=\'tocrow\' data-goto=\'INDEX\'> rows inside <ul class=\'toc\'>, INDEX = the 0-based page index from this plan',
      hook: 'the hook (type html): the characters meet the question or mystery of the lesson',
      chapter: 'chapter page (type html)',
      lab: '{"type":"lab","lab":"evaporation","title":"…","intro":"…","noteTitle":"…","note":"what to notice"}',
      picture: '{"type":"picture","title":"…","intro":"what the class does and photographs","slot":"activity","prompt":"ENGLISH description of an illustration of this activity"}',
      quizpage: 'quiz page (type html): a short "what did we learn" recap and <button class=\'qbtn\' data-quiz=\'1\'>…start the quiz…</button>',
      glossary: '{"type":"glossary","title":"…"} — the engine fills it from meta.glossary',
      back: '{"type":"back"} — uses meta.blurb'
    };
    return rows.map(function (r, i) {
      var d = r.kind === 'practice' ? '{"type":"practice","kind":"' + r.sub + '", …} (see PRACTICE)' : r.kind === 'video' ? '{"type":"video","title":"…","intro":"…","youtube":"' + r.yt + '"}' : D[r.kind];
      return i + '. ' + d;
    }).join('\n');
  }
  function buildPrompt() {
    var st = STAGES.filter(function (s) { return s[0] === IV.stage; })[0], lv = LEVEL[IV.stage], subj = SUBJECTS.filter(function (s) { return s[0] === IV.subject; })[0];
    var rows = plan(), studio = themePack === 'studio';
    var lang = IV.lang === 'en' ? 'English' : IV.lang === 'egy' ? 'Egyptian colloquial Arabic (natural Egyptian spelling and rhythm; scientific terms in their standard form)' : 'simple, correct Modern Standard Arabic for Egyptian school children (فصحى مبسّطة) — never colloquial';
    var objectives = IV.obj.split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
    var chars = IV.chars.trim() || (studio ? (IV.lang === 'en' ? 'Youssef (boy), Mariam (girl) and Negm (a friendly talking star who guides them)' : 'يوسف (ولد) ومريم (بنت) ونجم (نجمٌ صغيرٌ متكلّم يرشدهما)') : 'two curious children of the right age with Egyptian names, and a guide if useful');
    var style = { journey: 'a discovery journey: the characters explore, ask and find out', mystery: 'a mystery: a puzzle in the hook is solved step by step through the chapters',
      narrator: 'a warm narrator tells the lesson like a story', lesson: 'a clear lesson where every page opens with a hook question' }[IV.style];
    var practiceUsed = rows.some(function (r) { return r.kind === 'practice'; });
    var L = [];
    L.push('You are an expert children’s author and teacher. Write a complete interactive book for a MorphBook flipbook as ONE JSON object.');
    L.push('');
    L.push('## The teacher’s choices');
    L.push('- Topic: ' + IV.topic.trim());
    L.push('- Subject: ' + subj[2] + ' · Stage: ' + st[2] + ($('grade').value ? ' (' + $('grade').value + ')' : ''));
    L.push('- Book language: ' + lang + '. Use only this language in every text the reader sees.');
    L.push('- Storytelling: ' + style + '. Characters: ' + chars + '.');
    L.push('- Reading level: ' + lv.rule + ' About ' + lv.words + ' words per chapter page plus at most one box.');
    if (objectives.length) L.push('- Learning objectives (teach every one on a page and test every one in the quiz):\n' + objectives.map(function (o, i) { return '  ' + (i + 1) + '. ' + o; }).join('\n'));
    if ($('author').value || $('org').value) L.push('- Author: ' + ($('author').value || '—') + ' · School: ' + ($('org').value || '—'));
    if (IV.notes.trim()) L.push('- Teacher’s notes: ' + IV.notes.trim());
    L.push('- Use familiar Egyptian examples (the Nile, school, home, the bus, football, Egyptian pounds) whenever they help.');
    L.push('');
    L.push('## Exactly ' + rows.length + ' pages, in this order (0-based index)');
    L.push(planText(rows));
    L.push('');
    L.push('## Page HTML (for pages of type html)');
    L.push('Each html page is ONE string: <div class=\'pg\'> … <div class=\'pgnum\'>N</div></div> where N is index+1' + (IV.lang === 'en' ? '' : ' in Arabic-Indic digits (١ ٢ ٣)') + '. ALWAYS use single quotes for HTML attributes so the JSON stays valid.');
    L.push('Chapter pages follow this pattern: <h2>title</h2> · <p class=\'hook\'>a question, surprise or scene</p> · <p class=\'lead\'>the explanation</p> · dialogue lines <p class=\'dlg\'' + (studio ? ' data-who=\'youssef|mariam|negm\' data-mood=\'happy|curious|surprised\'' : '') + '><b>Name</b>“…”</p> · ONE box: <div class=\'kterm\'><b>Term</b><span>meaning</span></div> or <div class=\'callout tone-tip\'><b>Title</b><span>…</span></div> (tone-tip, tone-example or tone-warning) or <div class=\'activity\'><b>Try it</b><p>…</p></div> · optional <div class=\'emoji-hero\'>🌍💧</div> on every second or third page · on the last page of a chapter <p class=\'cliff\'>a line that pulls to the next page</p>.');
    if (studio) L.push('This book uses the Studio theme: dialogue avatars work with data-who=\'youssef\' (boy), \'mariam\' (girl) or \'negm\' (the star guide); big subject icons: <span class=\'ico ico-xl ico-NAME\'></span> with NAME one of science, maths, arabic, english, history, geography, art, music, sports, computer, space, ocean, plants, animals, human-body, chemistry, physics, reading, star, target, lightbulb, magnifier, warning, quiz-trophy.');
    L.push('Do NOT mark glossary words in the HTML: the engine links them automatically from meta.glossary. Never use <img> (no pictures exist), <script>, <style> or links.');
    L.push('');
    if (practiceUsed) {
      L.push('## PRACTICE pages (no HTML; they must test what the chapters taught)');
      L.push('- flip: {"type":"practice","kind":"flip","title":"…","intro":"…","items":[{"front":"term","back":"short meaning"}]} — 5 to 8 cards');
      L.push('- fill: {"type":"practice","kind":"fill","title":"…","intro":"…","items":[{"s":"sentence with ___ for the gap","o":["option","option","option"],"a":1,"e":"one-line explanation"}]} — 4 to 6 items; "a" is the 0-based index of the right option');
      L.push('- sort: {"type":"practice","kind":"sort","title":"…","intro":"…","bins":["group A","group B"],"items":[{"t":"card","bin":0}]} — 6 to 8 short cards, 2 or 3 bins');
      L.push('- order: {"type":"practice","kind":"order","title":"…","intro":"…","items":[{"words":["words","in","the","correct","order"],"hint":"short hint"}]} — 3 or 4 sentences of 3 to 6 words');
      L.push('');
    }
    L.push('## The JSON');
    L.push('{"meta":{"title":"…","subtitle":"…","author":"' + ($('author').value || '') + '","lang":"' + (IV.lang === 'en' ? 'en' : 'ar') + '","dir":"' + (IV.lang === 'en' ? 'ltr' : 'rtl') + '"' + (IV.lang === 'fusha' ? ',"arabic":"fusha"' : '') +
      ',"subjectTag":"one of space, ocean, nature, maths, language, history — the closest to the topic","icon":"one emoji","blurb":"two sentences for the back cover",' +
      '"glossary":[{"term":"word exactly as written in the pages","def":"child-friendly meaning in one sentence","page":INDEX_WHERE_EXPLAINED}]},' +
      '"pages":[ …exactly ' + rows.length + ' pages… ],' + (IV.mods.indexOf('quiz') >= 0 ? '"quiz":[{"q":"question","options":["…","…","…","…"],"a":"the exact text of the right option","explanation":"one sentence"}]' : '"quiz":[]') + '}');
    L.push('');
    L.push('## Rules');
    L.push('- Facts must be correct for the stage. If unsure, leave the claim out.');
    L.push('- meta.glossary: 8 to 14 key terms, each one used in the pages in exactly that spelling.');
    if (IV.mods.indexOf('quiz') >= 0) L.push('- quiz: exactly ' + IV.quiz + ' questions, easy to medium, 4 options each; "a" must be copied exactly from options.');
    L.push('- Keep each page short: a page that overflows is unreadable. Cut words rather than add boxes.');
    L.push('- Reply with the JSON only: no markdown fences, no comments, no text before or after it.');
    return L.join('\n');
  }

  // ---------- paste: read, check, fix small slips, explain the rest ----------
  function extractJson(text) {
    var t = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
    var a = t.indexOf('{'), b = t.lastIndexOf('}');
    if (a < 0 || b <= a) throw { kind: 'nojson' };
    t = t.slice(a, b + 1);
    try { return JSON.parse(t); }
    catch (e1) {
      var t2 = t.replace(/,(\s*[}\]])/g, '$1');      // a trailing comma before } or ] is the most common slip (curly quotes inside text are fine)
      try { return JSON.parse(t2); }
      catch (e2) {
        var m = String(e2.message).match(/position (\d+)/), pos = m ? +m[1] : -1, line = 0, snip = ''; t = t2;
        if (pos >= 0) { line = t.slice(0, pos).split('\n').length; snip = t.slice(Math.max(0, pos - 60), pos + 40).replace(/\s+/g, ' '); }
        throw { kind: 'parse', line: line, snip: snip, msg: e1.message };
      }
    }
  }
  var KNOWN = ['cover', 'html', 'image', 'blank', 'back', 'practice', 'video', 'picture', 'lab', 'glossary'];
  function words(html) { return String(html).replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length; }
  function checkBook(b) {
    var E = [], F = [], W = [], ar = ui === 'ar';
    function err(t, a) { E.push({ t: t, a: a }); }
    if (!b || typeof b !== 'object' || !Array.isArray(b.pages) || !b.pages.length) { err(ar ? 'الرد مافيهوش صفحات (pages).' : 'The reply has no "pages".', 'The JSON has no "pages" array.'); return { E: E, F: F, W: W }; }
    b.meta = b.meta && typeof b.meta === 'object' ? b.meta : {};
    var teacherYt = IV.mods.indexOf('video') >= 0 ? ytId(IV.yt) : '';
    var limit = { kg: 80, p13: 125, p46: 165, prep: 180, sec: 190 }[IV.stage] || 170;
    b.pages = b.pages.filter(function (p, i) {
      var n = i + 1;
      if (!p || typeof p !== 'object') { F.push(ar ? 'شيلنا صفحة فاضية رقم ' + n : 'Removed an empty page ' + n); return false; }
      if (!p.type) p.type = p.image ? 'image' : 'html';
      if (KNOWN.indexOf(p.type) < 0) { err((ar ? 'صفحة ' : 'Page ') + n + (ar ? ': نوع مش معروف "' : ': unknown type "') + p.type + '"', 'Page index ' + i + ' has an unknown type "' + p.type + '". Use only: ' + KNOWN.join(', ') + '.'); return true; }
      if (p.type === 'html') {
        if (!p.html || typeof p.html !== 'string') { err((ar ? 'صفحة ' : 'Page ') + n + (ar ? ': فاضية' : ': empty'), 'Page index ' + i + ' (type html) has no "html".'); return true; }
        if (!/class=['"][^'"]*\bpg\b/.test(p.html)) { p.html = "<div class='pg'>" + p.html + '</div>'; F.push(ar ? 'لفّينا صفحة ' + n + ' في إطار الصفحة' : 'Wrapped page ' + n + ' in a page frame'); }
        if (/<img\b|<script\b/i.test(p.html)) { p.html = p.html.replace(/<img\b[^>]*>/gi, '').replace(/<script[\s\S]*?<\/script>/gi, ''); F.push(ar ? 'شيلنا صور/سكريبت من صفحة ' + n : 'Removed images/scripts from page ' + n); }
        var w = words(p.html);
        if (w > limit) W.push({ t: (ar ? 'صفحة ' : 'Page ') + n + (ar ? ' طويلة (' + w + ' كلمة) — ممكن تتقري بصعوبة' : ' is long (' + w + ' words)'), a: 'Page index ' + i + ' has ' + w + ' words; shorten it to about ' + LEVEL[IV.stage].words + ' words.' });
      }
      if (p.type === 'practice') {
        var kind = p.kind || 'fill', items = p.items || p.cards || [], bad = '';
        if (['flip', 'fill', 'sort', 'order'].indexOf(kind) < 0) bad = 'kind must be flip, fill, sort or order';
        else if (!items.length) bad = 'it has no items';
        else if (kind === 'fill') items.forEach(function (it, k) {
          if (typeof it.a === 'string' && it.o) { var ix = it.o.indexOf(it.a); if (ix >= 0) it.a = ix; }
          if (String(it.s || '').indexOf('___') < 0 || !Array.isArray(it.o) || typeof it.a !== 'number' || it.a < 0 || it.a >= it.o.length) bad = bad || 'fill item ' + (k + 1) + ' needs "s" with ___, options "o" and a valid 0-based index "a"';
        });
        else if (kind === 'sort' && ((p.bins || []).length < 2 || items.some(function (it) { return !(it.bin >= 0 && it.bin < p.bins.length); }))) bad = 'sort needs 2+ "bins" and every item\'s "bin" must be a valid 0-based bin index';
        else if (kind === 'order' && items.some(function (it) { return !Array.isArray(it.words) || it.words.length < 2; })) bad = 'every order item needs "words" (2 or more, in the correct order)';
        else if (kind === 'flip' && items.some(function (it) { return !it.front || !it.back; })) bad = 'every flip card needs "front" and "back"';
        if (bad) err((ar ? 'صفحة التدريب ' : 'Practice page ') + n + (ar ? ' فيها غلطة' : ' has a mistake'), 'Practice page at index ' + i + ': ' + bad + '.');
      }
      if (p.type === 'video') {
        if (!teacherYt) { F.push(ar ? 'شيلنا صفحة فيديو مالهاش لينك من عندك' : 'Removed a video page without your link'); return false; }
        if (ytId(p.youtube || p.url) !== teacherYt) { p.youtube = teacherYt; F.push(ar ? 'حطّينا لينك الفيديو بتاعك' : 'Put your video link in'); }
      }
      if (p.type === 'picture' && !p.prompt) { p.prompt = 'Bright, friendly educational illustration about "' + (p.title || IV.topic) + '", no text or letters.'; F.push(ar ? 'كتبنا وصف صورة لصفحة ' + n : 'Wrote a picture description for page ' + n); }
      if (p.type === 'lab' && ['evaporation', 'vapour'].indexOf(p.lab || 'evaporation') < 0) { F.push(ar ? 'شيلنا معمل مش موجود' : 'Removed an unknown lab'); return false; }
      return true;
    });
    if (b.pages[0] && b.pages[0].type !== 'cover') { b.pages.unshift({ type: 'cover' }); F.push(ar ? 'زوّدنا غلاف' : 'Added a cover'); }
    if (b.pages[b.pages.length - 1].type !== 'back') { b.pages.push({ type: 'back' }); F.push(ar ? 'زوّدنا غلاف خلفي' : 'Added a back cover'); }
    b.pages.forEach(function (p, i) { if (i === 0 || i === b.pages.length - 1) p.hard = p.hard !== false; });
    if (b.pages.length % 2) { b.pages.splice(b.pages.length - 1, 0, { type: 'blank' }); F.push(ar ? 'زوّدنا صفحة فاضية عشان الكتاب يقفل صح' : 'Added a blank page so the book closes properly'); }
    var N = b.pages.length;
    (Array.isArray(b.meta.glossary) ? b.meta.glossary : []).forEach(function (g) { if (g && g.page != null && !(g.page >= 0 && g.page < N)) delete g.page; });
    b.pages.forEach(function (p, i) {
      if (p.type === 'html' && /data-goto=['"](\d+)/.test(p.html || '')) {
        (p.html.match(/data-goto=['"](\d+)/g) || []).forEach(function (m) { var k = +m.replace(/\D/g, ''); if (k >= N) W.push({ t: (ar ? 'رابط في صفحة المحتويات بيودّي لصفحة مش موجودة (' : 'A contents link points past the end (') + (k + 1) + ')', a: 'The contents page links to page index ' + k + ' which does not exist.' }); });
      }
    });
    if (b.quiz != null && !Array.isArray(b.quiz)) b.quiz = [];
    (b.quiz || []).forEach(function (q, k) {
      if (q && typeof q.a === 'number' && Array.isArray(q.options) && q.options[q.a] != null) q.a = q.options[q.a];
      if (!q || !q.q || !Array.isArray(q.options) || q.options.length < 2 || q.options.indexOf(q.a) < 0)
        err((ar ? 'سؤال ' : 'Question ') + (k + 1) + (ar ? ' في الاختبار: الإجابة مش من الاختيارات' : ' of the quiz: the answer is not one of the options'), 'quiz[' + k + ']: "a" must be copied exactly from its "options".');
    });
    return { E: E, F: F, W: W };
  }
  function report(kind, html, fixText) {
    var r = $('report'); r.className = 'report ' + kind; r.innerHTML = html;
    if (fixText) {
      var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'btn ghost'; btn.textContent = T[ui].copyFix;
      btn.onclick = function () { copyText(fixText, T[ui].fixCopied); }; r.appendChild(btn);
    }
  }
  function esc2(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function copyText(text, msg) {
    var done = function () { status(msg); };
    var fb = function () { var t = document.createElement('textarea'); t.value = text; t.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (e) {} t.remove(); done(); };
    try { navigator.clipboard.writeText(text).then(done, fb); } catch (e) { fb(); }
  }
  function buildFromAi() {
    var text = $('paste').value, b;
    if (!text.trim()) { report('bad', esc2(T[ui].empty2)); return; }
    try { b = extractJson(text); }
    catch (e) {
      var ar = ui === 'ar';
      var t = e.kind === 'nojson' ? (ar ? 'مالقيناش JSON في الرد. اتأكد إنك نسخت الرد كله.' : 'No JSON found in the reply. Copy the whole reply.')
        : (ar ? 'الـ JSON فيه غلطة كتابة' : 'The JSON has a syntax error') + (e.line ? (ar ? ' عند السطر ' : ' near line ') + e.line : '') + '.';
      var fix = e.kind === 'nojson' ? 'Your reply did not contain the JSON object. Send the complete book JSON only, with no text before or after it.'
        : 'Your JSON is not valid' + (e.line ? ' near line ' + e.line + ' (around: ' + e.snip + ')' : '') + '. Common causes: double quotes inside HTML (use single quotes for HTML attributes), a missing comma, or a cut-off reply. Send the COMPLETE corrected JSON only, with no markdown and no text around it.';
      report('bad', '<b>' + esc2(T[ui].badTitle) + '</b><ul><li>' + esc2(t) + '</li></ul>', fix); return;
    }
    var c = checkBook(b);
    if (c.E.length) {
      report('bad', '<b>' + esc2(T[ui].badTitle) + '</b><ul>' + c.E.map(function (x) { return '<li>' + esc2(x.t) + '</li>'; }).join('') + '</ul>',
        'Please fix these problems in the book JSON:\n' + c.E.concat(c.W).map(function (x) { return '- ' + x.a; }).join('\n') + '\nSend the COMPLETE corrected JSON only, with no markdown and no text around it.');
      return;
    }
    loadBook(b, true);
    var html = '<b>' + esc2(T[ui].okBuilt) + '</b>';
    if (c.F.length) html += '<div style="margin-top:.35rem">' + esc2(T[ui].fixedAuto) + '<ul>' + c.F.map(function (x) { return '<li>' + esc2(x) + '</li>'; }).join('') + '</ul></div>';
    if (c.W.length) html += '<div style="margin-top:.35rem">' + esc2(T[ui].warnTitle) + '<ul>' + c.W.map(function (x) { return '<li>' + esc2(x.t) + '</li>'; }).join('') + '</ul></div>';
    report('ok', html, c.W.length ? 'The book works, but please improve it:\n' + c.W.map(function (x) { return '- ' + x.a; }).join('\n') + '\nSend the COMPLETE corrected JSON only.' : null);
  }
  $('makePrompt').onclick = function () {
    if (!IV.topic.trim()) { status(T[ui].needTopic); $('ivTopic').focus(); return; }
    var p = buildPrompt(); $('prompt').value = p; $('promptBox').hidden = false; copyText(p, T[ui].copied);
  };
  $('buildAi').onclick = buildFromAi;

  // ---------- tabs ----------
  function setTab(ai) {
    $('tabAi').setAttribute('aria-selected', String(ai)); $('tabPdf').setAttribute('aria-selected', String(!ai));
    $('paneAi').hidden = !ai; $('panePdf').hidden = ai;
  }
  $('tabAi').onclick = function () { setTab(true); }; $('tabPdf').onclick = function () { setTab(false); };
  if (Object.hasOwn(packs, 'studio') && !imported && !pages.length) { themePack = 'studio'; theme = 'studio'; updateSwatches(); }
  var _applyLang = applyLang;
  applyLang = function () {
    _applyLang();
    Array.prototype.forEach.call(document.querySelectorAll('[data-ph]'), function (e) { e.placeholder = T[ui][e.getAttribute('data-ph')] || ''; });
    renderIV();
  };
  $('lang').onclick = function () { ui = ui === 'ar' ? 'en' : 'ar'; applyLang(); };
  applyLang();
  window.__studio_ai = { buildPrompt: buildPrompt, plan: plan, check: checkBook, iv: IV, render: renderIV };
