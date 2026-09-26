"""Locating and calling ffmpeg / ffprobe."""
from __future__ import annotations

import json
import shutil
import subprocess


def ffmpeg() -> str:
    exe = shutil.which("ffmpeg")
    if exe:
        return exe
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError as e:
        raise SystemExit("ffmpeg не найден: установите ffmpeg или `pip install imageio-ffmpeg`") from e


def run(args: list[str], **kw) -> subprocess.CompletedProcess:
    return subprocess.run([ffmpeg(), "-hide_banner", "-loglevel", "error", "-y", *args], check=True, **kw)


def probe(path: str) -> dict:
    """Width, height, fps and duration. Uses ffprobe when available, else OpenCV."""
    fp = shutil.which("ffprobe")
    if fp:
        out = subprocess.run([fp, "-v", "error", "-select_streams", "v:0", "-show_entries",
                              "stream=width,height,r_frame_rate:format=duration", "-of", "json", path],
                             check=True, capture_output=True, text=True).stdout
        d = json.loads(out)
        s = d["streams"][0]
        num, den = s["r_frame_rate"].split("/")
        return {"width": int(s["width"]), "height": int(s["height"]),
                "fps": float(num) / float(den), "duration": float(d["format"]["duration"])}
    import cv2
    cap = cv2.VideoCapture(path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    n = cap.get(cv2.CAP_PROP_FRAME_COUNT)
    info = {"width": int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), "height": int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
            "fps": fps, "duration": n / fps if n else 0.0}
    cap.release()
    return info
