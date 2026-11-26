#!/usr/bin/env python3
"""Build dist/studio.html: the PDF-to-flipbook studio as ONE offline file.

    python tools/build_studio.py            # -> dist/studio.html

pdf.js, its worker (run on the main thread, so it also works from file://),
the MorphBook engine and the book template are all inlined.
"""
import json
import os

from build_book import THEMES, data_uri, engine_js, load_theme_pack, studio_cover_paths

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VERSION = "1.1.0"


def read(*p):
    with open(os.path.join(ROOT, *p), encoding="utf-8") as f:
        return f.read()


def safe_js(s):
    return s.replace("</script", "<\\/script")


def main(out=os.path.join(ROOT, "dist", "studio.html")):
    css, js, tpl = read("engine", "morphbook.css"), engine_js(), read("templates", "book.html")
    packs = {path.parent.name: load_theme_pack(path.parent.name) for path in sorted(THEMES.glob("*/theme.css"))}
    covers = {
        subject: {key: data_uri(str(path)) for key, path in paths.items()}
        for subject, paths in studio_cover_paths().items()
    }
    bundle = "window.__MB__=" + json.dumps({
        "tpl": tpl, "css": css, "js": js, "version": VERSION, "packs": packs, "studioCovers": covers,
    }).replace("</", "<\\/") + ";"
    html = read("studio", "studio.src.html")
    for key, val in (("/*__MB_CSS__*/", css),
                     ("/*__PDFJS__*/", safe_js(read("vendor", "pdfjs", "pdf.min.js"))),
                     ("/*__PDFWORKER__*/", safe_js(read("vendor", "pdfjs", "pdf.worker.min.js"))),
                     ("/*__MB_JS__*/", safe_js(js)),
                     ("/*__STUDIO_FX__*/", safe_js(packs.get("studio", {}).get("js", ""))),
                     ("/*__MB_BUNDLE__*/", bundle)):
        assert key in html, key
        html = html.replace(key, val, 1)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)
    print("built %s (%.0f KB)" % (out, os.path.getsize(out) / 1024))


if __name__ == "__main__":
    main()
