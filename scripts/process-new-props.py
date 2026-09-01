#!/usr/bin/env python3
"""Chroma-key the new MLP / horror props."""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path("/workspace")
ART = ROOT / "artifacts" / "imagine_images"
SPR = ROOT / "public" / "sprites"
SPR.mkdir(parents=True, exist_ok=True)


def chroma(im: Image.Image) -> Image.Image:
    arr = np.array(im.convert("RGBA")).astype(np.int16)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    mag = (r > 150) & (b > 150) & (g < 170) & ((r + b - 2 * g) > 40)
    near = (np.abs(r - 255) + np.abs(b - 255) + g) < 260
    mag = mag | ((g < 180) & (r > 140) & (b > 140) & near)
    arr[mag, 3] = 0
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


def fit(im: Image.Image, w: int, h: int, anchor: str = "feet") -> Image.Image:
    im = im.copy()
    im.thumbnail((w, h), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    x = (w - im.width) // 2
    y = h - im.height if anchor == "feet" else (h - im.height) // 2
    canvas.paste(im, (x, y), im)
    return canvas


def save(im: Image.Image, name: str) -> None:
    path = SPR / name
    im.save(path, optimize=True)
    print("wrote", path, im.size)


def process_single(src: str, dst: str, w: int, h: int, pad: int = 6, anchor: str = "feet") -> None:
    im = chroma(Image.open(ART / src))
    im = crop_alpha(im, pad)
    im = fit(im, w, h, anchor)
    save(im, dst)


def process_sheet_2x2(src: str, dst: str, cell: int) -> None:
    im = chroma(Image.open(ART / src))
    w, h = im.size
    cw, ch = w // 2, h // 2
    frames = []
    for row in range(2):
        for col in range(2):
            cell_im = im.crop((col * cw, row * ch, (col + 1) * cw, (row + 1) * ch))
            cell_im = crop_alpha(cell_im, 4)
            frames.append(fit(cell_im, cell, cell, "feet"))
    sheet = Image.new("RGBA", (cell * 4, cell), (0, 0, 0, 0))
    for i, fr in enumerate(frames):
        sheet.paste(fr, (i * cell, 0), fr)
    save(sheet, dst)


process_single("bb2b758a-d9b1-46ef-a5c1-971cd063172a.jpg", "cottage.png", 420, 340, 4)
process_sheet_2x2("0d993c2e-ae02-415c-ab8e-42dcbef6edb1.jpg", "angel.png", 72)
process_single("337e8264-d289-4c2a-81b0-367b24c6153a.jpg", "tree-3.png", 300, 460, 4)
process_single("895f0a2c-5196-4ab9-be04-534438705356.jpg", "sign.png", 180, 220, 4)
process_single("63fd3610-731e-4d41-861c-7f93851c9f43.jpg", "letter.png", 64, 72, 4, "center")
process_single("b7acc48b-4e60-4a25-b4ef-8abc4468672f.jpg", "discord.png", 220, 340, 4)
process_single("89c29161-e944-4e0f-a23b-b2f13402556a.jpg", "cutie.png", 64, 64, 4, "center")
process_single("9d2c0e3f-cf1e-4c02-9ab8-608b1f86da37.jpg", "computer.png", 200, 170, 4)
process_single("a35fb158-2a77-4f35-97c7-c2e42632c25e.jpg", "gem.png", 72, 72, 4, "center")
process_single("2adc1611-dfa3-4011-9e8a-6c45b22563f5.jpg", "poster.png", 140, 210, 4)

print("new props done")
