from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import Response
from pathlib import Path
import io
import zipfile
from typing import List
from app.utils.file_helpers import save_upload, cleanup
from app.utils.pdf_processing import (
    pdf_to_images_bytes, pdf_to_text, pdf_to_docx,
    compress_pdf, extract_images_from_pdf
)

router = APIRouter(prefix="/api/pdf", tags=["PDF Tools"])


@router.post("/to-images")
async def pdf_to_images_endpoint(
    file: UploadFile = File(...),
    fmt: str = Form("jpeg"),
    dpi: int = Form(200),
):
    path = await save_upload(file, "pdf")
    try:
        images = pdf_to_images_bytes(path, fmt, dpi)
        buf = io.BytesIO()
        stem = Path(file.filename or "document").stem
        if len(images) == 1:
            return Response(content=images[0], media_type=f"image/{fmt}",
                            headers={"Content-Disposition": f"attachment; filename={stem}_page_1.{fmt}"})
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
            for i, img_bytes in enumerate(images):
                zf.writestr(f"{stem}_page_{i + 1}.{fmt}", img_bytes)
        return Response(content=buf.getvalue(), media_type="application/zip",
                        headers={"Content-Disposition": f"attachment; filename={stem}_images.zip"})
    except Exception as e:
        return {"error": str(e)}, 400
    finally:
        cleanup(path)


@router.post("/to-text")
async def pdf_to_text_endpoint(file: UploadFile = File(...)):
    path = await save_upload(file, "pdf")
    try:
        text = pdf_to_text(path)
        return Response(content=text, media_type="text/plain",
                        headers={"Content-Disposition": f"attachment; filename={Path(file.filename or 'document').stem}_text.txt"})
    except Exception as e:
        return {"error": str(e)}, 400
    finally:
        cleanup(path)


@router.post("/to-docx")
async def pdf_to_docx_endpoint(file: UploadFile = File(...)):
    path = await save_upload(file, "pdf")
    try:
        docx_bytes = pdf_to_docx(path)
        return Response(content=docx_bytes, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        headers={"Content-Disposition": f"attachment; filename={Path(file.filename or 'document').stem}_converted.docx"})
    except Exception as e:
        return {"error": str(e)}, 400
    finally:
        cleanup(path)


@router.post("/compress")
async def pdf_compress_endpoint(
    file: UploadFile = File(...),
    quality: int = Form(0),
):
    path = await save_upload(file, "pdf")
    try:
        compressed = compress_pdf(path, quality)
        return Response(content=compressed, media_type="application/pdf",
                        headers={"Content-Disposition": f"attachment; filename={Path(file.filename or 'document').stem}_compressed.pdf"})
    except Exception as e:
        return {"error": str(e)}, 400
    finally:
        cleanup(path)


@router.post("/extract-images")
async def pdf_extract_images_endpoint(
    file: UploadFile = File(...),
    min_size: int = Form(100),
):
    path = await save_upload(file, "pdf")
    try:
        images = extract_images_from_pdf(path, min_size)
        buf = io.BytesIO()
        stem = Path(file.filename or "document").stem
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
            for i, (img_bytes, ext) in enumerate(images):
                zf.writestr(f"{stem}_image_{i + 1}.{ext}", img_bytes)
        return Response(content=buf.getvalue(), media_type="application/zip",
                        headers={"Content-Disposition": f"attachment; filename={stem}_images.zip"})
    except Exception as e:
        return {"error": str(e)}, 400
    finally:
        cleanup(path)
