import os
import uuid
from pathlib import Path
from fastapi import UploadFile

UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "./uploads"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".avif", ".bmp", ".tiff", ".tif"}
ALLOWED_PDF_EXTENSIONS = {".pdf"}
ALLOWED_AUDIO_EXTENSIONS = {".mp3", ".wav", ".ogg", ".m4a", ".flac", ".aac"}
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm"}


async def save_upload(file: UploadFile, subdir: str = "") -> Path:
    ext = Path(file.filename or "upload").suffix.lower()
    filename = f"{uuid.uuid4().hex}{ext}"
    target = UPLOAD_DIR / subdir / filename
    target.parent.mkdir(parents=True, exist_ok=True)
    content = await file.read()
    target.write_bytes(content)
    return target


def cleanup(path: Path):
    try:
        if path.exists():
            path.unlink()
    except Exception:
        pass
