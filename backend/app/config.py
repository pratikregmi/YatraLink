import json
from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = 'yatraone-api'
    api_v1_prefix: str = '/api/v1'
    debug: bool = False
    database_url: str = Field(
        default='sqlite:///./yatraone.db',
        validation_alias='DATABASE_URL',
    )
    backend_cors_origins: list[str] = Field(
        default_factory=lambda: ['http://localhost:5173', 'http://127.0.0.1:5173'],
        validation_alias='BACKEND_CORS_ORIGINS',
    )
    jwt_secret_key: str = Field(
        default='dev-jwt-secret-key-change-me',
        validation_alias='JWT_SECRET_KEY',
    )
    secret_key: str = Field(
        default='dev-jwt-secret-key-change-me',
        validation_alias='SECRET_KEY',
    )
    jwt_algorithm: str = Field(
        default='HS256',
        validation_alias='JWT_ALGORITHM',
    )
    jwt_access_token_expire_minutes: int = Field(
        default=60 * 24,
        validation_alias='JWT_ACCESS_TOKEN_EXPIRE_MINUTES',
    )

    @field_validator('backend_cors_origins', mode='before')
    @classmethod
    def parse_backend_cors_origins(cls, value):
        if value is None:
            return []
        if isinstance(value, list):
            return value
        if isinstance(value, str):
            stripped = value.strip()
            if not stripped:
                return []
            if stripped.startswith('['):
                try:
                    parsed = json.loads(stripped)
                    if isinstance(parsed, list):
                        return parsed
                except json.JSONDecodeError:
                    pass
            return [item.strip() for item in stripped.split(',') if item.strip()]
        return value

    model_config = SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf-8',
        case_sensitive=False,
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
