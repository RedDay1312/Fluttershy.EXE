#!/usr/bin/env python3
"""Chroma-key generated props and bake extra tiles/icons."""
from __future__ import annotations

import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path("/workspace")
ART = ROOT / "artifacts" / "imagine_images"
SPR = ROOT / "public" / "sprites"
UI = ROOT / "public" / "ui"
SPR.mkdir(parents=True, exist_ok=True)
UI.mkdir(parents=True, exist_ok=True)


def chroma(im: Image.Image) -> Image.Image:
    arr = np.array(im.convert("RGBA")).astype(np.int16)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    mag = (r > 150) & (b > 150) & (g < 170) & ((r + b - 2 * g) > 40)
    near = (np.abs(r - 255) + np.abs(b - 255) + g) < 260
    mag = mag | ((g < 180) & (r > 140) & (b > 140) & near)
    arr[mag, 3] = 0
    # despill fringe
    a = arr[:, :, 3]
    fringe = (a > 0) & (g < 190) & (r > 120) & (b > 120)
    arr[fringe, 0] = np.minimum(arr[fringe, 0], arr[fringe, 1] + 20)
    arr[fringe, 2] = np.minimum(arr[fringe, 2], arr[fringe, 1] + 20)
    out = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")
    return out.filter(ImageFilter.MedianFilter(size=3))


def crop_alpha(im: Image.Image, pad: int = 8) -> Image.Image:
    a = np.array(im.split()[-1])
    ys, xs = np.where(a > 12)
    if len(xs) == 0:
        return im
    x0, x1 = max(0, xs.min() - pad), min(im.width, xs.max() + pad)
    y0, y1 = max(0, ys.min() - pad), min(im.height, ys.max() + pad)
    return im.crop((int(x0), int(y0), int(x1), int(y1)))


