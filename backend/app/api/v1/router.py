from fastapi import APIRouter

from app.api.v1.endpoints import auth as auth_endpoint, providers as providers_endpoint

router = APIRouter()
router.include_router(auth_endpoint.router, prefix='/auth', tags=['auth'])
router.include_router(providers_endpoint.router, prefix='/providers', tags=['providers'])
