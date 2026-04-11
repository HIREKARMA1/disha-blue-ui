#!/usr/bin/env python3
"""Remove emoji and emoji-range symbols from TS/TSX/JS source files."""
from __future__ import annotations

import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = {"node_modules", ".next", "dist", ".git"}
EXTS = {".ts", ".tsx", ".js", ".jsx", ".md"}

# Pictographic / emoji-range symbols. Omit U+200D so Indic conjuncts in i18n stay intact.
EMOJI_RE = re.compile(
    "["
    "\U00002300-\U000023FF"  # Miscellaneous Technical
    "\U00002600-\U000027BF"  # Misc symbols & dingbats
    "\U00002B00-\U00002BFF"  # Stars, geometric shapes (��)
    "\U0000FE00-\U0000FE0F"  # Variation selectors
    "\U0001F300-\U0001FFFF"  # Emoji & supplemental symbols
    "]+",
    re.UNICODE,
)


def strip_file(path: str) -> bool:
    with open(path, "r", encoding="utf-8") as f:
        original = f.read()
    stripped = EMOJI_RE.sub("", original)
    # Tidy common leftovers: double spaces in plain text (conservative)
    stripped = re.sub(r" {3,}", "  ", stripped)
    if stripped == original:
        return False
    with open(path, "w", encoding="utf-8", newline="") as f:
        f.write(stripped)
    return True


def main() -> int:
    changed = 0
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for name in filenames:
            ext = os.path.splitext(name)[1].lower()
            if ext not in EXTS:
                continue
            if "strip_emojis" in name:
                continue
            path = os.path.join(dirpath, name)
            if strip_file(path):
                rel = os.path.relpath(path, ROOT)
                print(rel)
                changed += 1
    print(f"Updated {changed} files.", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
