# Prompts for Codex (with image generation)

Paste these into Codex opened on this repository. They assume Codex can generate images (its image tool / `gpt-image`) and run Python. Each prompt names the files to touch and ends with the build and the browser check, so the result is tested, not just written.

Image rules that apply to every prompt:
- **No text inside generated images.** Titles, names and Arabic stay live HTML on top, so they are sharp, translatable and spelled right.
- Book pages are **0.72 wide : 1 tall** (portrait). Use **1024×1424** for covers and full-page art; **1024×1024** for seamless tiles.
- Save as WebP (quality 82) under `examples/<book>/img/` or `themes/<theme>/`, and reference them by relative path in `book.json`; `build_book.py` embeds them.
- No real people, no brand characters, no logos.

---

## 1. A complete new theme (CSS + generated art)

```
You are working in the MorphBook repo (an interactive flipbook engine).
Read engine/morphbook.css section 1 (theme tokens) and docs/book-json.md first.

Create a new theme called "{{THEME_NAME}}" with this mood: {{MOOD, e.g. "underwater watercolor, calm, for ages 8-11"}}.

1. Add a block `.mb-root[data-theme="{{THEME_NAME}}"]{...}` next to the other themes in engine/morphbook.css.
   Set only tokens: --hue, --paper, --paper-edge, --paper-tint, --ink, --ink-soft, --accent, --accent-deep,
   --accent-wash, --cover1, --cover2, --bg1, --bg2, --gold, --grain, and --font/--display only if the mood needs a
   different typeface (Arabic must still fall back to 'Cairo','Noto Naskh Arabic').
   Check contrast: --ink on --paper and #fff on --accent must reach WCAG AA (4.5:1). Print the ratios.
2. Generate with the image tool, no text in any image:
   a. themes/{{THEME_NAME}}/paper.webp – a SEAMLESS, very subtle paper texture tile, 1024x1024, almost flat,
      light enough that dark text on it stays readable. Prompt: "seamless tileable {{paper kind}} paper texture,
      soft even lighting, very low contrast, no objects, no text, top-down, high detail fibers".
   b. themes/{{THEME_NAME}}/cover.webp – cover art 1024x1424 in the theme's mood, with calm space in the top 45%
      for a title. Prompt: "{{subject}} illustration, {{style}}, portrait book cover composition, generous empty
      area at the top for a title, no text, no letters, no logo".
3. Add the theme to the THEMES list in studio/studio.src.html and COVERS in tools/build_all.py (two cover colours).
4. Make examples/theme-{{THEME_NAME}}/book.json: copy examples/cells-en/book.json, set meta.theme,
   meta.coverImage "../../themes/{{THEME_NAME}}/cover.webp" and meta.paperImage "../../themes/{{THEME_NAME}}/paper.webp".
5. Run: python tools/build_all.py && python tools/test_book.py dist/books/theme-{{THEME_NAME}}.html
   Open the laptop and phone contact sheets it prints, look at them, and fix anything unreadable or misaligned.
Report the contrast ratios, the files you added and the two sheet paths.
```

## 2. Cover art for one book

```
Generate a book cover illustration for MorphBook, 1024x1424, no text, no letters.
Book: "{{TITLE}}" for {{GRADE}} {{SUBJECT}}. Characters: {{e.g. "Karim (10, curly hair, yellow raincoat) and
Salma (10, braids, green backpack), Egyptian kids"}}. Scene: {{the book's opening scene}}.
Style: {{e.g. "warm gouache picture-book illustration, soft rim light, rich {{theme}} palette"}}.
Composition: the top 45% is quiet sky/water/space for the title; characters in the lower half, looking into the scene.
Save to examples/{{BOOK}}/img/cover.webp and set meta.coverImage in examples/{{BOOK}}/book.json to "img/cover.webp".
Then run python tools/build_book.py examples/{{BOOK}}/book.json -o dist/books/{{BOOK}}.html and check the cover
title is readable over the art (the engine adds a dark gradient at the bottom; add more only if needed via meta.css).
```

## 3. Consistent characters across the whole book

```
Step 1: generate a character sheet, 1536x1024, no text: {{CHARACTER DESCRIPTIONS}}, front, side and three
expressions each (happy, curious, surprised), flat light grey background, {{STYLE}}. Save as
examples/{{BOOK}}/img/cast.webp.
Step 2: for each chapter page listed below, generate a 1024x640 illustration using the character sheet as the
reference image so faces, clothes and colours stay identical. No text. Save as img/ch{{N}}.webp.
{{LIST: page index → scene}}
Step 3: in book.json add each picture to its page html as the first block after <h2>:
<figure><img src="img/chN.webp" alt="{{short description in the book's language}}"></figure>
Keep each page within ~110 words; if a page becomes too long, shorten the text, never the font.
Step 4: build, run tools/test_book.py, and fix every page it reports as too long.
```

## 4. Endpapers and chapter openers

```
Generate a seamless endpaper pattern, 1024x1024, no text: small repeating motifs of {{motifs}} in two tones of
the {{THEME}} palette, vintage book endpaper style. Save themes/{{THEME}}/endpaper.webp.
In examples/{{BOOK}}/book.json make page 1 (inside front cover) and the page before the back cover
{"type":"blank","bg":"url(img/endpaper.webp) center/320px"} (copy the file into the book's img/ folder),
keeping the total page count even so the back cover closes alone.
Build and test as usual.
```

## 5. New page layouts as CSS templates (no images)

```
In engine/morphbook.css section 7 add three opt-in page layouts, used as extra classes on .pg:
  .pg.notebook – lined exercise-book paper: ruled lines with repeating-linear-gradient aligned to the text
                 line-height, a red margin line on the inline-start side (correct in RTL too);
  .pg.magazine – two text columns (column-count:2, column-rule), a big pull quote style for <blockquote>;
  .pg.comic    – a CSS grid of 2-4 panels (.panel) with thick borders and speech bubbles (.bubble) whose tail
                 points with a clip-path triangle, mirrored in RTL.
Use only theme tokens (var(--ink), var(--accent) ...) so every theme recolours them, and logical properties
so Arabic works. Add one page of each to examples/cells-en/book.json and examples/marine-life-ar/book.json
(keep the page counts even), document them in docs/book-json.md, then build_all.py and test_book.py both books
and look at the contact sheets.
```

## 6. A marketing mock-up of a finished book

```
Generate a photorealistic mock-up, 1600x1000, of an open hardcover children's book lying on a wooden classroom
desk, soft window light, shallow depth of field. Leave both open pages plain white (they will be replaced).
No text anywhere. Save as docs/img/mockup-base.webp.
Then take two screenshots of dist/books/{{BOOK}}.html with Playwright (one spread) and composite them onto the
open pages with a perspective warp in Python (Pillow + numpy), adding a gentle gutter shadow.
Save docs/img/mockup-{{BOOK}}.webp and add it to the top of README.md.
```

## 7. Ask Codex to improve the curl itself

```
Read engine/morphbook.js, sections "Geometry of the fold" and Book.prototype.draw.
Add an optional curved fold edge: when CSS.supports('clip-path','shape(from 0 0, line to 1px 1px)') is true,
draw the flap clip with clip-path: shape() and bow the fold edge slightly (control point offset 4% of the
fold length toward the flap) so the page looks rounded; keep polygon() as the fallback.
Do not change the public API. Verify with tools/test_book.py on both examples and attach the drag frames
(laptop-drag.png) before and after.
```
