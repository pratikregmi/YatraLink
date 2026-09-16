from fastapi import APIRouter

from app.api.v1.endpoints import auth as auth_endpoint

router = APIRouter()
router.include_router(auth_endpoint.router, prefix='/auth', tags=['auth'])
