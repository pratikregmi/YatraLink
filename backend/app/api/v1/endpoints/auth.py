import hashlib
from datetime import datetime, timedelta, timezone
from typing import Annotated
from uuid import uuid4

import jwt
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext
from pydantic import BaseModel, ConfigDict, EmailStr, field_validator
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import SessionLocal
from app.models import RefreshToken, User

settings = get_settings()
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
security = HTTPBearer(auto_error=False)
router = APIRouter()


class SignupRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    password_confirmation: str

    @field_validator('full_name')
    @classmethod
    def validate_full_name(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError('Full name is required')
        return cleaned

    @field_validator('password')
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(char.isupper() for char in value):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(char.isdigit() for char in value):
            raise ValueError('Password must contain at least one number')
        if not any(char in '!@#$%^&*()_+-=[]{}|;:,.<>?~' for char in value):
            raise ValueError('Password must contain at least one special character')
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def verify_password(plain_password: str, password_hash: str) -> bool:
    return pwd_context.verify(plain_password, password_hash)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode('utf-8')).hexdigest()


def to_utc_datetime(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    issued_at = datetime.now(timezone.utc)
    expire = issued_at + (expires_delta or timedelta(minutes=settings.jwt_access_token_expire_minutes))
    payload = {'sub': subject, 'type': 'access', 'iat': issued_at, 'jti': uuid4().hex, 'exp': expire}
    return jwt.encode(payload, settings.jwt_access_token_secret_key, algorithm=settings.jwt_algorithm)


def create_refresh_token(subject: str, expires_delta: timedelta | None = None) -> str:
    issued_at = datetime.now(timezone.utc)
    expire = issued_at + (expires_delta or timedelta(days=settings.jwt_refresh_token_expire_days))
    payload = {'sub': subject, 'type': 'refresh', 'iat': issued_at, 'jti': uuid4().hex, 'exp': expire}
    return jwt.encode(payload, settings.jwt_refresh_token_secret_key, algorithm=settings.jwt_algorithm)


def set_refresh_cookie(response: Response, refresh_token: str) -> None:
    response.set_cookie(
        key='refresh_token',
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite='lax',
        path='/',
        max_age=settings.jwt_refresh_token_expire_days * 24 * 60 * 60,
    )


def revoke_refresh_token(db: Session, refresh_token: str) -> bool:
    if not refresh_token:
        return False

    token_hash = hash_refresh_token(refresh_token)
    record = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
    if record is None:
        return False
    if record.revoked_at is None:
        record.revoked_at = datetime.now(timezone.utc)
    db.commit()
    return True


def get_user_by_email(db: Session, email: str) -> User | None:
    normalized_email = email.strip().lower()
    return db.query(User).filter(User.email == normalized_email).first()


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    db: Session = Depends(get_db),
) -> User:
    if credentials is None or not credentials.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Not authenticated')

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            settings.jwt_access_token_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        user_id = payload.get('sub')
        if payload.get('type') != 'access':
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token type')
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token')
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid or expired token') from exc

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='User not found')
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Account is inactive')
    return user


def require_role(role: str):
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role != role:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Not authorized')
        return current_user

    return dependency


def create_user_for_role(payload: SignupRequest, db: Session, role: str) -> User:
    if payload.password != payload.password_confirmation:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Password confirmation does not match')

    normalized_email = payload.email.strip().lower()
    if get_user_by_email(db, normalized_email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Email already exists')

    user = User(
        full_name=payload.full_name.strip(),
        email=normalized_email,
        password_hash=hash_password(payload.password),
        role=role,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post('/tourist/signup', response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup_tourist(payload: SignupRequest, db: Session = Depends(get_db)) -> User:
    return create_user_for_role(payload=payload, db=db, role='TOURIST')


@router.post('/guide/signup', response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup_guide(payload: SignupRequest, db: Session = Depends(get_db)) -> User:
    return create_user_for_role(payload=payload, db=db, role='LOCAL_GUIDE')


def login_user_by_role(payload: LoginRequest, db: Session, role: str | None = None, response: Response | None = None) -> dict[str, str]:
    user = get_user_by_email(db, payload.email)
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid email or password')

    if role is not None and user.role != role:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid role or credentials')

    for token_record in db.query(RefreshToken).filter(
        RefreshToken.user_id == user.id,
        RefreshToken.revoked_at.is_(None),
        RefreshToken.expires_at > datetime.now(timezone.utc),
    ).all():
        token_record.revoked_at = datetime.now(timezone.utc)

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))
    refresh_expires_at = datetime.now(timezone.utc) + timedelta(days=settings.jwt_refresh_token_expire_days)
    refresh_token_hash = hash_refresh_token(refresh_token)
    db.add(RefreshToken(user_id=user.id, token_hash=refresh_token_hash, expires_at=refresh_expires_at))
    db.commit()

    if response is not None:
        set_refresh_cookie(response, refresh_token)

    return {'access_token': access_token, 'token_type': 'bearer'}


@router.post('/tourist/login', response_model=TokenResponse)
def login_tourist(payload: LoginRequest, response: Response, db: Session = Depends(get_db)) -> dict[str, str]:
    return login_user_by_role(payload=payload, db=db, role='TOURIST', response=response)


@router.post('/guide/login', response_model=TokenResponse)
def login_guide(payload: LoginRequest, response: Response, db: Session = Depends(get_db)) -> dict[str, str]:
    return login_user_by_role(payload=payload, db=db, role='LOCAL_GUIDE', response=response)


@router.post('/refresh', response_model=TokenResponse)
def refresh_access_token(
    request: Request,
    response: Response,
    refresh_token: str | None = None,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    token_value = refresh_token or request.cookies.get('refresh_token')

    if token_value is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Refresh token missing')

    try:
        payload = jwt.decode(
            token_value,
            settings.jwt_refresh_token_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        if payload.get('type') != 'refresh':
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid refresh token type')
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid or expired refresh token') from exc

    user_id = payload.get('sub')
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid refresh token')

    token_hash = hash_refresh_token(token_value)
    stored_refresh = db.query(RefreshToken).filter(
        RefreshToken.token_hash == token_hash,
        RefreshToken.user_id == int(user_id),
    ).first()

    if stored_refresh is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Refresh token not found')
    if to_utc_datetime(stored_refresh.revoked_at) is not None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Refresh token revoked')
    expires_at = to_utc_datetime(stored_refresh.expires_at)
    if expires_at is None or expires_at <= datetime.now(timezone.utc):
        stored_refresh.revoked_at = datetime.now(timezone.utc)
        db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Refresh token expired')

    user = db.query(User).filter(User.id == int(user_id), User.is_active.is_(True)).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='User not found')

    new_access_token = create_access_token(str(user.id))
    return {'access_token': new_access_token, 'token_type': 'bearer'}


@router.post('/logout')
def logout_user(
    request: Request,
    response: Response,
    refresh_token: str | None = None,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    token_value = refresh_token or request.cookies.get('refresh_token')
    if token_value:
        revoke_refresh_token(db, token_value)

    response.delete_cookie(key='refresh_token', path='/')
    return {'detail': 'Logged out successfully'}


@router.post('/signup', response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)) -> User:
    return signup_tourist(payload=payload, db=db)


@router.post('/login', response_model=TokenResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)) -> dict[str, str]:
    return login_tourist(payload=payload, db=db, response=response)


@router.get('/me', response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user
