#!/usr/bin/env python3
"""Bake remaining game art from existing generated assets + painted tiles."""
from __future__ import annotations

import math
import os
import shutil
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps

ROOT = Path("/workspace")
ASSETS = ROOT / "assets"
PUBLIC = ROOT / "public"
SPR = PUBLIC / "sprites"
MAPS = PUBLIC / "maps"
UI = PUBLIC / "ui"

for p in (SPR, MAPS, UI):
    p.mkdir(parents=True, exist_ok=True)


def save(im: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, optimize=True)
    print("wrote", path, im.size)


def copy_sheet(src: Path, dst: Path) -> None:
    shutil.copy2(src, dst)
    print("copied", dst)


# --- character sheets ---
copy_sheet(ASSETS / "sprites/fluttershy/idle/sheet-transparent.png", SPR / "fs-idle.png")
copy_sheet(ASSETS / "sprites/fluttershy/run/sheet-transparent.png", SPR / "fs-run.png")
copy_sheet(ASSETS / "sprites/fluttershy/jump/sheet-transparent.png", SPR / "fs-jump.png")
copy_sheet(ASSETS / "sprites/fluttershy/look/sheet-transparent.png", SPR / "fs-look.png")
copy_sheet(ASSETS / "sprites/fluttershy/hurt/sheet-transparent.png", SPR / "fs-hurt.png")
copy_sheet(ASSETS / "sprites/fluttershy/distorted/sheet-transparent.png", SPR / "fs-distorted.png")
copy_sheet(ASSETS / "sprites/fluttershy/look/idle-4.png", SPR / "fs-portrait.png")
copy_sheet(ASSETS / "sprites/fluttershy/idle/idle-1.png", SPR / "fs-icon.png")
copy_sheet(ASSETS / "sprites/fluttershy/distorted/idle-4.png", SPR / "fs-horror.png")

# individual look frames for DOM overlays
for i in range(1, 5):
    copy_sheet(ASSETS / f"sprites/fluttershy/look/idle-{i}.png", SPR / f"fs-look-{i}.png")

# maps
shutil.copy2(ASSETS / "map/forest-sky.jpg", MAPS / "forest-sky.jpg")
shutil.copy2(ASSETS / "map/forest-far.jpg", MAPS / "forest-far.jpg")
shutil.copy2(ASSETS / "map/desktop-wallpaper.jpg", MAPS / "desktop-wallpaper.jpg")


def grade(src: Path, dst: Path, colorize: tuple[int, int, int], color: float, contrast: float, brightness: float, sat: float) -> None:
    im = Image.open(src).convert("RGB")
    im = ImageEnhance.Color(im).enhance(sat)
    im = ImageEnhance.Contrast(im).enhance(contrast)
    im = ImageEnhance.Brightness(im).enhance(brightness)
    overlay = Image.new("RGB", im.size, colorize)
    im = Image.blend(im, overlay, color)
    save(im, dst)


grade(MAPS / "forest-sky.jpg", MAPS / "fog-sky.jpg", (90, 110, 120), 0.28, 0.85, 0.78, 0.45)
grade(MAPS / "forest-far.jpg", MAPS / "fog-far.jpg", (70, 90, 95), 0.32, 0.8, 0.7, 0.4)
grade(MAPS / "forest-sky.jpg", MAPS / "blood-sky.jpg", (90, 10, 18), 0.42, 1.1, 0.62, 0.7)
grade(MAPS / "forest-far.jpg", MAPS / "blood-far.jpg", (70, 8, 12), 0.48, 1.15, 0.55, 0.55)
grade(MAPS / "forest-sky.jpg", MAPS / "void-sky.jpg", (8, 16, 70), 0.55, 1.3, 0.35, 0.2)
grade(MAPS / "forest-far.jpg", MAPS / "void-far.jpg", (4, 8, 40), 0.5, 1.4, 0.28, 0.15)
grade(MAPS / "desktop-wallpaper.jpg", MAPS / "desktop-corrupt.jpg", (40, 0, 10), 0.35, 1.2, 0.55, 0.5)
grade(MAPS / "forest-far.jpg", MAPS / "glitch-far.jpg", (20, 0, 40), 0.3, 1.4, 0.45, 0.2)
grade(MAPS / "forest-sky.jpg", MAPS / "finale-sky.jpg", (0, 0, 0), 0.62, 1.1, 0.22, 0.1)


