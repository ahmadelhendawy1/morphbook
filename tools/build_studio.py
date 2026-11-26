#!/usr/bin/env python3
"""Build dist/studio.html: the PDF-to-flipbook studio as ONE offline file.

    python tools/build_studio.py            # -> dist/studio.html

pdf.js, its worker (run on the main thread, so it also works from file://),
the MorphBook engine and the book template are all inlined.
"""
import json
import re
import os

from build_book import FONTS, THEMES, data_uri, engine_js, load_theme_pack, studio_cover_paths

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VERSION = "1.1.0"


def read(*p):
    with open(os.path.join(ROOT, *p), encoding="utf-8") as f:
        return f.read()


def safe_js(s):
    return s.replace("</script", "<\\/script")


def font_faces():
    """Every vendored font as a ready @font-face rule: the Studio uses them itself and writes the ones a book needs into its download."""
    faces = json.loads(read("vendor", "fonts", "fonts.json"))
    return [{"family": f["family"], "subset": f["subset"],
             "rule": "@font-face{font-family:'%s';font-style:%s;font-weight:%s;font-display:swap;src:url(%s) format('woff2');%s}" % (
                 f["family"], f["style"], f["weight"], data_uri(str(FONTS / f["file"])).replace("application/octet-stream", "font/woff2"),
                 ("unicode-range:%s;" % f["range"]) if f["range"] else "")} for f in faces]


SHELL = ('<link rel="stylesheet" href="/assets/ai4-shell.css">\n'
         '<script src="/assets/ai4-shell.js" defer></script>\n')


def main(out=os.path.join(ROOT, "dist", "studio.html"), hosting=False):
    css, js, tpl = read("engine", "morphbook.css"), engine_js(), read("templates", "book.html")
    packs = {path.parent.name: load_theme_pack(path.parent.name) for path in sorted(THEMES.glob("*/theme.css"))}
    covers = {
        subject: {key: data_uri(str(path)) for key, path in paths.items()}
        for subject, paths in studio_cover_paths().items()
    }
    bundle = "window.__MB__=" + json.dumps({
        "tpl": tpl, "css": css, "js": js, "version": VERSION, "packs": packs, "studioCovers": covers, "fonts": font_faces(),
        "hosting": hosting,
    }).replace("</", "<\\/") + ";"
    html = read("studio", "studio.src.html")
    # no online fonts: the Studio installs the embedded ones itself (see __MB__.fonts)
    head, rest = html.split("</head>", 1)          # only the page's own <head>: the script below contains the same patterns
    head = re.sub(r'<link rel="preconnect" href="[^"]*"[^>]*>\n?', "", head)
    head = re.sub(r'<link href="https://fonts\.googleapis\.com[^"]*" rel="stylesheet">\n?', "", head)
    html = head + "</head>" + rest
    if hosting:                                   # ai4edutech.com: the site's navbar and shared styles
        html = html.replace("</head>", SHELL + "</head>", 1)
    for key, val in (("/*__MB_CSS__*/", css),
                     ("/*__PDFJS__*/", safe_js(read("vendor", "pdfjs", "pdf.min.js"))),
                     ("/*__PDFWORKER__*/", safe_js(read("vendor", "pdfjs", "pdf.worker.min.js"))),
                     ("/*__MB_JS__*/", safe_js(js)),
                     ("/*__STUDIO_FX__*/", safe_js(packs.get("studio", {}).get("js", ""))),
                     ("/*__MB_BUNDLE__*/", bundle),
                     ("/*__AI_ROUTE__*/", safe_js(read("studio", "ai-route.js")))):
        assert key in html, key
        html = html.replace(key, val, 1)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)
    print("built %s (%.0f KB)" % (out, os.path.getsize(out) / 1024))


if __name__ == "__main__":
    import sys
    if "--hosting" in sys.argv:                   # the file to upload to Hostinger as public_html/apps/morphbook/index.html
        main(os.path.join(ROOT, "dist", "hostinger", "public_html", "apps", "morphbook", "index.html"), hosting=True)
    else:
        main()
