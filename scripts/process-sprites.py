#!/usr/bin/env python3
"""Remove the generated backdrop (sampled from corners) and split sheets."""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path("/workspace/public/art")
IMG = Path("/workspace/artifacts/imagine_images")


def chroma(im: Image.Image, tol: float = 62) -> Image.Image:
    arr = np.array(im.convert("RGBA"))
    h, w = arr.shape[:2]
    corners = np.stack(
        [
            arr[2, 2, :3],
            arr[2, w - 3, :3],
            arr[h - 3, 2, :3],
            arr[h - 3, w - 3, :3],
            arr[h // 8, 2, :3],
            arr[2, w // 8, :3],
        ]
    ).astype(np.float32)
    bg = np.median(corners, axis=0)
    rgb = arr[:, :, :3].astype(np.float32)
    d = np.sqrt(((rgb - bg) ** 2).sum(axis=2))
    # classic hot magenta too
    mag = np.sqrt((rgb[:, :, 0] - 255) ** 2 + (rgb[:, :, 1] - 0) ** 2 + (rgb[:, :, 2] - 255) ** 2)
    kill = (d < tol) | (mag < 118)
    fade = (~kill) & ((d < tol + 28) | (mag < 150))
    alpha = np.full((h, w), 255, np.uint8)
    alpha[kill] = 0
    alpha[fade] = np.clip(200 - d[fade] * 2.4, 0, 180).astype(np.uint8)
    arr[:, :, 3] = alpha
    return Image.fromarray(arr)


def crop(im: Image.Image, pad: int = 8) -> Image.Image:
    bbox = im.getbbox()
    if not bbox:
        return im
    l, t, r, b = bbox
    l = max(0, l - pad)
    t = max(0, t - pad)
    r = min(im.width, r + pad)
    b = min(im.height, b + pad)
    return im.crop((l, t, r, b))


def split_grid(im: Image.Image, rows: int, cols: int) -> list[Image.Image]:
    w, h = im.size
    cw, ch = w // cols, h // rows
    cells: list[Image.Image] = []
    for y in range(rows):
        for x in range(cols):
            cell = chroma(im.crop((x * cw, y * ch, (x + 1) * cw, (y + 1) * ch)))
            cells.append(crop(cell, 6))
    return cells


def save(im: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, "PNG")
    print(f"wrote {path} {im.size}")


def one(src: str, dest: str) -> None:
    raw = Image.open(IMG / src)
    save(crop(chroma(raw)), ROOT / dest)


def sheet(src: str, dests: list[str], rows: int, cols: int) -> None:
    raw = Image.open(IMG / src)
    cells = split_grid(raw, rows, cols)
    for cell, dest in zip(cells, dests, strict=True):
        save(cell, ROOT / dest)


def main() -> None:
    one("16fff77a-b52e-4d91-b91f-24ef2e094481.jpg", "houses/animals.png")
    one("01c90dc1-a499-4c6a-9016-d6940786aacb.jpg", "houses/colors.png")
    one("a7a61449-3455-4f20-9ced-cf8735b3e05f.jpg", "houses/shapes.png")
    one("003f0c55-7419-4688-bce7-9032c2d5c5ad.jpg", "houses/numbers.png")
    one("0a63c084-87da-45d6-9064-ddb90c462ffa.jpg", "houses/body.png")
    one("5b35a396-da18-46f8-9adc-74aba609fee6.jpg", "houses/fruits.png")
    one("4716eea8-8f4b-4d3e-a167-6dde8174731c.jpg", "houses/habits.png")
    one("8285ab38-9bd2-4ef5-9ca3-f0f916a84b2c.jpg", "houses/music.png")
    one("ff49e65c-4afd-4a52-9f84-2c197fb275d8.jpg", "bear.png")
    one("a21daadf-8f98-4ad0-ab28-9dad770607f7.jpg", "props/brush.png")
    one("7e7e4e8f-cd17-4ff4-836d-7f75644577c6.jpg", "props/pillow.png")

    sheet(
        "a27f894a-4847-440c-a7ea-27354e989610.jpg",
        [
            "animals/cat.png",
            "animals/dog.png",
            "animals/cow.png",
            "animals/bird.png",
            "animals/frog.png",
            "animals/elephant.png",
        ],
        2,
        3,
    )
    sheet(
        "882efac9-d9c7-456f-bf05-ebaffe004701.jpg",
        [
            "fruits/apple.png",
            "fruits/banana.png",
            "fruits/orange.png",
            "fruits/strawberry.png",
            "fruits/grapes.png",
            "fruits/watermelon.png",
        ],
        2,
        3,
    )
    sheet(
        "733587a2-6a14-466c-a766-e9662a42ec3d.jpg",
        [
            "colors/red.png",
            "colors/blue.png",
            "colors/yellow.png",
            "colors/green.png",
            "colors/orange.png",
            "colors/pink.png",
        ],
        2,
        3,
    )
    sheet(
        "8331a5bd-d1d0-4b72-87d5-c82f5011d685.jpg",
        [
            "shapes/circle.png",
            "shapes/square.png",
            "shapes/triangle.png",
            "shapes/star.png",
        ],
        2,
        2,
    )


if __name__ == "__main__":
    main()
