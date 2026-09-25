"""Reading the style of a reference video: pace of cuts, format, colour."""
from __future__ import annotations

import cv2
import numpy as np

from . import ff

# Neutral values of a typical ungraded talking-head video, used to turn the
# reference's look into relative eq-filter settings.
NEUTRAL_SAT, NEUTRAL_CONTRAST, NEUTRAL_BRIGHT = 0.30, 0.22, 0.45


def analyze(path: str, sample_fps: float = 8.0) -> dict:
    info = ff.probe(path)
    cap = cv2.VideoCapture(path)
    step = max(1, int(round(info["fps"] / sample_fps)))
    prev_hist, cuts, idx = None, [], 0
    sats, vals, stds = [], [], []
    while True:
        ok = cap.grab()
        if not ok:
            break
        if idx % step == 0:
            ok, frame = cap.retrieve()
            if not ok:
                break
            small = cv2.resize(frame, (160, int(160 * frame.shape[0] / frame.shape[1])))
            hsv = cv2.cvtColor(small, cv2.COLOR_BGR2HSV)
            hist = cv2.calcHist([hsv], [0, 1], None, [16, 8], [0, 180, 0, 256])
            cv2.normalize(hist, hist)
            if prev_hist is not None and cv2.compareHist(prev_hist, hist, cv2.HISTCMP_BHATTACHARYYA) > 0.35:
                cuts.append(idx / info["fps"])
            prev_hist = hist
            sats.append(hsv[..., 1].mean() / 255)
            vals.append(hsv[..., 2].mean() / 255)
            stds.append(hsv[..., 2].std() / 255)
        idx += 1
    cap.release()
    dur = info["duration"] or idx / info["fps"]
    shots = len(cuts) + 1
    sat, val, std = (float(np.mean(x)) if x else 0 for x in (sats, vals, stds))
    return {
        "width": info["width"], "height": info["height"], "fps": round(info["fps"], 2),
        "duration": round(dur, 1), "aspect": "9:16" if info["height"] > info["width"] else "16:9 / other",
        "cuts": len(cuts), "avg_shot_seconds": round(dur / shots, 2),
        "saturation": round(sat, 3), "brightness": round(val, 3), "contrast": round(std, 3),
    }


def to_style(a: dict) -> dict:
    """Style overrides that bring a clip closer to the reference."""
    shot = a["avg_shot_seconds"]
    return {
        # Talking-head clips have few real cuts, so punch-in zooms stand in for the reference's cut rhythm.
        "zoom": {"enabled": shot < 8, "every": float(np.clip(shot, 1.2, 5.0)), "scale": 1.14 if shot < 2.5 else 1.1},
        "color": {
            "saturation": float(np.clip(a["saturation"] / NEUTRAL_SAT, 0.6, 1.6)),
            "contrast": float(np.clip(a["contrast"] / NEUTRAL_CONTRAST, 0.8, 1.35)),
            "brightness": float(np.clip((a["brightness"] - NEUTRAL_BRIGHT) * 0.3, -0.08, 0.08)),
        },
        "target_seconds": float(np.clip(a["duration"], 15, 90)),
    }
