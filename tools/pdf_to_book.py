#!/usr/bin/env python3
"""Turn a PDF (or a folder of page images) into a MorphBook book.json + page images.

    pip install pymupdf pillow
    python tools/pdf_to_book.py lesson.pdf -o books/lesson --title "My Lesson" --dir rtl --theme ocean
    python tools/build_book.py books/lesson/book.json -o dist/lesson.html

What it does
  - renders every page to WebP (sharp on a laptop screen, light enough for a phone)
  - keeps the PDF's own page shape (aspect) so nothing is cropped or stretched
  - pulls each page's text into `narration`, so Read Aloud works on a scanned-free PDF
  - marks the first and last pages as hard covers (turn off with --no-hard)
  - guesses right-to-left when most of the text is Arabic (override with --dir)
  - --split splits scanned two-page spreads (landscape pages) into two pages
The result is a normal book.json: open it and add interactive pages, a quiz,
glossary terms or narration before building.
"""
import argparse
import io
import json
import os
import re
import sys

try:
    import pymupdf as fitz
except ImportError:
    try:
        import fitz
    except ImportError:
        sys.exit("needs PyMuPDF:  pip install pymupdf pillow")
from PIL import Image

AR = re.compile(r"[؀-ۿ]")


def save_webp(img, path, quality):
    img.save(path, "WEBP", quality=quality, method=5)


def render_pdf(pdf, out_dir, width, quality, split):
    doc = fitz.open(pdf)
    pages, texts, aspect = [], [], None
    os.makedirs(os.path.join(out_dir, "pages"), exist_ok=True)
    n = 0
    for page in doc:
        rect = page.rect
        zoom = width / rect.width
        is_spread = split and rect.width > rect.height * 1.15
        if is_spread:
            zoom = width * 2 / rect.width
        pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False)
        img = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
        text = re.sub(r"\s+", " ", page.get_text("text")).strip()
        parts = [img.crop((0, 0, img.width // 2, img.height)), img.crop((img.width // 2, 0, img.width, img.height))] if is_spread else [img]
        for k, part in enumerate(parts):
            n += 1
            name = "pages/p%03d.webp" % n
            save_webp(part, os.path.join(out_dir, name), quality)
            if aspect is None:
                aspect = round(part.width / part.height, 4)
            pages.append(name)
            texts.append(text if k == 0 else "")
        print("  page %d rendered" % n, end="\r")
    print()
    return pages, texts, aspect


def images_from_folder(folder, out_dir, width, quality):
    exts = (".png", ".jpg", ".jpeg", ".webp")
    files = sorted(f for f in os.listdir(folder) if f.lower().endswith(exts))
    if not files:
        sys.exit("no images in %s" % folder)
    os.makedirs(os.path.join(out_dir, "pages"), exist_ok=True)
    pages, aspect = [], None
    for i, f in enumerate(files, 1):
        img = Image.open(os.path.join(folder, f)).convert("RGB")
        if img.width > width:
            img = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
        name = "pages/p%03d.webp" % i
        save_webp(img, os.path.join(out_dir, name), quality)
        aspect = aspect or round(img.width / img.height, 4)
        pages.append(name)
    return pages, [""] * len(pages), aspect


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("source", help="a .pdf file or a folder of page images")
    ap.add_argument("-o", "--out", required=True, help="output folder (book.json + pages/)")
    ap.add_argument("--title"); ap.add_argument("--author"); ap.add_argument("--org")
    ap.add_argument("--grade"); ap.add_argument("--subject")
    ap.add_argument("--dir", choices=["ltr", "rtl"], help="reading direction (default: guessed from the text)")
    ap.add_argument("--theme", default="classic")
    ap.add_argument("--width", type=int, default=1100, help="rendered page width in pixels (default 1100)")
    ap.add_argument("--quality", type=int, default=80, help="WebP quality (default 80)")
    ap.add_argument("--split", action="store_true", help="split landscape scanned spreads into two pages")
    ap.add_argument("--no-hard", action="store_true", help="do not make the first/last pages hard covers")
    a = ap.parse_args()

    if os.path.isdir(a.source):
        pages, texts, aspect = images_from_folder(a.source, a.out, a.width, a.quality)
    else:
        pages, texts, aspect = render_pdf(a.source, a.out, a.width, a.quality, a.split)

    alltext = " ".join(texts)
    letters = re.findall(r"[^\W\d_]", alltext)
    arabic = len(AR.findall(alltext))
    direction = a.dir or ("rtl" if letters and arabic / len(letters) > .4 else "ltr")
    lang = "ar" if direction == "rtl" else "en"
    title = a.title or os.path.splitext(os.path.basename(a.source.rstrip("/\\")))[0].replace("_", " ").replace("-", " ")

    book_pages = []
    for i, (img, txt) in enumerate(zip(pages, texts)):
        p = {"type": "image", "image": img, "title": "%s %d" % ("صفحة" if lang == "ar" else "Page", i + 1)}
        if i == 0:
            p["title"] = "الغلاف" if lang == "ar" else "Cover"
        if txt:
            p["narration"] = txt[:1500]
        if not a.no_hard and (i == 0 or (i == len(pages) - 1 and len(pages) > 2)):
            p["hard"] = True
        book_pages.append(p)

    meta = {k: v for k, v in {
        "id": re.sub(r"\W+", "-", title).strip("-").lower() or "book",
        "title": title, "author": a.author, "org": a.org, "grade": a.grade, "subject": a.subject,
        "lang": lang, "dir": direction, "theme": a.theme, "aspect": aspect,
        "sound": {"enabled": True, "volume": 0.7}}.items() if v is not None}
    book = {"meta": meta, "pages": book_pages, "quiz": []}
    with open(os.path.join(a.out, "book.json"), "w", encoding="utf-8") as f:
        json.dump(book, f, ensure_ascii=False, indent=2)
    print("wrote %s/book.json: %d pages, aspect %.3f, %s" % (a.out, len(book_pages), aspect or 0, direction))


if __name__ == "__main__":
    main()
