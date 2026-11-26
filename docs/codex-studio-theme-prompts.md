# Codex prompt pack · the "Studio" core theme

A sleek, warm, 3D-animated-film look for MorphBook: rich saturated colours, soft rounded shapes, glossy materials, gentle bounce. Run the prompts **in order** in Codex opened on the `morphbook` repo. Each prompt ends with a build and a browser check, so every phase is tested before the next one starts.

**Why the style is described, not named:** image tools often refuse "in the style of Pixar" and may copy characters. Describe the qualities instead (rounded appealing shapes, soft global illumination, subsurface skin, saturated cheerful palette) and never ask for a studio's characters.

**Rules for every image:** no text or letters inside images · original designs only, no known characters or logos · WebP quality 85 (PNG with transparency for icons and avatars) · save under `themes/studio/`.

---

## Prompt 0 · Set up the theme folder and loading (run once, first)

```
You are working in the MorphBook repo (interactive flipbook engine: engine/morphbook.js + engine/morphbook.css,
built by tools/build_book.py). Read engine/morphbook.css sections 1, 3 and 7, docs/book-json.md and
tools/build_book.py before changing anything.

Goal: let a book load a full theme pack from a folder, so the new "Studio" theme lives in themes/studio/.

1. Create themes/studio/ with: theme.css (empty for now), img/, icons/, avatars/, README.md.
2. In tools/build_book.py add support for meta.themePack = "studio": read themes/<pack>/theme.css, replace every
   url(...) that points to a local file with a base64 data URI (same helper as page images), and inline the CSS
   AFTER engine/morphbook.css so it overrides it. Also set data-theme="<pack>" automatically.
   Do the same in tools/build_studio.py so the studio's export can include a theme pack.
3. Keep the engine's public API unchanged and keep every existing theme working.
4. Run: python tools/build_all.py, then python tools/test_book.py on each file in dist/books/.
   All three books must report 0 problems. Show me the output.
```

## Prompt 1 · Colour system and tokens

```
Write the Studio theme's colour system into themes/studio/theme.css as a
.mb-root[data-theme="studio"]{...} block that sets ONLY the existing tokens from engine/morphbook.css section 1
(--hue, --paper, --paper-edge, --paper-tint, --ink, --ink-soft, --ink-faint, --accent, --accent-deep,
--accent-wash, --cover1, --cover2, --cover-ink, --bg1, --bg2, --gold, --ok, --ok-wash, --bad, --bad-wash, --grain,
--font, --ui, --display) plus these new ones you then use in later prompts:
  --sky1 --sky2 (stage sky gradient), --sun (warm highlight), --coral, --mint, --grape, --lemon, --berry,
  --shadow-soft (a warm, coloured shadow, never pure black), --radius-l (28px), --radius-m (18px),
  --spring (a CSS linear() spring easing with a small overshoot), --pop (cubic-bezier(.34,1.56,.64,1)).

Look: a sunny animated-film palette. Sky blue and warm sunshine as the base, coral and mint accents, cream paper
(#FFF8EC-ish, never pure white), deep warm ink (no pure black, e.g. #2B2340). Shadows tinted purple-blue.

Fonts: --display 'Baloo Bhaijaan 2' (rounded, has Arabic and Latin), --font 'Baloo Bhaijaan 2' for Arabic books and
'Nunito' for English, --ui 'Nunito','Baloo Bhaijaan 2'. Add the Google Fonts link to templates/book.html and
studio/studio.src.html.

Also add a dark variant: .mb-root[data-theme="studio"][data-mode="dark"] as a "night scene" (deep navy sky,
warm lamp-light accents) instead of grey.

Check contrast with a small Python script: --ink on --paper, --ink-soft on --paper, #fff on --accent,
--cover-ink on --cover1, light and dark. Every pair must reach WCAG AA 4.5:1 (3:1 for text ≥ 24px). Print the table
and fix any failing colour. Then build and run test_book.py on dist/books/solar-system-ar.html with
"themePack":"studio" set in a copy of its book.json (examples/studio-demo/book.json).
```

## Prompt 2 · The book frame and reader chrome (CSS container)

