"""Export the A3 print boards with restrained monochromatic paper grain."""

import io
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageCms

WIDTH, HEIGHT = 4961, 3508
MIN_BYTES, MAX_BYTES = 5_300_000, 5_900_000
TARGET_BYTES = 5_600_000
source = Path("test-results/stage-12")
target = Path("deliverables/v3")
profile = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()
random = np.random.default_rng(903)
grain = random.standard_normal((HEIGHT, WIDTH), dtype=np.float32)
metadata = []

for index in (1, 2, 3):
    stem = f"board-{index:02}"
    with Image.open(source / f"{stem}.png") as original:
        assert original.size == (WIDTH, HEIGHT)
        pixels = np.asarray(original.convert("RGB"), dtype=np.int16)

    # Keep the grain in paper-colored and other lighter areas, away from dark fine lines.
    luminance = pixels.mean(axis=2)
    modulation = np.clip((luminance - 135) / 100, 0.0, 1.0).astype(np.float32)
    amplitude = grain * modulation

    def encode(strength, quality):
        variation = np.rint(amplitude * strength).astype(np.int16)
        adjusted = np.clip(pixels + variation[:, :, None], 0, 255).astype(np.uint8)
        buffer = io.BytesIO()
        Image.fromarray(adjusted).save(
            buffer, format="JPEG", quality=quality, subsampling=0, optimize=True,
            dpi=(300, 300), icc_profile=profile,
        )
        return buffer.getvalue()

    low, high = 0.0, 10.0
    quality = 97
    for _ in range(12):
        strength = (low + high) / 2
        payload = encode(strength, quality)
        if MIN_BYTES <= len(payload) <= MAX_BYTES:
            break
        if len(payload) < TARGET_BYTES:
            low = strength
        else:
            high = strength
    else:
        raise ValueError(f"{stem} did not reach the required JPEG size")

    path = target / f"s90_board_{index:02}.jpg"
    path.write_bytes(payload)
    with Image.open(path) as exported:
        assert exported.format == "JPEG" and exported.mode == "RGB"
        assert exported.size == (WIDTH, HEIGHT) and exported.info["dpi"] == (300, 300)
        assert exported.info["icc_profile"]
        metadata.append({
            "name": path.name, "pixels": exported.size, "color": exported.mode,
            "profile": "sRGB", "dpi": exported.info["dpi"], "bytes": len(payload),
            "jpeg_quality": quality, "grain_strength": strength,
        })

(target / "exported_metadata.json").write_text(json.dumps(metadata, indent=2) + "\n")
print(json.dumps(metadata, indent=2))
