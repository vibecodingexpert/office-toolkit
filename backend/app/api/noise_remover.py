from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import Response
from pathlib import Path
import io

router = APIRouter(prefix="/api/noise-remover", tags=["Noise Remover"])

try:
    from PIL import Image
    import numpy as np
    import cv2
    HAS_CV = True
except ImportError:
    HAS_CV = False
    Image = None


@router.post("/remove-noise")
async def remove_noise(file: UploadFile = File(...), strength: int = Form(10)):
    if not HAS_CV:
        return {"error": "OpenCV not available on this server"}, 501
    path = None
    try:
        from app.utils.file_helpers import save_upload, cleanup
        path = await save_upload(file, "noise")
        img = Image.open(path).convert("RGB")
        arr = np.array(img)
        h = max(1, min(strength, 20))
        denoised = cv2.fastNlMeansDenoisingColored(arr, None, h, h, 7, 21)
        result = Image.fromarray(denoised)
        buf = io.BytesIO()
        fmt = Path(file.filename or "image.png").suffix.lower().replace(".", "").replace("jpg", "jpeg")
        if fmt not in ("png", "jpeg", "webp"):
            fmt = "png"
        result.save(buf, format=fmt.upper(), quality=95)
        media_types = {"png": "image/png", "jpeg": "image/jpeg", "webp": "image/webp"}
        return Response(content=buf.getvalue(), media_type=media_types.get(fmt, "image/png"),
                        headers={"Content-Disposition": f"attachment; filename={Path(file.filename or 'image').stem}_denoised.{fmt}"})
    except Exception as e:
        return {"error": str(e)}, 400
    finally:
        if path:
            from app.utils.file_helpers import cleanup
            cleanup(path)
