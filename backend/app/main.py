from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.api import ocr, image_upscaler, image_enhance, noise_remover, heic_converter, pdf_tools, health
from app.config import MAX_UPLOAD_SIZE

app = FastAPI(
    title="Office Toolkit Pro - Python Backend",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_size=MAX_UPLOAD_SIZE,
)

app.include_router(health.router)
app.include_router(ocr.router)
app.include_router(image_upscaler.router)
app.include_router(image_enhance.router)
app.include_router(noise_remover.router)
app.include_router(heic_converter.router)
app.include_router(pdf_tools.router)


@app.get("/")
async def root():
    return {"message": "Office Toolkit Pro - Python Backend", "docs": "/api/docs"}


if __name__ == "__main__":
    import uvicorn
    from app.config import HOST, PORT, LOG_LEVEL
    uvicorn.run("app.main:app", host=HOST, port=PORT, log_level=LOG_LEVEL.lower())
