from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import Response
from pathlib import Path
import io
import zipfile

router = APIRouter(prefix="/api/pdf", tags=["PDF Tools"])

try:
    import fitz
    from PIL import Image
    HAS_PYMUPDF = True
except ImportError:
    HAS_PYMUPDF = False

try:
    import pypdf
    HAS_PYPDF = True
except ImportError:
    HAS_PYPDF = False

try:
    from docx import Document
    HAS_DOCX = True
except ImportError:
    HAS_DOCX = False


def _pdf_to_images(pdf_path: Path, dpi: int = 200):
    doc = fitz.open(pdf_path)
    images = []
    mat = fitz.Matrix(dpi / 72, dpi / 72)
    for page in doc:
        pix = page.get_pixmap(matrix=mat)
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=92)
        images.append(buf.getvalue())
    doc.close()
    return images


def _pdf_to_text(pdf_path: Path) -> str:
    doc = fitz.open(pdf_path)
    text = "".join(page.get_text() for page in doc)
    doc.close()
    return text


def _pdf_to_docx(pdf_path: Path) -> bytes:
    doc = fitz.open(pdf_path)
    output = Document()
    for page in doc:
        blocks = page.get_text("blocks")
        blocks.sort(key=lambda b: (b[1], b[0]))
        for block in blocks:
            text = block[4].strip()
            if text:
                output.add_paragraph(text)
    doc.close()
    buf = io.BytesIO()
    output.save(buf)
    return buf.getvalue()


@router.post("/to-images")
async def pdf_to_images_endpoint(file: UploadFile = File(...), fmt: str = Form("jpeg"), dpi: int = Form(200)):
    if not HAS_PYMUPDF:
        return {"error": "PyMuPDF not available on this server"}, 501
    path = None
    try:
        from app.utils.file_helpers import save_upload, cleanup
        path = await save_upload(file, "pdf")
        images = _pdf_to_images(path, dpi)
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
        if path:
            from app.utils.file_helpers import cleanup
            cleanup(path)


@router.post("/to-text")
async def pdf_to_text_endpoint(file: UploadFile = File(...)):
    if not HAS_PYMUPDF:
        return {"error": "PyMuPDF not available on this server"}, 501
    path = None
    try:
        from app.utils.file_helpers import save_upload, cleanup
        path = await save_upload(file, "pdf")
        text = _pdf_to_text(path)
        return Response(content=text, media_type="text/plain",
                        headers={"Content-Disposition": f"attachment; filename={Path(file.filename or 'document').stem}_text.txt"})
    except Exception as e:
        return {"error": str(e)}, 400
    finally:
        if path:
            from app.utils.file_helpers import cleanup
            cleanup(path)


@router.post("/to-docx")
async def pdf_to_docx_endpoint(file: UploadFile = File(...)):
    if not HAS_PYMUPDF or not HAS_DOCX:
        return {"error": "Required libraries not available on this server"}, 501
    path = None
    try:
        from app.utils.file_helpers import save_upload, cleanup
        path = await save_upload(file, "pdf")
        docx_bytes = _pdf_to_docx(path)
        return Response(content=docx_bytes, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        headers={"Content-Disposition": f"attachment; filename={Path(file.filename or 'document').stem}_converted.docx"})
    except Exception as e:
        return {"error": str(e)}, 400
    finally:
        if path:
            from app.utils.file_helpers import cleanup
            cleanup(path)


@router.post("/compress")
async def pdf_compress_endpoint(file: UploadFile = File(...), quality: int = Form(0)):
    if not HAS_PYPDF:
        return {"error": "pypdf not available on this server"}, 501
    path = None
    try:
        from app.utils.file_helpers import save_upload, cleanup
        path = await save_upload(file, "pdf")
        reader = pypdf.PdfReader(path)
        writer = pypdf.PdfWriter()
        for page in reader.pages:
            writer.add_page(page)
        for page in writer.pages:
            for img in page.images:
                img.replace(img.image, quality=quality)
        buf = io.BytesIO()
        writer.write(buf)
        return Response(content=buf.getvalue(), media_type="application/pdf",
                        headers={"Content-Disposition": f"attachment; filename={Path(file.filename or 'document').stem}_compressed.pdf"})
    except Exception as e:
        return {"error": str(e)}, 400
    finally:
        if path:
            from app.utils.file_helpers import cleanup
            cleanup(path)


@router.post("/extract-images")
async def pdf_extract_images_endpoint(file: UploadFile = File(...), min_size: int = Form(100)):
    if not HAS_PYMUPDF:
        return {"error": "PyMuPDF not available on this server"}, 501
    path = None
    try:
        from app.utils.file_helpers import save_upload, cleanup
        path = await save_upload(file, "pdf")
        doc = fitz.open(path)
        results = []
        for page_num in range(len(doc)):
            page = doc[page_num]
            for img_info in page.get_images(full=True):
                xref = img_info[0]
                base_image = doc.extract_image(xref)
                img_bytes = base_image["image"]
                ext = base_image["ext"]
                img = Image.open(io.BytesIO(img_bytes))
                if img.width >= min_size and img.height >= min_size:
                    results.append((img_bytes, ext))
        doc.close()
        buf = io.BytesIO()
        stem = Path(file.filename or "document").stem
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
            for i, (img_bytes, ext) in enumerate(results):
                zf.writestr(f"{stem}_image_{i + 1}.{ext}", img_bytes)
        return Response(content=buf.getvalue(), media_type="application/zip",
                        headers={"Content-Disposition": f"attachment; filename={stem}_images.zip"})
    except Exception as e:
        return {"error": str(e)}, 400
    finally:
        if path:
            from app.utils.file_helpers import cleanup
            cleanup(path)
