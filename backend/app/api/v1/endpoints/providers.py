from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user, get_db
from app.models import Provider, User, UserRole
from app.schemas.providers import ProviderOnboardRequest, ProviderResponse

router = APIRouter()


@router.post('/onboard', response_model=ProviderResponse, status_code=status.HTTP_201_CREATED)
def onboard_provider(
    payload: ProviderOnboardRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Provider:
    existing_profile = db.query(Provider).filter(Provider.user_id == current_user.id).first()
    if existing_profile is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail='Provider profile already exists',
        )

    provider = Provider(
        user_id=current_user.id,
        category=payload.category,
        bio=payload.bio.strip(),
        years_experience=payload.years_experience,
        daily_rate=payload.daily_rate,
    )
    current_user.role = UserRole.PROVIDER
    db.add(provider)
    db.commit()
    db.refresh(provider)
    return provider


@router.get('/me', response_model=ProviderResponse)
def get_my_provider_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Provider:
    provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
    if provider is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Provider profile not found',
        )
    return provider
