#!/usr/bin/env python3
"""Build everything into dist/: every example book, the studio and the gallery page.

    python tools/build_all.py
"""
import html
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_book  # noqa: E402
import build_studio  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")
COVERS = {"classic": ("#2f5fa8", "#16305e"), "ocean": ("#0f5c80", "#062a44"), "nature": ("#2f6b3e", "#173a22"),
          "cosmic": ("#3b1d73", "#0d0726"), "sunset": ("#c2522b", "#6d1f3d"), "vintage": ("#6b3f22", "#33190b"),
          "blossom": ("#c45a7c", "#6e2341"), "arctic": ("#7fb5cf", "#2c5d78"), "royal": ("#4b1f6e", "#1f0a33"),
          "desert": ("#b9822f", "#5e3a12"), "chalkboard": ("#24382e", "#5b3a22"), "blueprint": ("#123a63", "#061a30")}


def main():
    books = []
    ex = os.path.join(ROOT, "examples")
    for name in sorted(os.listdir(ex)):
        src = os.path.join(ex, name, "book.json")
        if not os.path.exists(src):
            continue
        build_book.build(src, os.path.join(DIST, "books", name + ".html"))
        with open(src, encoding="utf-8") as f:
            meta = json.load(f).get("meta", {})
        books.append((name, meta))
    build_studio.main(os.path.join(DIST, "studio.html"))
    cards = []
    for name, m in books:
        c1, c2 = COVERS.get(m.get("theme", "classic"), COVERS["classic"])
        cards.append(
            '<a class="book" href="books/%s.html" dir="%s" style="--c1:%s;--c2:%s"><span class="ic">%s</span>'
            '<b>%s</b><small>%s</small></a>' % (
                name, m.get("dir", "ltr"), c1, c2, html.escape(m.get("icon", "📖")),
                html.escape(m.get("title", name)), html.escape(" · ".join(x for x in (m.get("grade"), m.get("subject")) if x))))
    page = GALLERY.replace("__CARDS__", "\n".join(cards))
    with open(os.path.join(DIST, "index.html"), "w", encoding="utf-8") as f:
        f.write(page)
    print("built dist/index.html (%d books)" % len(books))


GALLERY = """<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>MorphBook · interactive flipbooks for teachers</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800&family=Fraunces:opsz,wght@9..144,600;9..144,800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box}body{margin:0;font-family:'Cairo',system-ui,sans-serif;color:#e9eef7;min-height:100vh;
background:radial-gradient(ellipse at 50% 0%,#24304d,#0b0f19 70%)}
header{text-align:center;padding:4rem 1rem 2rem}h1{font-family:'Fraunces',serif;font-size:clamp(2.2rem,6vw,4rem);margin:0}
header p{color:#9aa6bd;max-width:620px;margin:.6rem auto}.ar{font-size:1.05rem;color:#c9d4e8}
.cta{display:inline-block;margin-top:1.2rem;padding:.85rem 1.6rem;border-radius:99px;color:#fff;text-decoration:none;font-weight:800;
background:linear-gradient(135deg,#5b9dff,#7c5cff);box-shadow:0 12px 30px rgba(91,157,255,.35)}
.shelf{display:flex;flex-wrap:wrap;gap:2.2rem;justify-content:center;padding:2rem 1rem 1rem;perspective:1200px}
.book{width:170px;height:240px;border-radius:4px 12px 12px 4px;padding:1.2rem 1rem;color:#fff;text-decoration:none;display:flex;flex-direction:column;
align-items:center;justify-content:center;text-align:center;background:linear-gradient(150deg,var(--c1),var(--c2));
box-shadow:inset 6px 0 0 rgba(0,0,0,.25),inset 8px 0 0 rgba(255,255,255,.08),14px 18px 30px rgba(0,0,0,.45);
transform:rotateY(-18deg);transform-origin:left center;transition:transform .5s cubic-bezier(.2,.8,.2,1)}
.book:hover{transform:rotateY(-32deg) translateZ(20px)}.book[dir=rtl]{border-radius:12px 4px 4px 12px;transform-origin:right center;transform:rotateY(18deg)}
.book[dir=rtl]:hover{transform:rotateY(32deg) translateZ(20px)}
.ic{font-size:2.4rem;margin-bottom:.6rem}.book b{font-size:1.05rem;line-height:1.3}.book small{opacity:.8;font-size:.72rem;margin-top:.4rem}
.feat{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;max-width:980px;margin:2rem auto 4rem;padding:0 1rem}
.feat div{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:1rem}
.feat b{display:block;margin-bottom:.3rem}.feat span{color:#9aa6bd;font-size:.88rem}
footer{text-align:center;color:#6f7b93;font-size:.8rem;padding:0 0 2rem}
</style></head><body>
<header><h1>MorphBook</h1>
<p>Books whose pages really turn: drag a corner and the paper curls, hard covers swing open in 3D, the paper rustles.</p>
<p class="ar" dir="rtl">كتب تفاعلية بتتقلّب بجد: اسحب طرف الصفحة وهتلاقيها بتتطوي، والغلاف بيتفتح ثلاثي الأبعاد، وصوت الورق حقيقي.</p>
<a class="cta" href="studio.html">Open the studio · حوّل PDF لكتاب</a></header>
<section class="shelf">__CARDS__</section>
<section class="feat">
<div><b>Real page curl</b><span>Fold geometry, not a slide: drag any corner, flick, tap or use the keyboard.</span></div>
<div><b>Arabic first</b><span>Right-to-left books turn the right way, with Egyptian Arabic voices for read-aloud.</span></div>
<div><b>PDF to flipbook</b><span>Drop a PDF in the studio and download one HTML file that works offline.</span></div>
<div><b>Teaching built in</b><span>Glossary pop-ups, activities, contents that jump, and an end-of-book quiz.</span></div>
</section>
<footer>MIT · built for teachers by AI4EduTech</footer>
</body></html>
"""

if __name__ == "__main__":
    main()
