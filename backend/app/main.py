from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials

from app.api.v1.router import router as api_router
from app.config import get_settings
from app.database import Base, engine

security = HTTPBasic()
ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = 'admin'

settings = get_settings()

app = FastAPI(
    title='YatraOne API',
    version='0.115.0',
    description='Foundation API for YatraOne project setup.',
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

Base.metadata.create_all(bind=engine)
app.include_router(api_router, prefix=settings.api_v1_prefix)


def get_admin_credentials(credentials: HTTPBasicCredentials = Depends(security)) -> HTTPBasicCredentials:
    if credentials.username != ADMIN_USERNAME or credentials.password != ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Unauthorized',
            headers={'WWW-Authenticate': 'Basic'},
        )
    return credentials


@app.get(f'{settings.api_v1_prefix}/health')
def health_check() -> dict[str, str]:
    return {
        'status': 'ok',
        'service': settings.app_name,
    }


@app.get(f'{settings.api_v1_prefix}/admin/health')
def admin_health_check(credentials: HTTPBasicCredentials = Depends(get_admin_credentials)) -> dict[str, str]:
    return {
        'status': 'ok',
        'service': settings.app_name,
        'admin': credentials.username,
    }