```
In themes/studio/theme.css style the reader around the pages. Use only Studio tokens; logical properties so RTL works;
everything must respect prefers-reduced-motion.

1. Stage: a soft sky gradient (--sky1 → --sky2) with 6–8 blurred bokeh circles made with radial-gradients on
   .mb-stage::before (no images), drifting very slowly (60s+ animation, transform only).
2. The book as a chunky hardcover object:
   - rounded outer corners (--radius-m on the outer edges only, square at the spine);
   - visible page-stack thickness on the outer edges using the existing --stack custom property, recoloured to
     cream and peach layers;
   - a soft coloured ground shadow under the book (an ellipse ::after under .mb-book, --shadow-soft, blurred);
   - a fabric bookmark ribbon (coral, with a V-cut end via clip-path) hanging from the top of the recto page;
   - metal-free rounded corner protectors on the hard covers (.mb-page.hard) drawn with gradients.
3. Toolbar (.mb-bar): a floating glossy pill, 12px from the top, centred, max-width 720px, white glass
   (backdrop-filter) with an inner top highlight; tool buttons are round, bounce to scale(1.12) on hover with
   var(--pop), pressed state sinks 2px.
4. Bottom nav: big round "candy" buttons for prev/next (--coral, inner gloss highlight, coloured shadow), the
   scrubber as a thick rounded track with a lemon thumb.
5. Progress bar: a striped "candy" bar (repeating-linear-gradient) that animates its stripes slowly.
6. Drawer and quiz modal: --radius-l cards, springy entrance (var(--spring)).

Do NOT change engine geometry: never set transform, width, height, left or top on .mb-book, .mb-slot, .mb-flip,
.mb-front, .mb-flap or .mb-sheet (the engine writes those every frame). Only decorate.
Build examples/studio-demo and run test_book.py; open the laptop and phone contact sheets and the drag frame, and
fix anything that overlaps the pages or the toolbar.
```

## Prompt 3 · Page design (paper and content blocks)

```
Restyle the page-content vocabulary (.pg blocks, see docs/book-json.md) for Studio in themes/studio/theme.css.

- Paper: warm cream with a very subtle paper texture (generate themes/studio/img/paper.webp: "seamless tileable warm
  cream drawing paper texture, soft even light, extremely low contrast, no objects, no text", 1024x1024, then use
  it as background-image on .mb-root[data-theme=studio] .mb-page at 50% opacity feel). Keep text readable.
- h2: chunky rounded display font, ink colour, with a hand-drawn-looking underline made from an SVG data URI wave in
  --coral.
- .hook: a lemon highlighter-marker effect behind the text (background linear-gradient on the lower 40% of the line).
- .kterm: a "sticker" card: white, --radius-m, slight rotation (-1deg), thick white border, coloured shadow, small
  star badge in the corner.
- .callout tone-tip/example/warning: rounded cards with a round icon badge on the inline-start side (use the icons
  from Prompt 4 when they exist; emoji fallback until then), mint / grape / coral tints.
- .activity: a note card "taped" to the page: two semi-transparent tape strips (::before/::after) at the corners.
- .dlg: speech bubbles. The line sits in a rounded bubble with a tail toward an avatar circle on the inline-start
  side; the avatar comes from .dlg[data-who="<name>"] (Prompt 5). Alternate bubble colours for two speakers.
- .term: a soft mint underline that wiggles once on hover (respect reduced motion).
- .emoji-hero and figures: centred with a soft coloured drop shadow and a gentle 4s floating animation.
- .qbtn: big glossy coral button with a bounce on hover.
- .pgnum: a small round coloured badge.
- Cover (.pg.cover): title in the display font with a thick soft outline (paint-order stroke) so it reads on any art,
  subtitle on a rounded translucent pill, author name in --gold.

Text must stay sharp and inside the paper: after building, run test_book.py; any page reported "too long" means your
spacing grew, so reduce padding and margins, not the font size. Compare the contact sheets before and after.
```

## Prompt 4 · Icons

```
Make two icon sets for Studio.

A. UI icons as code (crisp at any size): rewrite the 11 icons in the ICON map of engine/morphbook.js
   (menu, sound, mute, read, stop, moon, full, print, quiz, left, right) as a Studio variant in
   themes/studio/icons.js: same 24x24 viewBox, rounded friendly strokes (stroke-width 2.2, round caps and joins),
   slightly chunkier proportions. Add a way for a theme pack to override the ICON map (window.MorphBookIcons read by
   the engine before building the toolbar; build_book.py inlines themes/<pack>/icons.js when present). Default icons
   stay unchanged for other themes.

B. Illustrated subject icons with the image tool, 512x512 PNG with transparent background, one per file in
   themes/studio/icons/:
   science, maths, arabic, english, history, geography, art, music, sports, computer, space, ocean, plants, animals,
   human-body, chemistry, physics, reading, quiz-trophy, star, lightbulb, warning, magnifier, target.
   Prompt template for each:
   "cute 3D icon of a {object}, rounded appealing shapes, soft studio lighting, glossy clay-like material, bright
   saturated cheerful colours from this palette {--coral --mint --lemon --grape --sky1 hex values}, gentle soft
   shadow, centred, isolated on a transparent background, no text, no letters, no face unless it is an animal"
   Keep the camera angle (three-quarter view from slightly above), light direction (top-left) and material
   identical across all 24 so they read as one family. Make a contact sheet docs/img/studio-icons.webp.
   Then use lightbulb / magnifier / warning / target as the badges of .callout tone-tip / tone-example /
   tone-warning and .activity in theme.css, and quiz-trophy on the quiz page.
Build and test as usual.
```

