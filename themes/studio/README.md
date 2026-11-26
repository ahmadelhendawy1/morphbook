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