def add_glitch(src: Path, dst: Path) -> None:
    im = Image.open(src).convert("RGB")
    arr = np.array(im)
    h, w, _ = arr.shape
    rng = np.random.default_rng(7)
    for _ in range(18):
        y = int(rng.integers(0, h - 8))
        hh = int(rng.integers(2, 14))
        shift = int(rng.integers(-40, 40))
        arr[y : y + hh] = np.roll(arr[y : y + hh], shift, axis=1)
    # RGB split
    r = np.roll(arr[:, :, 0], 6, axis=1)
    b = np.roll(arr[:, :, 2], -6, axis=1)
    arr[:, :, 0] = r
    arr[:, :, 2] = b
    save(Image.fromarray(arr), dst)


add_glitch(MAPS / "glitch-far.jpg", MAPS / "glitch-far.jpg")
add_glitch(MAPS / "void-far.jpg", MAPS / "void-far.jpg")


def make_fog(path: Path, color: tuple[int, int, int, int], density: float) -> None:
    w, h = 1280, 720
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    px = im.load()
    for y in range(h):
        t = y / h
        a = int(color[3] * (0.25 + 0.75 * t) * density)
        for x in range(w):
            n = 0.5 + 0.5 * math.sin(x * 0.01 + y * 0.02)
            aa = int(min(255, a * (0.7 + 0.3 * n)))
            px[x, y] = (color[0], color[1], color[2], aa)
    im = im.filter(ImageFilter.GaussianBlur(12))
    save(im, path)


make_fog(MAPS / "fog-overlay.png", (180, 190, 195, 140), 1.0)
make_fog(MAPS / "blood-fog.png", (90, 8, 12, 120), 0.9)


def platform_tile(name: str, top: tuple, body: tuple, accent: tuple, dirt: tuple, w=128, h=64) -> None:
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 14, w, h], fill=body)
    d.rectangle([0, 18, w, h], fill=dirt)
    d.rectangle([0, 8, w, 22], fill=top)
    # grass blades / noise
    rng = np.random.default_rng(abs(hash(name)) % 10_000)
    for x in range(0, w, 3):
        hh = int(rng.integers(6, 14))
        d.line([(x, 14), (x, 14 - hh)], fill=accent, width=2)
    # pebbles
    for _ in range(8):
        x = int(rng.integers(6, w - 6))
        y = int(rng.integers(28, h - 8))
        d.ellipse([x, y, x + 5, y + 3], fill=tuple(max(0, c - 20) for c in dirt) + (255,))
    # top highlight
    d.line([(0, 9), (w, 9)], fill=tuple(min(255, c + 30) for c in top), width=1)
    save(im, SPR / f"plat-{name}.png")


platform_tile("grass", (92, 168, 74), (122, 86, 48), (70, 150, 55), (96, 64, 36))
platform_tile("wood", (176, 122, 70), (140, 92, 50), (198, 150, 90), (110, 72, 40))
platform_tile("stone", (140, 142, 148), (110, 112, 118), (170, 172, 178), (90, 92, 96))
platform_tile("blood", (110, 28, 32), (70, 18, 20), (160, 40, 40), (48, 12, 14))
platform_tile("glitch", (40, 80, 200), (12, 18, 40), (80, 220, 255), (8, 10, 24))
platform_tile("void", (30, 30, 36), (16, 16, 20), (80, 80, 90), (8, 8, 10))


def end_cap(name: str, fill: tuple, w=48, h=64) -> None:
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([4, 8, w - 4, h], radius=8, fill=fill)
    save(im, SPR / f"plat-{name}-cap.png")


end_cap("grass", (92, 168, 74))
end_cap("blood", (110, 28, 32))


