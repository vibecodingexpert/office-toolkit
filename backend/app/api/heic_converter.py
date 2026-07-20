from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import Response
from pathlib import Path
import io

router = APIRouter(prefix="/api/heic-converter", tags=["HEIC Converter"])

try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False
    Image = None


@router.post("/convert")
async def convert_heic(file: UploadFile = File(...), format: str = Form("png")):
    if not HAS_PIL:
        return {"error": "Pillow not available on this server"}, 501
    path = None
    try:
        from app.utils.file_helpers import save_upload, cleanup
        path = await save_upload(file, "heic")
        img = Image.open(path).convert("RGB")
        out_fmt = format.lower()
        if out_fmt not in ("png", "jpeg", "webp"):
            out_fmt = "png"
        buf = io.BytesIO()
        save_kwargs = {"format": out_fmt.upper()}
        if out_fmt == "jpeg":
            save_kwargs["quality"] = 95
        img.save(buf, **save_kwargs)
        media_types = {"png": "image/png", "jpeg": "image/jpeg", "webp": "image/webp"}
        return Response(content=buf.getvalue(), media_type=media_types.get(out_fmt, "image/png"),
                        headers={"Content-Disposition": f"attachment; filename={Path(file.filename or 'image').stem}_converted.{out_fmt}"})
    except Exception as e:
        return {"error": str(e)}, 400
    finally:
        if path:
            from app.utils.file_helpers import cleanup
            cleanup(path)
