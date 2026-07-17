from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import Response
from pathlib import Path
from PIL import Image
import io
from app.utils.file_helpers import save_upload, cleanup
from app.utils.image_processing import upscale_image

router = APIRouter(prefix="/api/image-upscaler", tags=["Image Upscaler"])


@router.post("/upscale")
async def upscale(
    file: UploadFile = File(...),
    scale: int = Form(2),
):
    path = await save_upload(file, "upscaler")
    try:
        img = Image.open(path)
        img = img.convert("RGB")
        result = upscale_image(img, scale)
        buf = io.BytesIO()
        fmt = Path(file.filename or "image.png").suffix.lower().replace(".", "").replace("jpg", "jpeg")
        if fmt not in ("png", "jpeg", "webp"):
            fmt = "png"
        result.save(buf, format=fmt.upper(), quality=95)
        media_types = {"png": "image/png", "jpeg": "image/jpeg", "webp": "image/webp"}
        return Response(
            content=buf.getvalue(),
            media_type=media_types.get(fmt, "image/png"),
            headers={"Content-Disposition": f"attachment; filename={Path(file.filename or 'image').stem}_upscaled_{scale}x.{fmt}"}
        )
    except Exception as e:
        return {"error": str(e)}, 400
    finally:
        cleanup(path)
