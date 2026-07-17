from fastapi import APIRouter, UploadFile, File, Form
from pathlib import Path
import pytesseract
from PIL import Image
from app.utils.file_helpers import save_upload, cleanup

router = APIRouter(prefix="/api/ocr", tags=["OCR"])


@router.post("/extract")
async def extract_text(
    file: UploadFile = File(...),
    lang: str = Form("eng"),
):
    path = await save_upload(file, "ocr")
    try:
        img = Image.open(path)
        text = pytesseract.image_to_string(img, lang=lang)
        return {"text": text}
    except Exception as e:
        return {"error": str(e)}, 400
    finally:
        cleanup(path)


@router.post("/extract-and-download")
async def extract_text_download(
    file: UploadFile = File(...),
    lang: str = Form("eng"),
):
    path = await save_upload(file, "ocr")
    try:
        img = Image.open(path)
        text = pytesseract.image_to_string(img, lang=lang)
        from fastapi.responses import PlainTextResponse
        return PlainTextResponse(text, media_type="text/plain",
                                 headers={"Content-Disposition": f"attachment; filename={Path(file.filename or 'ocr').stem}_ocr.txt"})
    except Exception as e:
        return {"error": str(e)}, 400
    finally:
        cleanup(path)
