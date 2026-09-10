from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = 'yatraone-api'
    api_v1_prefix: str = '/api/v1'
    debug: bool = False
    database_url: str = Field(
        default='sqlite:///./yatraone.db',
        validation_alias='DATABASE_URL',
    )
    backend_cors_origins: list[str] = ['http://localhost:5173', 'http://127.0.0.1:5173']
    jwt_secret_key: str = Field(
        default='dev-jwt-secret-key-change-me',
        validation_alias='JWT_SECRET_KEY',
    )
    jwt_algorithm: str = Field(
        default='HS256',
        validation_alias='JWT_ALGORITHM',
    )
    jwt_access_token_expire_minutes: int = Field(
        default=60 * 24,
        validation_alias='JWT_ACCESS_TOKEN_EXPIRE_MINUTES',
    )

    model_config = SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf-8',
        case_sensitive=False,
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
