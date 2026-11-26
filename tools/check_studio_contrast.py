#!/usr/bin/env python3
"""Check the Studio theme's four WCAG AA text pairs in light and dark modes."""
import re
from pathlib import Path

THEME = Path(__file__).resolve().parents[1] / "themes" / "studio" / "theme.css"
PAIRS = (
    ("--ink", "--paper"),
    ("--ink-soft", "--paper"),
    ("#fff", "--accent"),
    ("--cover-ink", "--cover1"),
)


def luminance(color):
    digits = color.removeprefix("#")
    if len(digits) == 3:
        digits = "".join(digit * 2 for digit in digits)
    channels = [int(digits[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    linear = [value / 12.92 if value <= .04045 else ((value + .055) / 1.055) ** 2.4
              for value in channels]
    return sum(channel * weight for channel, weight in zip(linear, (.2126, .7152, .0722)))


def contrast(foreground, background):
    low, high = sorted((luminance(foreground), luminance(background)))
    return (high + .05) / (low + .05)


def main():
    css = THEME.read_text(encoding="utf-8-sig")
    light = re.search(r'\.mb-root\[data-theme="studio"\]\s*\{([^}]*)\}', css)[1]
    dark = re.search(r'\.mb-root\[data-theme="studio"\]\[data-mode="dark"\]\s*\{([^}]*)\}', css)[1]
    colors = r"(--[\w-]+)\s*:\s*(#[\da-fA-F]+)\s*;"
    light_tokens = dict(re.findall(colors, light))
    dark_tokens = light_tokens | dict(re.findall(colors, dark))
    failed = False
    print(f'{"Text / background":<28} {"Light":>8} {"Dark":>8}')
    for fg, bg in PAIRS:
        ratios = [contrast(tokens.get(fg, fg), tokens[bg]) for tokens in (light_tokens, dark_tokens)]
        failed |= min(ratios) < 4.5
        print(f'{fg + " / " + bg:<28} {ratios[0]:>6.2f}:1 {ratios[1]:>6.2f}:1')
    return int(failed)


if __name__ == "__main__":
    raise SystemExit(main())
