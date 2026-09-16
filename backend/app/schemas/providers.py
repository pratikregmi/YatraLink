from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models import ProviderCategory


class ProviderOnboardRequest(BaseModel):
    category: ProviderCategory
    bio: str = Field(min_length=20, max_length=2000)
    years_experience: int = Field(ge=0, le=80)
    daily_rate: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=2)


class ProviderResponse(BaseModel):
    id: int
    user_id: int
    category: ProviderCategory
    bio: str
    years_experience: int
    daily_rate: Decimal | None

    model_config = ConfigDict(from_attributes=True)