## Prompt 5 · Characters and dialogue avatars

```
Create two original child characters and a robot sidekick for Studio books (no resemblance to any existing film
characters):
  - Youssef: Egyptian boy, about 10, curly dark hair, big curious eyes, orange hoodie.
  - Mariam: Egyptian girl, about 10, braided hair with a yellow clip, teal jacket, confident smile.
  - Negm: a small round white-and-sky-blue helper robot with a glowing face screen and one antenna.
Step 1: a character sheet 1536x1024 PNG: each character front and three-quarter view, three expressions each
(happy, curious, surprised), soft studio lighting, rounded appealing 3D animated-film look, saturated warm palette,
plain light background, no text. Save themes/studio/avatars/cast-sheet.png.
Step 2: using the sheet as the reference image so faces and clothes stay identical, make round avatar busts
512x512 PNG with transparent background: youssef-happy, youssef-curious, youssef-surprised, mariam-…, negm-….
Step 3: in theme.css, .dlg[data-who="youssef"] etc. show the matching avatar in the bubble's avatar circle;
data-mood="curious|surprised" switches the expression. Document the attributes in docs/book-json.md.
Step 4: update examples/studio-demo/book.json dialogue lines to use data-who / data-mood, build and test.
```

## Prompt 6 · Cover templates

```
Generate six cover illustrations for Studio, 1024x1424 portrait, no text, the top 45% calm and simple so a live
HTML title can sit on it, the cast from Prompt 5 in the lower half where a story needs them (use the cast sheet as
reference). Rounded appealing 3D animated-film look, soft global illumination, rich saturated palette, cinematic
depth of field:
  1 space (planets, a small rocket, starry gradient sky)      → themes/studio/img/cover-space.webp
  2 ocean (coral reef, light rays from the surface)          → cover-ocean.webp
  3 nature (giant friendly leaves, sunbeams, a butterfly)    → cover-nature.webp
  4 maths (floating rounded number blocks and shapes)        → cover-maths.webp
  5 language (an open book with letters flying out as birds – birds only, no actual letters) → cover-language.webp
  6 history (a warm desert scene with pyramids at golden hour) → cover-history.webp
Also make a matching back-cover texture for each (soft pattern of the cover's motifs, 1024x1424): back-*.webp.
Add a "covers" table to themes/studio/README.md mapping subject → cover and back files.
Teach tools/build_book.py: when meta.themePack is "studio" and meta.coverImage is missing, choose the cover from
meta.subjectTag (space, ocean, nature, maths, language, history), and likewise meta.backImage.
Build examples/studio-demo with each cover in turn (six screenshots of the closed book) and make
docs/img/studio-covers.webp. Fix any cover where the title is hard to read by strengthening the cover overlay in CSS.
```

## Prompt 7 · Motion polish and the quiz as a game show

```
Add Studio-only motion in theme.css and a tiny themes/studio/fx.js (inlined by build_book.py for the pack):
- Page-turn landing: a 1-frame-soft "settle" on the newly shown pages (scale 1.004 → 1 with var(--spring)),
  triggered by a class the engine already re-renders (use the onPage hook in MorphBook.mount options; add
  window.MorphBookTheme = { onPage(pages, book){...} } support in the template if needed).
- Quiz: the modal header becomes a game-show banner (grape → coral gradient, star sparkles), answers are big rounded
  tiles in four Studio colours, a right answer pops with var(--pop) and a small confetti burst (canvas, 40 pieces,
  1.2s, reduced-motion = no confetti), the final score ring is a glossy candy ring with the quiz-trophy icon.
- Never animate layout properties; transforms and opacity only; nothing runs while a page is being dragged
  (book.state === 'drag').
Build, run test_book.py, and also record a 6-second Playwright video of: open cover → drag a page → open quiz →
answer two questions. Save docs/img/studio-demo.webm and check it for jank.
```

## Prompt 8 · Final integration check

```
Make Studio a first-class theme:
1. Add "studio" to the theme list in studio/studio.src.html (with a preview swatch) and to COVERS in
   tools/build_all.py; the studio export must include the theme pack.
2. Add a "Studio" section to README.md with the icon sheet, the cover sheet and the demo video.
3. Run python tools/build_all.py and python tools/test_book.py on every dist/books/*.html.
   Report: problems (must be 0), pages too long (must be 0), the contrast table from Prompt 1, total size of
   dist/books/studio-demo.html (keep under 2.5 MB: shrink WebP quality or icon sizes if needed).
4. Open every contact sheet yourself and list anything that still looks off, then fix it.
```
