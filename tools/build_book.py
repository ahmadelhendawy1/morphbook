#!/usr/bin/env python3
"""Build one self-contained MorphBook HTML file from a book.json.

    python tools/build_book.py examples/marine-life-ar/book.json -o dist/marine-life-ar.html
    python tools/build_book.py book.json -o out.html --link        # link engine files (development)
    python tools/build_book.py book.json -o out.html --no-embed    # keep images as separate files

By default the engine CSS/JS are inlined and every local image (pages[].image)
is embedded as a data URI, so the result is ONE file that works offline,
from a USB stick, in an LMS or on GitHub Pages.
Only the Python standard library is used.
"""
import argparse
import base64
import json
import mimetypes
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VERSION = "1.0.0"


def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def data_uri(path):
    mime = mimetypes.guess_type(path)[0] or "application/octet-stream"
    if path.lower().endswith(".webp"):
        mime = "image/webp"
    with open(path, "rb") as f:
        return "data:%s;base64,%s" % (mime, base64.b64encode(f.read()).decode("ascii"))


def check(book):
    """Catch the mistakes that make a book fail to open."""
    errors = []
    if not isinstance(book.get("pages"), list) or not book["pages"]:
        errors.append("book.pages must be a non-empty list")
    for i, p in enumerate(book.get("pages", [])):
        t = p.get("type", "image" if p.get("image") else "html")
        if t == "image" and not p.get("image"):
            errors.append("page %d: type image needs 'image'" % (i + 1))
        if t == "html" and not p.get("html"):
            errors.append("page %d: type html needs 'html'" % (i + 1))
    for i, q in enumerate(book.get("quiz", [])):
        ans = q.get("a", q.get("correct"))
        if ans not in q.get("options", []):
            errors.append("quiz %d: the answer is not one of the options" % (i + 1))
    return errors


def build(src, out, link=False, embed=True):
    book = json.loads(read(src))
    errs = check(book)
    if errs:
        sys.exit("book.json problems:\n  - " + "\n  - ".join(errs))
    base = os.path.dirname(os.path.abspath(src))
    if embed:
        for p in book["pages"]:
            img = p.get("image")
            if img and not img.startswith(("data:", "http://", "https://")):
                path = os.path.join(base, img)
                if not os.path.exists(path):
                    sys.exit("missing image: %s" % path)
                p["image"] = data_uri(path)
    meta = book.get("meta", {})
    if embed:
        for key in ("coverImage", "backImage", "paperImage"):
            img = meta.get(key)
            if img and not img.startswith(("data:", "http://", "https://")):
                path = os.path.join(base, img)
                if not os.path.exists(path):
                    sys.exit("missing image: %s" % path)
                meta[key] = data_uri(path)
    lang = meta.get("lang", "ar" if meta.get("dir") == "rtl" else "en")
    direction = meta.get("dir", "rtl" if lang == "ar" else "ltr")
    html = read(os.path.join(ROOT, "templates", "book.html"))
    css = read(os.path.join(ROOT, "engine", "morphbook.css"))
    js = read(os.path.join(ROOT, "engine", "morphbook.js"))
    data = json.dumps(book, ensure_ascii=False).replace("</", "<\\/")
    title = (meta.get("title") or "Book").replace("<", "&lt;")
    extra_css = book.get("css", "")
    if link:
        rel = os.path.relpath(os.path.join(ROOT, "engine"), os.path.dirname(os.path.abspath(out))).replace(os.sep, "/")
        html = html.replace("/*__MORPHBOOK_CSS__*/", "</style><link rel=\"stylesheet\" href=\"%s/morphbook.css\"><style>" % rel)
        html = html.replace("<script>\n/*__MORPHBOOK_JS__*/\n</script>", "<script src=\"%s/morphbook.js\"></script>" % rel)
    else:
        html = html.replace("/*__MORPHBOOK_CSS__*/", css)
        html = html.replace("/*__MORPHBOOK_JS__*/", js.replace("</script", "<\\/script"))
    html = (html.replace("/*__BOOK_CSS__*/", extra_css)
                .replace("__BOOK_JSON__", data)
                .replace("__BOOK_TITLE__", title)
                .replace("__LANG__", lang)
                .replace("__DIR__", direction)
                .replace("__VERSION__", VERSION))
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)
    print("built %s (%d pages, %.0f KB)" % (out, len(book["pages"]), os.path.getsize(out) / 1024))


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("book", help="path to book.json")
    ap.add_argument("-o", "--out", help="output HTML (default: index.html beside book.json)")
    ap.add_argument("--link", action="store_true", help="link engine files instead of inlining them")
    ap.add_argument("--no-embed", action="store_true", help="do not embed local images")
    a = ap.parse_args()
    build(a.book, a.out or os.path.join(os.path.dirname(a.book) or ".", "index.html"), a.link, not a.no_embed)
