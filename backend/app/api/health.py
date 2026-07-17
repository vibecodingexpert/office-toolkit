from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/api/health")
async def health():
    return {"status": "ok", "service": "office-toolkit-python-backend"}
