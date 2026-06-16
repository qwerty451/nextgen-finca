#!/usr/bin/env python3
"""Remove white/near-white backgrounds from cartoon PNG images via BFS flood-fill from edges."""

import sys
from pathlib import Path
from collections import deque
from PIL import Image
import numpy as np

TOLERANCE = 30  # 0-255: how far from pure white still counts as background

def remove_white_bg(src: Path, dst: Path, tolerance: int = TOLERANCE) -> None:
    img = Image.open(src).convert("RGBA")
    w, h = img.size
    data = np.array(img, dtype=np.uint8)

    visited = np.zeros((h, w), dtype=bool)
    to_clear = np.zeros((h, w), dtype=bool)

    def is_bg(y: int, x: int) -> bool:
        r, g, b = int(data[y, x, 0]), int(data[y, x, 1]), int(data[y, x, 2])
        return r >= 255 - tolerance and g >= 255 - tolerance and b >= 255 - tolerance

    queue: deque = deque()

    def seed(y: int, x: int) -> None:
        if not visited[y, x] and is_bg(y, x):
            visited[y, x] = True
            to_clear[y, x] = True
            queue.append((y, x))

    for x in range(w):
        seed(0, x)
        seed(h - 1, x)
    for y in range(h):
        seed(y, 0)
        seed(y, w - 1)

    while queue:
        y, x = queue.popleft()
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w:
                seed(ny, nx)

    data[to_clear, 3] = 0
    Image.fromarray(data).save(dst, "PNG")
    cleared = int(to_clear.sum())
    total = w * h
    print(f"  {src.name} → {dst.name}  ({cleared}/{total} px cleared, {cleared*100//total}%)")


CARTOON_PNGS = [
    "smart-interior.png",
    "automated-access.png",
    "network-rack.png",
    "solar-panels.png",
    "offgrid-power-system.png",
    "smart-home-devices.jpg",  # will be converted to PNG
]

IMG_DIR = Path(__file__).parent.parent / "public" / "images"

for name in CARTOON_PNGS:
    src = IMG_DIR / name
    if not src.exists():
        print(f"  SKIP (not found): {name}")
        continue
    stem = Path(name).stem
    dst = IMG_DIR / f"{stem}.png"
    remove_white_bg(src, dst)

print("Done.")
