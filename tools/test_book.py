#!/usr/bin/env python3
"""Open a built MorphBook in a real browser and check it the way a reader would.

    pip install playwright pillow && python -m playwright install chromium
    python tools/test_book.py dist/my-book.html            # -> dist/my-book.check/ (sheets + report)
    python tools/test_book.py dist/my-book.html --chrome /usr/bin/google-chrome

For a laptop screen (two-page spreads) and a phone (one page) it:
  - visits every spread/page and saves a contact sheet of all of them
  - turns a page by dragging a corner, by the keyboard and by the arrows
  - opens the quiz if there is one
  - reports JavaScript errors and pages too long for the paper
Exit code 1 when something needs fixing.
"""
import argparse
import asyncio
import json
import os
import sys

from PIL import Image
from playwright.async_api import async_playwright

VIEWS = {"laptop": {"width": 1400, "height": 860}, "phone": {"width": 390, "height": 800}}


async def check_view(browser, url, name, view, out):
    page = await browser.new_page(viewport=view, has_touch=(name == "phone"))
    problems, warns = [], []
    page.on("pageerror", lambda e: problems.append("JS error: %s" % e))
    page.on("console", lambda m: (m.type == "error" and problems.append("console error: %s" % m.text))
            or ("[morphbook]" in m.text and warns.append(m.text)))
    await page.add_init_script("try{localStorage.clear()}catch(e){}")
    await page.goto(url)
    await page.wait_for_timeout(900)
    info = await page.evaluate("({n: book.N, max: book.maxPos(), spread: book.spread, rtl: book.rtl, quiz: book.quiz.length})")
    shots = []
    for pos in range(info["max"] + 1):
        await page.evaluate("p => { book.cancelTurn(); book.pos = p; book.render(); }", pos)
        await page.wait_for_timeout(120)
        path = os.path.join(out, "%s-%02d.png" % (name, pos))
        await page.locator(".mb-stage").screenshot(path=path)
        shots.append(path)
    # interaction: drag the recto corner most of the way across
    await page.evaluate("book.cancelTurn(); book.pos = 1 <= book.maxPos() ? 1 : 0; book.render();")
    await page.wait_for_timeout(200)
    start = await page.evaluate("book.pos")
    box = await page.eval_on_selector(".mb-slot.recto", "e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; }")
    x0 = box[0] + (6 if info["rtl"] else box[2] - 6)
    await page.mouse.move(x0, box[1] + box[3] - 6)
    await page.mouse.down()
    await page.mouse.move(box[0] + box[2] * (0.95 if info["rtl"] else 0.05), box[1] + box[3] * 0.7, steps=12)
    mid = os.path.join(out, "%s-drag.png" % name)
    await page.locator(".mb-stage").screenshot(path=mid)
    await page.mouse.up()
    await page.wait_for_timeout(1200)
    if await page.evaluate("book.pos") != start + 1 and start < info["max"]:
        problems.append("dragging a corner did not turn the page")
    await page.keyboard.press("ArrowLeft" if info["rtl"] else "ArrowRight")
    await page.wait_for_timeout(1300)
    await page.keyboard.press("ArrowRight" if info["rtl"] else "ArrowLeft")
    await page.wait_for_timeout(1300)
    if info["quiz"] and name == "laptop":
        await page.evaluate("book.startQuiz()")
        await page.wait_for_timeout(300)
        if not await page.is_visible(".mb-qopt"):
            problems.append("quiz did not open")
    await page.close()
    sheet = os.path.join(out, "%s-sheet.png" % name)
    contact(shots + [mid], sheet, 4 if name == "laptop" else 6)
    return info, problems, sorted(set(warns)), sheet


def contact(paths, out, cols):
    ims = [Image.open(p) for p in paths]
    w = 420 if cols == 4 else 220
    ims = [im.resize((w, round(im.height * w / im.width))) for im in ims]
    h = max(im.height for im in ims)
    rows = (len(ims) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * w + (cols + 1) * 8, rows * h + (rows + 1) * 8), (40, 44, 52))
    for i, im in enumerate(ims):
        sheet.paste(im, (8 + (i % cols) * (w + 8), 8 + (i // cols) * (h + 8)))
    sheet.save(out)


async def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("html")
    ap.add_argument("--chrome", help="path to an installed Chrome/Edge if Playwright's Chromium is missing")
    a = ap.parse_args()
    html = os.path.abspath(a.html)
    out = os.path.splitext(html)[0] + ".check"
    os.makedirs(out, exist_ok=True)
    async with async_playwright() as p:
        kw = {"args": ["--no-sandbox"]}
        if a.chrome:
            kw["executable_path"] = a.chrome
        browser = await p.chromium.launch(**kw)
        report, bad = {}, False
        for name, view in VIEWS.items():
            info, problems, warns, sheet = await check_view(browser, "file:///" + html.replace(os.sep, "/").lstrip("/"), name, view, out)
            report[name] = {"info": info, "problems": problems, "too_long": warns, "sheet": sheet}
            bad = bad or bool(problems)
            print("%-6s %s spreads=%s pages=%d  problems=%d  too-long=%d  sheet=%s" % (
                name, "RTL" if info["rtl"] else "LTR", info["spread"], info["n"], len(problems), len(warns), sheet))
            for x in problems + warns:
                print("   -", x)
        await browser.close()
    with open(os.path.join(out, "report.json"), "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    asyncio.run(main())
