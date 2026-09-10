from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import router as api_router
from app.config import get_settings
from app.database import Base, engine

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


@app.get(f'{settings.api_v1_prefix}/health')
def health_check() -> dict[str, str]:
    return {
        'status': 'ok',
        'service': settings.app_name,
    }
