from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import Response
from pathlib import Path
from PIL import Image
import io
from app.utils.file_helpers import save_upload, cleanup
from app.utils.image_processing import enhance_image

router = APIRouter(prefix="/api/image-enhance", tags=["Image Enhancement"])


@router.post("/enhance")
async def enhance(
    file: UploadFile = File(...),
    sharpness: float = Form(1.0),
    contrast: float = Form(1.0),
    brightness: float = Form(1.0),
    saturation: float = Form(1.0),
    denoise: bool = Form(False),
):
    path = await save_upload(file, "enhance")
    try:
        img = Image.open(path).convert("RGB")
        result = enhance_image(img, sharpness, contrast, brightness, saturation, denoise)
        buf = io.BytesIO()
        fmt = Path(file.filename or "image.png").suffix.lower().replace(".", "").replace("jpg", "jpeg")
        if fmt not in ("png", "jpeg", "webp"):
            fmt = "png"
        result.save(buf, format=fmt.upper(), quality=95)
        media_types = {"png": "image/png", "jpeg": "image/jpeg", "webp": "image/webp"}
        return Response(
            content=buf.getvalue(),
            media_type=media_types.get(fmt, "image/png"),
            headers={"Content-Disposition": f"attachment; filename={Path(file.filename or 'image').stem}_enhanced.{fmt}"}
        )
    except Exception as e:
        return {"error": str(e)}, 400
    finally:
        cleanup(path)
