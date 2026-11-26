# Studio theme pack

Set `"themePack": "studio"` in book metadata or select Studio in the PDF-to-flipbook editor. Theme styles load after the engine and before any book-specific CSS. Keep selectors scoped to `.mb-root[data-theme="studio"]`.

In `theme.css`, point `url(...)` at files relative to this folder. The builders embed those assets in the exported HTML. Use `img/` for textures and art, `icons/` for badges, and `avatars/` for characters.

## Covers

Set `meta.subjectTag` to choose a matching pair. Set `meta.coverImage` or `meta.backImage` to override either one.

| Subject tag | Front | Back |
|---|---|---|
| `space` | `img/cover-space.webp` | `img/back-space.webp` |
| `ocean` | `img/cover-ocean.webp` | `img/back-ocean.webp` |
| `nature` | `img/cover-nature.webp` | `img/back-nature.webp` |
| `maths` | `img/cover-maths.webp` | `img/back-maths.webp` |
| `language` | `img/cover-language.webp` | `img/back-language.webp` |
| `history` | `img/cover-history.webp` | `img/back-history.webp` |

## Figma source

The Studio design lives in Figma: **MorphBook · Studio Theme** — https://www.figma.com/design/CkhTqgIlQA2ms6glhpr5Cg

| Page | What it holds | Where it goes in code |
|---|---|---|
| Colors | 27 variables in the "Studio" collection, Light and Dark modes, code syntax `var(--name)` | the token block at the top of `theme.css` |
| Icons | 11 toolbar icon components `icon/<name>`, 24×24, stroke 2.2 | `icons.js` (passed to the engine as `opts.icons`) |
| Mockup | one RTL book spread built from those variables and icon instances | design reference for `theme.css` |
| Subject Icons | 20 3D clay subject icons (1024px sources, generated in Figma) | `icons/*.webp` at 128px, used with `<span class="ico ico-NAME"></span>` |

To change an icon: edit its component in Figma, copy its path data into `icons.js`, rebuild, run `tools/test_book.py`.
