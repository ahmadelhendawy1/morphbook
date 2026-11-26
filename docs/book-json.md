# book.json

One file describes a book. `tools/build_book.py` turns it into one HTML file.

```json
{
  "meta":  { "title": "…", "lang": "ar", "dir": "rtl", "theme": "ocean", "...": "..." },
  "pages": [ { "type": "cover" }, { "type": "html", "html": "<div class=\"pg\">…</div>" }, { "type": "back" } ],
  "quiz":  [ { "q": "…", "options": ["…", "…"], "a": "…", "explanation": "…" } ],
  "css":   "optional extra CSS for this book only"
}
```

## meta

| key | meaning |
|---|---|
| `id` | short slug; reading position is saved per id |
| `title`, `subtitle`, `author`, `org`, `grade`, `subject` | shown on the generated cover and the toolbar |
| `icon` | one emoji for the cover badge |
| `blurb` | text on the generated back cover |
| `lang` | `ar` or `en` (labels, fonts, voice) |
| `dir` | `rtl` or `ltr` (binding side and turning direction) |
| `theme` | `classic` `ocean` `nature` `cosmic` `sunset` `vintage` `blossom` `arctic` `royal` `desert` `chalkboard` `blueprint` |
| `themePack` | folder slug under `themes/`, e.g. `studio`. The builder sets `data-theme` on the reader and inlines the pack's stylesheet and relative assets. |
| `subjectTag` | Studio cover pair: `space`, `ocean`, `nature`, `maths`, `language`, or `history`. Explicit `coverImage` and `backImage` take precedence. |
| `hue`, `accent` | optional overrides: a hue number (0–360) or any CSS colour |
| `aspect` | page width ÷ height (0.72 default; a PDF's own ratio from `pdf_to_book.py`) |
| `sound` | `{ "enabled": true, "volume": 0.7, "url": "optional-own-clip.mp3" }` |
| `hardCover` | `false` to make covers soft paper |
| `arabic` | `fusha` for Modern Standard (educational) Arabic reader labels; default is Egyptian colloquial |
| `labels` | override any reader label, e.g. `{"hint": "…"}` |
| `voiceLang`, `voiceRate` | read-aloud voice, e.g. `ar-EG`, `0.95` |
| `duration` | milliseconds for an automatic turn (900) |
| `single` | `true` to always show one page |

## pages

Index 0 is the front cover. On wide screens page 0 sits alone, then pages 1–2, 3–4 … are spreads; an **even** page count puts the back cover alone at the end, which looks like a closed book. In a right-to-left book the first page of a spread is on the right.

| key | meaning |
|---|---|
| `type` | `cover` (built from meta if no `html`), `html`, `image`, `blank`, `back` |
| `html` | the page content: one `<div class="pg">…</div>` |
| `image`, `fit`, `alt` | for image pages: path or data URI; `fit: "cover"` fills the page |
| `title` | name in the contents drawer |
| `chapter` | groups pages in the drawer |
| `hard` | `true` turns it like a board (covers are hard by default) |
| `narration` | what Read Aloud says (otherwise the page text) |
| `bg` | a CSS background for this page |

## Content vocabulary (inside `.pg`)

| markup | renders as |
|---|---|
| `<h2>` | page heading with an accent rule |
| `<p class="hook">` | the opening question or scene, italic accent |
| `<p class="lead">` | paragraph with a drop cap |
| `<p class="dlg"><b>Name</b>“line”</p>` | dialogue line |
| `<p class="dlg" data-who="mariam" data-mood="curious">` | Studio dialogue avatar. Use `youssef`, `mariam`, or `negm` for `data-who`. The default mood is `happy`; `curious` and `surprised` select the other expressions. |
| `<span class="term" data-def="…">word</span>` | glossary word with a pop-up definition |
| `<div class="kterm"><b>Term</b><span>…</span></div>` | key-term card |
| `<div class="callout tone-tip|tone-warning|tone-example"><b>Title</b><span>…</span></div>` | callout |
| `<div class="activity"><b>Try it</b><p>…</p></div>` | activity box |
| `<div class="eq"><code>…</code></div>` | an equation (always left to right) |
| `<div class="emoji-hero">🌋</div>` | big illustration emoji |
| `<span class="ico ico-space"></span>` · `<span class="ico ico-xl ico-science"></span>` | Studio theme only: 3D subject icon inline, or large and centred. Names: science, maths, arabic, english, history, geography, art, music, sports, computer, space, ocean, plants, animals, human-body, chemistry, physics, reading, star, target, lightbulb, magnifier, warning, quiz-trophy |
| `<p class="cliff">` | cliffhanger at the foot of a page |
| `<ul class="toc">` with `<button class="tocrow" data-goto="4">` | contents page; `data-goto` is the 0-based page index |
| `<button class="qbtn" data-quiz="1">` | opens the quiz |
| `<div class="pgnum">5</div>` | page number at the bottom |
| `.pg.dedication`, `.pg.cover`, `.pg.backcover`, `.pg.fill` | special layouts; `fill` centres short content |

Length: a page holds about 90–130 words plus one box at grade 3–6. The engine scales text between 0.8× and 1.45× to fill the paper; anything longer scrolls and `test_book.py` reports it as *too long*.
