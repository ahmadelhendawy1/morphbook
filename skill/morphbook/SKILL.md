---
name: morphbook
description: Interview a teacher, then write and build an interactive flipbook (real page curl, 3D covers, paper sound, Arabic RTL, automatic glossary, search, practice pages, labs, video, quiz) as one HTML file from a topic, lesson or PDF.
---

# MorphBook: from a teacher's idea to a book that really turns

MorphBook books are one HTML file: pages curl when a corner is dragged, covers swing open in 3D, the paper rustles, Arabic books turn right to left, and teaching parts are built in: an automatic glossary, search, a select-a-word meaning bar, practice pages (flip cards, fill-in, sort, sentence builder), small live labs, a video page, picture slots, a contents page that ticks what was read, read-aloud and an end-of-book quiz. The engine, tools and examples live in the repository **https://github.com/ahmadelhendawy1/morphbook**.

The job has five steps: **get the engine → interview the teacher → plan → write and build → check and deliver.**

## 1. Get the engine

Use a local copy if one exists (look for a folder containing `engine/morphbook.js`, `engine/morphbook-extras.js` and `tools/build_book.py`; on Ahmad's PC try the MorphBook project folder first). Otherwise:

```bash
git clone --depth 1 https://github.com/ahmadelhendawy1/morphbook.git
```

Read `docs/book-json.md` (the book format and the content vocabulary) before writing pages. Open `examples/marine-life-ar/book.json` (Arabic) or `examples/cells-en/book.json` (English) as the model of a finished book. Python 3 is enough to build; checking needs `pip install playwright pillow` and a Chromium (`python -m playwright install chromium`, or pass `--chrome` with an installed Chrome/Edge).

## 2. Interview the teacher

Teachers want to click, not type. Ask in short rounds with the structured question tool (at most four questions a round), two to four concrete options each, **recommended option first and labelled "(Recommended)"**, so that accepting every recommendation still makes a good book. Skip anything the teacher already said or the material settles. After each round say the decisions back in one line. Keep the teacher's own words verbatim in the brief.

**Round 1 · The source and the class**
- What are we turning into a book? A topic I describe (we write a new story-book) · my PDF or lesson file · text I'll paste · an existing book to restyle.
- Which class? Offer grade bands that fit the subject (e.g. Grades 1–3, 4–6, prep, secondary).
- Language: Modern Standard Arabic, simple and educational (Recommended for school books; set `meta.arabic: "fusha"`) · Egyptian colloquial Arabic (stories read aloud to young children) · English · Arabic + English glossary.
- Learning objectives: ask for one to four, one line each ("Name the four stages of the water cycle"). Every objective must be taught on a page and tested by at least one quiz question.
- Length: 8 pages (one lesson) · 12 pages (Recommended) · 20 pages (a unit) · 30+ (several units). Keep the count even so the back cover closes alone.

**Round 2 · The story and the teaching**
- Story mode: two child characters on a journey of discovery (Recommended) · a mystery to solve · a friendly narrator documentary · a straight lesson with hooks and cliffhangers.
- Characters: suggest names and one line each that fit the class (e.g. Karim and Salma, two curious 10-year-olds from Alexandria); the teacher may rename them.
- Interactivity (multi-select): automatic glossary + glossary page (Recommended) · practice pages (Recommended) · end-of-book quiz (Recommended) · a live lab · a YouTube video page · a picture page for the class's own activity photo · read-aloud narration.
- Quiz size if chosen: 5 (Recommended) · 8 · 10 · 15, mixed easy/medium/hard.

**Choosing what fits (apply these before offering options)**
- The school stage sets the reading level: KG–Grade 3 → sentences of at most 12 words, one idea per block, a new word defined where it appears, one control per interactive page; Grades 4–6 → short worked examples; prep and secondary → full explanations, units and reasoning questions.
- Language, grammar, vocabulary, religion, history and social studies → practice pages (fill, flip, sort, order), pictures, video and the quiz. Do not offer a lab: it would teach nothing.
- Science and maths → one lab only when the topic has a built-in one (`evaporation` today) or the teacher asks for one to be written; otherwise practice pages.
- Offer and build only modules that teach this lesson directly. Never add a page because the engine can make it.
- Use familiar Egyptian examples (the Nile, school, the bus, football, Egyptian pounds) whenever they help.
- A video page only with a real YouTube link: ask the teacher for it, or find one and give its title and channel for approval. Never invent a video id.

**Round 3 · Look and sound**
- Theme: propose the three that suit the subject, plus "something else". Map: sea/water → `ocean`; plants/environment → `nature`; space/physics → `cosmic`; history/heritage → `vintage` or `desert`; maths/engineering → `blueprint`; language/early years → `blossom` or `sunset`; revision/maths board → `chalkboard`; formal/school-wide → `classic` or `royal`.
- Cover: 3D hard cover (Recommended) · soft paper.
- Pictures: emoji and CSS illustrations, free and instant (Recommended) · AI-generated art with prompts from `docs/codex-prompts.md` · the PDF's own pages.
- Sound: paper sound on (Recommended) · off · my own clip.

**Round 4 · Credits** (free text is fine here): title (offer three titles written from the topic), author, school, dedication.

Write the answers to `books/<slug>/brief.json` (`words` holds the teacher's own phrases) and reuse it for any later edit or second volume.

## 3. Plan

Before writing pages, show a short plan the teacher can approve in one click: chapters, and for each page its title and one line of what happens. Use this skeleton and scale the middle:

| Page | Content |
|---|---|
| 0 | cover (`{"type":"cover"}` builds it from meta) |
| 1 | dedication |
| 2 | contents page (`tocrow` buttons with `data-goto`, 0-based page index) |
| 3 | the hook: the characters meet the mystery or question |
| 4 … n−4 | chapters: 1–3 pages each |
| after the chapters | practice pages (`{"type":"practice"}`), a lab, a video or picture page — only those chosen in Round 2 |
| n−3 | quiz page (`qbtn data-quiz`) or a "what did we learn" page |
| n−2 | glossary page (`{"type":"glossary"}`) or about the author |
| n−1 | back cover (`{"type":"back"}`, with `meta.blurb`) |

Ask: go ahead with this plan (Recommended) · change chapters · change length.

## 4. Write and build

Write `books/<slug>/book.json` following `docs/book-json.md`.

**Every chapter page** follows the storyteller pattern, in the class's language:
1. `<h2>` title.
2. `<p class="hook">` a question, a surprise or a scene ("What if a drop of water held more life than a city?").
3. The explanation carried by the characters: `<p class="lead">` narrative, then `<p class="dlg"><b>Name</b>“…”</p>` lines where a character asks and the other (or a discovery) answers.
4. One teaching block: a `kterm` key-term card, a `callout` (tip / example / warning), or an `eq`.
5. Glossary words: list each term once in `meta.glossary` with a child-friendly definition and the page that explains it; the engine links every mention (first per page) by itself, Arabic prefixes included. A one-off word can still be written as `<span class="term" data-def="…">word</span>`.
6. Often an `activity` the child can do at home or in class.
7. On the last page of a chapter, `<p class="cliff">` pulling to the next one.
8. `<div class="pgnum">` with the page number (Arabic-Indic digits in Arabic books).

**Rules**
- 90–130 words per page plus one box at grades 3–6; fewer for grades 1–2. Shorten text rather than shrinking it.
- Facts must be right. Check numbers and claims; when unsure, leave the claim out.
- Egyptian colloquial when chosen: natural Egyptian spelling and rhythm ("عشان", "دلوقتي", "إزاي"), scientific terms kept in their standard form inside `term` spans. Never switch registers mid-book.
- Add `narration` to pages whose text is mostly boxes, so read-aloud sounds natural.
- Interactive pages are written as page types, not HTML: `practice` (`flip`, `fill`, `sort`, `order`), `video`, `picture`, `lab`, `glossary`. Formats and sizes are in `docs/book-json.md`; the builder refuses a practice item without a valid answer. Each practice page tests what the chapters taught, in the book's language and register.
- Picture pages: write the image description in English (subject, composition, style, light, palette, "no text or letters"), like the cover prompts.
- Quiz: options must contain the exact answer string `a`; write a one-sentence `explanation` for each.
- Emoji illustrations: `<div class="emoji-hero">🐋🌊</div>`, one per two or three pages, never decorative clutter.
- For a PDF source: either run `python tools/pdf_to_book.py file.pdf -o books/<slug> --title "…" [--dir rtl] --theme …` for a faithful flipbook (then add a contents page, glossary pages or a quiz as HTML pages between the images), or read the PDF and write a new story-book from it (the "rewritten book" route in `docs/techniques.md`). Ask which the teacher wants if Round 1 did not settle it.
- AI pictures: write the prompts with `docs/codex-prompts.md` (no text inside images, 1024×1424 covers); with image generation available, make them, save under `books/<slug>/img/`, and set `meta.coverImage` or page `<figure>`s.

Build:

```bash
python tools/build_book.py books/<slug>/book.json -o dist/<slug>.html
```

## 5. Check and deliver

```bash
python tools/test_book.py dist/<slug>.html        # add --chrome "C:/Program Files/Google/Chrome/Application/chrome.exe" if needed
```

It visits every spread on a laptop and every page on a phone, drags a corner, presses the keys, opens the quiz, and writes contact sheets plus `report.json`. Also try the practice pages, the search (`/`) and one glossary word by hand in the browser. **Open both contact sheets and look at them.** Fix every JavaScript error and every page reported *too long* (cut words), and anything that looks wrong (a heading alone at a page foot, a box cut off, wrong direction). Rebuild and re-check until it is clean.

Deliver the single HTML file (it works offline, on phones, in an LMS, on GitHub Pages) and `book.json` for later edits. Say in one or two lines what the book contains and one natural next step (e.g. cover art with the Codex prompts, or a second volume from the same brief). Say plainly if anything was not tested.

## Editing an existing book

Read `books/<slug>/brief.json` and `book.json`, change only what was asked, keep the page count even, rebuild, re-run `test_book.py`, deliver.
