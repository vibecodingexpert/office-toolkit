from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import Response
from pathlib import Path
import io

router = APIRouter(prefix="/api/image-upscaler", tags=["Image Upscaler"])

try:
    from PIL import Image
    import numpy as np
    import cv2
    HAS_CV = True
except ImportError:
    HAS_CV = False
    Image = None


@router.post("/upscale")
async def upscale(file: UploadFile = File(...), scale: int = Form(2)):
    if not HAS_CV:
        return Response(status_code=501, content='{"error":"OpenCV not available on this server"}', media_type="application/json")
    path = None
    try:
        from app.utils.file_helpers import save_upload, cleanup
        path = await save_upload(file, "upscaler")
        img = Image.open(path).convert("RGB")
        arr = np.array(img)
        if scale > 4:
            scale = 4
        if scale < 1:
            scale = 1
        new_w, new_h = arr.shape[1] * scale, arr.shape[0] * scale
        interp = cv2.INTER_CUBIC if scale <= 2 else cv2.INTER_LANCZOS4
        upscaled = cv2.resize(arr, (new_w, new_h), interpolation=interp)
        result = Image.fromarray(upscaled)
        buf = io.BytesIO()
        fmt = Path(file.filename or "image.png").suffix.lower().replace(".", "").replace("jpg", "jpeg")
        if fmt not in ("png", "jpeg", "webp"):
            fmt = "png"
        result.save(buf, format=fmt.upper(), quality=95)
        media_types = {"png": "image/png", "jpeg": "image/jpeg", "webp": "image/webp"}
        return Response(content=buf.getvalue(), media_type=media_types.get(fmt, "image/png"),
                        headers={"Content-Disposition": f"attachment; filename={Path(file.filename or 'image').stem}_upscaled_{scale}x.{fmt}"})
    except Exception as e:
        return {"error": str(e)}, 400
    finally:
        if path:
            from app.utils.file_helpers import cleanup
            cleanup(path)
