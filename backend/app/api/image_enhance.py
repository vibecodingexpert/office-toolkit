from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import Response
from pathlib import Path
import io

router = APIRouter(prefix="/api/image-enhance", tags=["Image Enhancement"])

try:
    from PIL import Image, ImageEnhance
    import numpy as np
    HAS_PIL = True
except ImportError:
    HAS_PIL = False
    Image = None

try:
    import cv2
    HAS_CV = True
except ImportError:
    HAS_CV = False


@router.post("/enhance")
async def enhance(
    file: UploadFile = File(...),
    sharpness: float = Form(1.0),
    contrast: float = Form(1.0),
    brightness: float = Form(1.0),
    saturation: float = Form(1.0),
    denoise: bool = Form(False),
):
    if not HAS_PIL:
        return {"error": "Pillow not available on this server"}, 501
    path = None
    try:
        from app.utils.file_helpers import save_upload, cleanup
        path = await save_upload(file, "enhance")
        img = Image.open(path).convert("RGB")
        if sharpness != 1.0:
            img = ImageEnhance.Sharpness(img).enhance(sharpness)
        if contrast != 1.0:
            img = ImageEnhance.Contrast(img).enhance(contrast)
        if brightness != 1.0:
            img = ImageEnhance.Brightness(img).enhance(brightness)
        if saturation != 1.0:
            img = ImageEnhance.Color(img).enhance(saturation)
        if denoise and HAS_CV:
            arr = np.array(img)
            arr = cv2.fastNlMeansDenoisingColored(arr, None, 10, 10, 7, 21)
            img = Image.fromarray(arr)
        buf = io.BytesIO()
        fmt = Path(file.filename or "image.png").suffix.lower().replace(".", "").replace("jpg", "jpeg")
        if fmt not in ("png", "jpeg", "webp"):
            fmt = "png"
        img.save(buf, format=fmt.upper(), quality=95)
        media_types = {"png": "image/png", "jpeg": "image/jpeg", "webp": "image/webp"}
        return Response(content=buf.getvalue(), media_type=media_types.get(fmt, "image/png"),
                        headers={"Content-Disposition": f"attachment; filename={Path(file.filename or 'image').stem}_enhanced.{fmt}"})
    except Exception as e:
        return {"error": str(e)}, 400
    finally:
        if path:
            from app.utils.file_helpers import cleanup
            cleanup(path)
