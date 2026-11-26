# Page-turn techniques in 2026: what exists, what MorphBook uses, and why

## The four ways to turn a page on the web

| Technique | How it works | Good at | Weak at |
|---|---|---|---|
| **CSS 3D rotation** | Each sheet is two faces with `backface-visibility:hidden`, rotated with `rotateY()` around the spine inside `transform-style:preserve-3d`. The Codrops "Animated Books" hardcover demo is the classic example. | Hard covers, board books, very little code | The page stays a flat board: no curl, no corner drag |
| **DOM reflection fold** | The grabbed corner and the pointer define a fold line (their perpendicular bisector). The page is clipped to the part that stays flat, and its back is clipped to the part that lifts and placed by one rigid `matrix()` (two reflections = rotation + translation). Gradients along the fold give the crease and the cast shadow. This is how page-flip libraries such as StPageFlip draw HTML pages, and it is Mantine Book's default "flat" mode. | Real corner drag, live HTML (selectable text, buttons, links), no WebGL | The fold is a straight line, not a cylinder |
| **WebGL curl mesh** | The page is a texture on a mesh bent around a cylinder in a shader (e.g. `@vysmo/flipbook`, Mantine Book's "rounded" mode, three.js PDF viewers). | The most photographic curl | Pages become pictures: no live text or buttons while turning, a canvas per book, more GPU |
| **Scroll-driven** | `animation-timeline: scroll()` / `view()` links a page-turn keyframe animation to scrolling, off the main thread. Supported in Chrome/Edge 115+, Safari 26, Firefox behind a flag. Scroll-*triggered* animations are the next step announced by Chrome in Dec 2025. | Scrollytelling books that turn as you scroll | Not a book you hold: no drag, no corners |

**MorphBook combines two of them:** the DOM reflection fold for paper pages (so a page is real HTML right up to the moment it turns, and glossary words, quiz buttons and links keep working) and CSS 3D rotation for hard covers. Pages that came from a PDF are images either way, so the fold costs nothing extra.

## Modern CSS worth using in a book

- **`clip-path: polygon()`** is the workhorse of the fold and is supported everywhere. **`clip-path: shape()`** (Chrome 135+) adds curves and can give a fold edge a slight bow; use it only inside `@supports`.
- **`corner-shape: bevel`** with `border-radius` draws a folded corner without a pseudo-element, but it is Chrome-only for now; `clip-path` is the portable fallback.
- **View Transitions** (`document.startViewTransition`) give the "morph" when the reader jumps across many pages: the old spread swings out, the new one swings in, written as ordinary CSS keyframes on `::view-transition-old/new()`. Browsers without it simply jump.
- **`color-mix()`** and custom properties let one theme recolour chrome, paper, ink and cover from a handful of tokens (`--hue`, `--paper`, `--cover1`…).
- **Logical properties** (`inset-inline-start`, `padding-inline-start`, `float: inline-start`) make one stylesheet serve Arabic and English.
- **`prefers-reduced-motion`**: MorphBook turns every page like a board and skips the morph when the reader asks for less motion.
- **The HTML-in-Canvas proposal** (an experiment in Chromium) would let live HTML be drawn into WebGL, which could join the photographic curl with live pages. Not ready for classrooms yet.

## Sound

Browsers only start audio after a click or tap, so the first sound plays on the first turn. MorphBook synthesizes the rustle with Web Audio (pink-ish noise through a band-pass filter that sweeps down while the page moves, a crisp high layer, and a low-passed landing; a low "thock" for boards). It weighs nothing and never fails to load. A recorded clip can replace it (`meta.sound.url`).

## From a normal PDF to an interactive book

What "interactive" can honestly mean for a PDF:

1. **Faithful flipbook.** Render each page (pdf.js in the browser, PyMuPDF on the command line) and turn the pictures. Keep the PDF's own aspect ratio. Pull each page's text out as narration so Read Aloud works.
2. **Enriched flipbook.** Keep the rendered pages and insert real HTML pages between them: a contents page that jumps, glossary pages, activities, a quiz at the end.
3. **Rewritten book.** Use the PDF as the source and write new pages: story, characters, key terms and activities in HTML. Text stays sharp at every size, it can be read aloud in the class's dialect, and it reflows to a phone. This is what the skill does when a teacher wants more than a copy.

Technical notes: pdf.js 3.x needs `isEvalSupported: false` (CVE-2024-4367); pdf.js workers cannot start from `file://`, so the studio loads the worker script on the main thread; WebP pages are about a third of PNG (Safari cannot encode WebP from a canvas, so the studio falls back to JPEG there).

## Sources

- Codrops, *Animated Books with CSS 3D Transforms* (the AnimatedBooks demo)
- StPageFlip, https://github.com/Nodlik/StPageFlip
- Mantine Book (flat and rounded curl), https://gfazioli.github.io/mantine-book/
- @vysmo/flipbook (WebGL curl), https://vysmo.pages.dev/flipbook/docs
- MDN, *Scroll-driven animation timelines*; Chrome for Developers, *Scroll-driven animations* and *CSS scroll-triggered animations are coming* (Dec 2025); WebKit, *A guide to scroll-driven animations with just CSS*
- CSS-Tricks, *Using CSS corner-shape for folded corners*
- pdf.js, https://github.com/mozilla/pdf.js
