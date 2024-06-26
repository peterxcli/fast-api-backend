from typing import Any

import psutil
import schemas
from db import ASYNC_SESSION
from deps import get_db
from fastapi import APIRouter, Depends, Response, status

router = APIRouter()


GET_HEALTH = {
    200: {
        "description": "API response successfully",
        "content": {"json": {"detail": "Service healthy"}},
    }
}


@router.get(
    "/",
    status_code=status.HTTP_200_OK,
    responses=GET_HEALTH,
    response_model=schemas.Msg,
    name="health:get_health",
)
async def get_health(response: Response) -> Any:
    response.headers["Cache-Control"] = "no-cache"
    # check sql traffic status and server cpu, disk and memory usage
    # res = await db.execute("SELECT 1")
    data = {
        # "sql_traffic_status": res.scalars().first(),
        "cpu_usage_status": psutil.cpu_percent(interval=1),
        "disk_usage_status": psutil.disk_usage("/").percent,
        "memory_usage_status": psutil.virtual_memory().percent,
    }
    return {"detail": "Service healthy", "data": data}
    # return schemas.Msg(detail="Service healthy")
