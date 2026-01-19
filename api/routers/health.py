"""Health check router."""

from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
async def health_check():
    """Health check endpoint.

    Returns:
        Dict with status indicating service health.
    """
    return {"status": "ok"}
