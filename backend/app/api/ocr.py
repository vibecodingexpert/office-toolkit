from fastapi import APIRouter, UploadFile, File, Form
from pathlib import Path

router = APIRouter(prefix="/api/ocr", tags=["OCR"])

try:
    import pytesseract
    from PIL import Image
    HAS_TESSERACT = True
except ImportError:
    HAS_TESSERACT = False
    Image = None


@router.post("/extract")
async def extract_text(file: UploadFile = File(...), lang: str = Form("eng")):
    if not HAS_TESSERACT:
        return {"error": "Tesseract OCR not available on this server"}, 501
    path = None
    try:
        from app.utils.file_helpers import save_upload, cleanup
        path = await save_upload(file, "ocr")
        img = Image.open(path)
        text = pytesseract.image_to_string(img, lang=lang)
        return {"text": text}
    except Exception as e:
        return {"error": str(e)}, 400
    finally:
        if path:
            from app.utils.file_helpers import cleanup
            cleanup(path)


@router.post("/extract-and-download")
async def extract_text_download(file: UploadFile = File(...), lang: str = Form("eng")):
    if not HAS_TESSERACT:
        return {"error": "Tesseract OCR not available on this server"}, 501
    path = None
    try:
        from app.utils.file_helpers import save_upload, cleanup
        path = await save_upload(file, "ocr")
        img = Image.open(path)
        text = pytesseract.image_to_string(img, lang=lang)
        from fastapi.responses import PlainTextResponse
        return PlainTextResponse(text, media_type="text/plain",
                                 headers={"Content-Disposition": f"attachment; filename={Path(file.filename or 'ocr').stem}_ocr.txt"})
    except Exception as e:
        return {"error": str(e)}, 400
    finally:
        if path:
            from app.utils.file_helpers import cleanup
            cleanup(path)
