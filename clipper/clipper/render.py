"""Vertical 9:16 render: follow the speaker's face, punch-in zooms, colour, burned-in captions."""
from __future__ import annotations

import subprocess
from pathlib import Path

import cv2
import numpy as np

from . import ff
from .captions import H as OUT_H, W as OUT_W

YUNET_URL = ("https://media.githubusercontent.com/media/opencv/opencv_zoo/main/models/"
             "face_detection_yunet/face_detection_yunet_2023mar.onnx")
_det = None


def _yunet_model() -> Path | None:
    """YuNet (230 KB) is far more reliable than Haar on turned heads; downloaded once into ~/.cache."""
    path = Path.home() / ".cache" / "clipper" / "face_detection_yunet_2023mar.onnx"
    if path.exists() and path.stat().st_size > 100_000:
        return path
    try:
        import urllib.request
        path.parent.mkdir(parents=True, exist_ok=True)
        urllib.request.urlretrieve(YUNET_URL, path)
        return path if path.stat().st_size > 100_000 else None
    except Exception:
        return None


def _detector():
    """Returns a function frame -> list of (x, y, w, h), or None when no detector is available."""
    global _det
    if _det is not None:
        return _det or None
    model = _yunet_model() if hasattr(cv2, "FaceDetectorYN") else None
    if model:
        yn = cv2.FaceDetectorYN.create(str(model), "", (320, 320), 0.6)

        def detect(img):
            yn.setInputSize((img.shape[1], img.shape[0]))
            _, faces = yn.detect(img)
            return [] if faces is None else [tuple(f[:4]) for f in faces]
        _det = detect
    elif hasattr(cv2, "CascadeClassifier"):
        haar = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

        def detect(img):
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            return list(haar.detectMultiScale(gray, scaleFactor=1.05, minNeighbors=4, minSize=(24, 24)))
        _det = detect
    else:
        print("[clipper] Нет детектора лиц: кадр будет по центру", flush=True)
        _det = False
    return _det or None


def face_track(path: str, start: float, end: float, step: float = 0.33) -> tuple[np.ndarray, np.ndarray]:
    """Horizontal centre (0..1) of the largest face, sampled every `step` seconds and smoothed."""
    cap = cv2.VideoCapture(path)
    det = _detector()
    ts, xs, last = [], [], 0.5
    t = start
    while t <= end:
        cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000)
        ok, frame = cap.read()
        if not ok:
            break
        sw_ = min(960, frame.shape[1])
        small = cv2.resize(frame, (sw_, int(sw_ * frame.shape[0] / frame.shape[1])))
        faces = det(small) if det else []
        if faces:
            x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
            last = (x + w / 2) / small.shape[1]
        ts.append(t)
        xs.append(last)
        t += step
    cap.release()
    if not ts:
        return np.array([start, end]), np.array([0.5, 0.5])
    xs = np.array(xs)
    # Median filter drops single-frame false detections.
    k = 5
    padded = np.pad(xs, k // 2, mode="edge")
    xs = np.array([np.median(padded[i:i + k]) for i in range(len(xs))])
    # Hold the camera still until the face moves noticeably: steady framing reads as "operated", jitter as "bot".
    held, cur = [], xs[0]
    for x in xs:
        if abs(x - cur) > 0.08:
            cur = x
        held.append(cur)
    # Small moves ease in; large ones cut.
    held = np.array(held)
    eased = held.copy()
    for i in range(1, len(eased)):
        if abs(held[i] - eased[i - 1]) > 0.25:
            eased[i] = held[i]  # another speaker: cut, like an editor would, instead of panning across the room
        else:
            eased[i] = eased[i - 1] + (held[i] - eased[i - 1]) * 0.35
    return np.array(ts), eased


def zoom_at(t: float, z: dict) -> float:
    """Punch-in schedule: alternate normal and zoomed shots every `every` seconds, with a quick ease."""
    if not z.get("enabled", True):
        return 1.0
    every, scale = z.get("every", 3.0), z.get("scale", 1.12)
    k = int(t // every)
    target = scale if k % 2 else 1.0
    prev = 1.0 if k % 2 else scale
    if k == 0:
        return 1.0
    p = min((t - k * every) / 0.12, 1.0)
    return prev + (target - prev) * p


def color_filter(c: dict) -> str:
    if not c:
        return ""
    return (f"eq=contrast={c.get('contrast', 1.0):.3f}:brightness={c.get('brightness', 0.0):.3f}:"
            f"saturation={c.get('saturation', 1.0):.3f}:gamma={c.get('gamma', 1.0):.3f},")


def render_clip(src: str, start: float, end: float, ass_path: Path, out: Path, style: dict, info: dict) -> None:
    fps = info["fps"] if 10 < info["fps"] <= 60 else 30.0
    sw, sh = info["width"], info["height"]
    vertical_src = sw / sh <= OUT_W / OUT_H + 0.01
    ts, xs = (np.array([start, end]), np.array([0.5, 0.5])) if vertical_src else face_track(src, start, end)

    fonts = Path(__file__).parent / "fonts"
    vf = color_filter(style.get("color", {}))
    ass = str(ass_path).replace("\\", "/").replace(":", "\\:")
    vf += f"ass='{ass}'" + (f":fontsdir='{fonts}'" if fonts.exists() else "")
    cmd = [ff.ffmpeg(), "-hide_banner", "-loglevel", "error", "-y",
           "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{OUT_W}x{OUT_H}", "-r", f"{fps:.3f}", "-i", "-",
           "-ss", f"{start:.3f}", "-t", f"{end - start:.3f}", "-i", src,
           "-map", "0:v", "-map", "1:a?", "-vf", vf,
           "-c:v", "libx264", "-preset", style.get("preset", "veryfast"), "-crf", str(style.get("crf", 20)),
           "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
           "-movflags", "+faststart", "-shortest", str(out)]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    cap = cv2.VideoCapture(src)
    cap.set(cv2.CAP_PROP_POS_MSEC, start * 1000)
    n = int(round((end - start) * fps))
    crop_w = min(sw, int(round(sh * OUT_W / OUT_H)))
    zoom = style.get("zoom", {})
    frame = None
    try:
        for i in range(n):
            ok, f = cap.read()
            if ok:
                frame = f
            elif frame is None:
                break
            t = i / fps
            z = zoom_at(t, zoom)
            if vertical_src:
                h_ = int(sh / z)
                w_ = int(h_ * OUT_W / OUT_H)
                x0 = (sw - w_) // 2
                y0 = (sh - h_) // 2
            else:
                cx = float(np.interp(start + t, ts, xs)) * sw
                w_, h_ = int(crop_w / z), int(sh / z)
                x0 = int(np.clip(cx - w_ / 2, 0, sw - w_))
                # When zoomed in, bias upwards: faces sit in the top half of a talking-head frame.
                y0 = int(np.clip((sh - h_) * 0.35, 0, sh - h_))
            crop = frame[y0:y0 + h_, x0:x0 + w_]
            proc.stdin.write(cv2.resize(crop, (OUT_W, OUT_H), interpolation=cv2.INTER_AREA).tobytes())
    finally:
        cap.release()
        proc.stdin.close()
        if proc.wait() != 0:
            raise RuntimeError(f"ffmpeg failed for {out}")