def spikes() -> None:
    im = Image.new("RGBA", (96, 48), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    for i, x in enumerate((4, 28, 52, 76)):
        color = (160, 30, 36) if i % 2 == 0 else (90, 20, 24)
        d.polygon([(x, 46), (x + 10, 6), (x + 20, 46)], fill=color)
    save(im, SPR / "spikes.png")


spikes()


def note() -> None:
    im = Image.new("RGBA", (48, 56), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rectangle([6, 4, 42, 52], fill=(244, 232, 196))
    d.polygon([(30, 4), (42, 16), (30, 16)], fill=(228, 214, 170))
    for y in (22, 28, 34, 40):
        d.line([(12, y), (36, y)], fill=(170, 140, 110), width=1)
    save(im, SPR / "note.png")


note()


def butterfly() -> None:
    im = Image.new("RGBA", (256, 128), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    colors = [(232, 150, 190), (255, 210, 90), (120, 190, 220), (180, 140, 220)]
    for i in range(4):
        ox = i * 64 + 32
        c = colors[i]
        # wings open-ish variation
        spread = 16 + (i % 2) * 6
        d.ellipse([ox - spread, 28, ox - 2, 70], fill=c)
        d.ellipse([ox + 2, 28, ox + spread, 70], fill=c)
        d.ellipse([ox - 3, 40, ox + 3, 78], fill=(40, 30, 20))
    save(im, SPR / "butterflies.png")


butterfly()


def eyes() -> None:
    im = Image.new("RGBA", (64, 32), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.ellipse([4, 8, 28, 28], fill=(40, 200, 210))
    d.ellipse([10, 12, 18, 24], fill=(10, 20, 20))
    d.ellipse([36, 8, 60, 28], fill=(40, 200, 210))
    d.ellipse([42, 12, 50, 24], fill=(10, 20, 20))
    save(im, SPR / "eyes.png")


eyes()


def flower() -> None:
    im = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.ellipse([18, 28, 30, 46], fill=(70, 140, 60))
    for ang in range(0, 360, 45):
        r = math.radians(ang)
        x = 24 + math.cos(r) * 10
        y = 20 + math.sin(r) * 10
        d.ellipse([x - 6, y - 6, x + 6, y + 6], fill=(240, 170, 200))
    d.ellipse([18, 14, 30, 26], fill=(255, 220, 90))
    save(im, SPR / "flower.png")


flower()


def door() -> None:
    im = Image.new("RGBA", (96, 128), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([8, 8, 88, 124], radius=8, fill=(120, 78, 42))
    d.rounded_rectangle([16, 16, 80, 116], radius=6, fill=(92, 58, 32))
    d.ellipse([64, 64, 76, 76], fill=(210, 170, 70))
    save(im, SPR / "door.png")


door()


def hanging_from(src: Path, dst: Path, recolor: dict[tuple, tuple] | None = None) -> None:
    im = Image.open(src).convert("RGBA")
    im = im.rotate(180, expand=True)
    arr = np.array(im)
    if recolor:
        # simple yellow-coat shift via hue for non-alpha pixels
        rgb = arr[:, :, :3].astype(np.float32)
        a = arr[:, :, 3]
        mask = a > 20
        # shift yellows
        yellow = (rgb[:, :, 0] > 160) & (rgb[:, :, 1] > 140) & (rgb[:, :, 2] < 140) & mask
        target = recolor.get("coat", (200, 200, 200))
        rgb[yellow] = np.array(target, dtype=np.float32)
        pink = (rgb[:, :, 0] > 160) & (rgb[:, :, 2] > 140) & (rgb[:, :, 1] < 180) & mask
        mane = recolor.get("mane", (80, 40, 60))
        rgb[pink] = np.array(mane, dtype=np.float32)
        arr[:, :, :3] = np.clip(rgb, 0, 255).astype(np.uint8)
        im = Image.fromarray(arr)
    # rope
    canvas = Image.new("RGBA", (im.width, im.height + 40), (0, 0, 0, 0))
    d = ImageDraw.Draw(canvas)
    d.line([(im.width // 2, 0), (im.width // 2, 44)], fill=(90, 70, 50), width=3)
    canvas.paste(im, (0, 36), im)
    save(canvas, dst)


base = ASSETS / "sprites/fluttershy/idle/idle-1.png"
hanging_from(base, SPR / "hang-yellow.png", None)
hanging_from(base, SPR / "hang-blue.png", {"coat": (46, 162, 215), "mane": (220, 70, 90)})
hanging_from(base, SPR / "hang-purple.png", {"coat": (180, 150, 220), "mane": (90, 50, 140)})
hanging_from(base, SPR / "hang-pink.png", {"coat": (245, 150, 190), "mane": (220, 80, 140)})
hanging_from(base, SPR / "hang-white.png", {"coat": (240, 240, 245), "mane": (160, 120, 200)})
hanging_from(base, SPR / "hang-orange.png", {"coat": (230, 150, 60), "mane": (210, 180, 80)})


def blood_puddle() -> None:
    im = Image.new("RGBA", (128, 36), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.ellipse([4, 8, 124, 32], fill=(110, 16, 20, 200))
    d.ellipse([20, 4, 90, 28], fill=(140, 24, 28, 180))
    save(im, SPR / "puddle.png")


blood_puddle()


def checkpoint() -> None:
    im = Image.new("RGBA", (40, 64), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rectangle([18, 8, 22, 60], fill=(90, 70, 40))
    d.polygon([(22, 8), (38, 18), (22, 28)], fill=(90, 180, 140))
    save(im, SPR / "flag.png")


checkpoint()

# desktop icons
icon = Image.open(SPR / "fs-icon.png").convert("RGBA")
icon = icon.resize((48, 48), Image.Resampling.LANCZOS)
save(icon, UI / "exe-icon.png")

print("bake complete")
