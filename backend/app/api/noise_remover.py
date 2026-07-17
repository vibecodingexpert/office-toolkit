from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import Response
from pathlib import Path
import io
import numpy as np
from app.utils.file_helpers import save_upload, cleanup

router = APIRouter(prefix="/api/noise-remover", tags=["Noise Remover"])


@router.post("/remove-noise")
async def remove_noise(
    file: UploadFile = File(...),
    strength: int = Form(10),
):
    path = await save_upload(file, "noise")
    try:
        from PIL import Image
        img = Image.open(path).convert("RGB")
        arr = np.array(img)
        h = strength
        if h > 20:
            h = 20
        if h < 1:
            h = 1
        from cv2 import fastNlMeansDenoisingColored
        denoised = fastNlMeansDenoisingColored(arr, None, h, h, 7, 21)
        result = Image.fromarray(denoised)
        buf = io.BytesIO()
        fmt = Path(file.filename or "image.png").suffix.lower().replace(".", "").replace("jpg", "jpeg")
        if fmt not in ("png", "jpeg", "webp"):
            fmt = "png"
        result.save(buf, format=fmt.upper(), quality=95)
        media_types = {"png": "image/png", "jpeg": "image/jpeg", "webp": "image/webp"}
        return Response(
            content=buf.getvalue(),
            media_type=media_types.get(fmt, "image/png"),
            headers={"Content-Disposition": f"attachment; filename={Path(file.filename or 'image').stem}_denoised.{fmt}"}
        )
    except Exception as e:
        return {"error": str(e)}, 400
    finally:
        cleanup(path)