def fit(im: Image.Image, w: int, h: int) -> Image.Image:
    im = im.copy()
    im.thumbnail((w, h), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    canvas.paste(im, ((w - im.width) // 2, h - im.height), im)
    return canvas


def save(im: Image.Image, path: Path) -> None:
    im.save(path, optimize=True)
    print("wrote", path, im.size)


def process_single(src: str, dst: str, w: int, h: int, pad: int = 6) -> None:
    im = chroma(Image.open(ART / src))
    im = crop_alpha(im, pad)
    im = fit(im, w, h)
    save(im, SPR / dst)


def process_sheet_2x2(src: str, dst: str, cell: int) -> None:
    im = chroma(Image.open(ART / src))
    w, h = im.size
    cw, ch = w // 2, h // 2
    frames = []
    for row in range(2):
        for col in range(2):
            cell_im = im.crop((col * cw, row * ch, (col + 1) * cw, (row + 1) * ch))
            cell_im = crop_alpha(cell_im, 4)
            frames.append(fit(cell_im, cell, cell))
    sheet = Image.new("RGBA", (cell * 4, cell), (0, 0, 0, 0))
    for i, fr in enumerate(frames):
        sheet.paste(fr, (i * cell, 0), fr)
    save(sheet, SPR / dst)


process_single("b1357d04-3549-4d6e-b7f3-85f616e0621a.jpg", "tree-1.png", 280, 420, 4)
process_single("ea1310d8-c3d1-4e1c-a197-2b776217783e.jpg", "tree-2.png", 260, 400, 4)
process_single("1edffa75-55e6-44d4-80f9-92ab3a2a6f28.jpg", "door.png", 140, 196, 4)
process_single("3fb61a68-8c3c-4016-af8e-69f65945d5b9.jpg", "eyes.png", 160, 70, 2)
process_single("22b86750-e7ed-41be-97c3-422ac5e7aaa0.jpg", "note.png", 56, 64, 4)
process_single("6cd43c33-e755-4175-87ec-21f6b1ceabb5.jpg", "bush.png", 200, 170, 4)
process_single("42d0625c-5e56-4303-99c6-5525ff153e20.jpg", "flower.png", 72, 88, 4)
process_sheet_2x2("ba9563db-4876-4c30-9e24-0b7f7a980ceb.jpg", "butterflies.png", 64)


def grass_tuft() -> None:
    im = Image.new("RGBA", (64, 40), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    rng = np.random.default_rng(3)
    for x in range(4, 60, 3):
        h = int(rng.integers(10, 28))
        col = (70 + int(rng.integers(0, 40)), 140 + int(rng.integers(0, 40)), 50)
        d.line([(x, 38), (x + int(rng.integers(-3, 4)), 38 - h)], fill=col + (255,), width=2)
    save(im, SPR / "grass.png")


def rock() -> None:
    im = Image.new("RGBA", (72, 40), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.polygon([(8, 32), (18, 10), (48, 8), (66, 28), (54, 36), (12, 36)], fill=(128, 122, 110, 255))
    d.polygon([(20, 14), (40, 12), (36, 22)], fill=(160, 154, 140, 255))
    save(im, SPR / "rock.png")


def mushroom() -> None:
    im = Image.new("RGBA", (40, 48), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rectangle([16, 22, 24, 44], fill=(240, 230, 210, 255))
    d.ellipse([4, 8, 36, 30], fill=(210, 50, 70, 255))
    d.ellipse([10, 14, 16, 20], fill=(250, 230, 230, 255))
    d.ellipse([22, 12, 28, 18], fill=(250, 230, 230, 255))
    save(im, SPR / "mushroom.png")


def drip() -> None:
    im = Image.new("RGBA", (16, 32), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.ellipse([4, 18, 12, 30], fill=(140, 16, 22, 220))
    d.polygon([(8, 2), (12, 18), (4, 18)], fill=(140, 16, 22, 200))
    save(im, SPR / "drip.png")


def vine() -> None:
    im = Image.new("RGBA", (24, 160), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    pts = [(12 + int(6 * math.sin(y / 18)), y) for y in range(0, 160, 4)]
    d.line(pts, fill=(46, 90, 40, 255), width=3)
    for y in range(12, 150, 18):
        x = 12 + int(6 * math.sin(y / 18))
        d.ellipse([x, y, x + 10, y + 7], fill=(70, 130, 55, 255))
    save(im, SPR / "vine.png")


def vignette() -> None:
    w, h = 1280, 720
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    px = im.load()
    cx, cy = w / 2, h / 2
    maxd = math.hypot(cx, cy)
    for y in range(h):
        for x in range(0, w, 2):
            d = math.hypot(x - cx, y - cy) / maxd
            a = int(max(0, (d - 0.45) / 0.55 * 170))
            px[x, y] = (0, 0, 0, a)
            if x + 1 < w:
                px[x + 1, y] = (0, 0, 0, a)
    save(im, SPR / "vignette.png")


def pixel() -> None:
    im = Image.new("RGBA", (4, 4), (255, 255, 255, 255))
    save(im, SPR / "px.png")


def fg_grass() -> None:
    im = Image.new("RGBA", (256, 64), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    rng = np.random.default_rng(9)
    for x in range(0, 256, 2):
        hh = int(rng.integers(18, 54))
        col = (40 + int(rng.integers(0, 30)), 90 + int(rng.integers(0, 40)), 30, 230)
        d.line([(x, 64), (x + int(rng.integers(-2, 3)), 64 - hh)], fill=col, width=2)
    save(im, SPR / "fg-grass.png")


def xp_icon(name: str, draw_fn) -> None:
    im = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    draw_fn(d)
    save(im, UI / name)


def icon_folder(d: ImageDraw.ImageDraw) -> None:
    d.rectangle([6, 16, 42, 40], fill=(240, 200, 70, 255), outline=(160, 120, 20, 255))
    d.rectangle([6, 12, 22, 18], fill=(230, 180, 50, 255))


def icon_note(d: ImageDraw.ImageDraw) -> None:
    d.rectangle([10, 6, 38, 42], fill=(250, 248, 230, 255), outline=(90, 90, 90, 255))
    d.polygon([(28, 6), (38, 16), (28, 16)], fill=(230, 226, 200, 255))
    for y in (22, 28, 34):
        d.line([(14, y), (34, y)], fill=(160, 140, 110, 255), width=1)


def icon_trash(d: ImageDraw.ImageDraw) -> None:
    d.rectangle([14, 14, 34, 40], fill=(160, 168, 176, 255), outline=(70, 70, 80, 255))
    d.rectangle([12, 10, 36, 16], fill=(120, 128, 136, 255))
    d.rectangle([20, 6, 28, 10], fill=(120, 128, 136, 255))


grass_tuft()
rock()
mushroom()
drip()
vine()
vignette()
pixel()
fg_grass()
xp_icon("folder.png", icon_folder)
xp_icon("notepad.png", icon_note)
xp_icon("trash.png", icon_trash)

print("props done")
