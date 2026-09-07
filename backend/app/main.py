from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings

settings = get_settings()

app = FastAPI(
    title='YatraOne API',
    version='0.1.0',
    description='Foundation API for YatraOne project setup.',
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.get(f'{settings.api_v1_prefix}/health')
def health_check() -> dict[str, str]:
    return {
        'status': 'ok',
        'service': settings.app_name,
    }
