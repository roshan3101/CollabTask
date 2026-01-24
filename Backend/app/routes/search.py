from fastapi import APIRouter, Depends, Request, Query
from fastapi.responses import JSONResponse
from typing import Optional, List
from app.dependencies import require_user
from app.utils import ApiResponse
from app.managers.search import SearchManager

router = APIRouter(
    prefix="/search",
    tags=["Search"]
)

@router.get("")
@router.get("/")
async def search(
    request: Request,
    user=Depends(require_user),
    q: str = Query(..., min_length=2, description="Search query (minimum 2 characters)"),
    types: Optional[str] = Query(None, description="Comma-separated entity types: task,project,organization")
):
    entity_types = None
    if types:
        entity_types = [t.strip() for t in types.split(",") if t.strip() in ["task", "project", "organization"]]
    
    result = await SearchManager.search(
        user_id=str(user.get('user_id')),
        query=q,
        entity_types=entity_types
    )
    
    content = ApiResponse(success=True, message="Search completed successfully", data=result)
    return JSONResponse(content=content, status_code=200)
