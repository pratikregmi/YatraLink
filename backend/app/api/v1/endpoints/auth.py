from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext
from pydantic import BaseModel, ConfigDict, EmailStr, field_validator
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import SessionLocal
from app.models import User

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


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.jwt_access_token_expire_minutes)
    )
    payload = {'sub': subject, 'exp': expire}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


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
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        user_id = payload.get('sub')
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


def login_user_by_role(payload: LoginRequest, db: Session, role: str | None = None) -> dict[str, str]:
    user = get_user_by_email(db, payload.email)
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid email or password')

    if role is not None and user.role != role:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid role or credentials')

    token = create_access_token(str(user.id))
    return {'access_token': token, 'token_type': 'bearer'}


@router.post('/tourist/login', response_model=TokenResponse)
def login_tourist(payload: LoginRequest, db: Session = Depends(get_db)) -> dict[str, str]:
    return login_user_by_role(payload=payload, db=db, role='TOURIST')


@router.post('/guide/login', response_model=TokenResponse)
def login_guide(payload: LoginRequest, db: Session = Depends(get_db)) -> dict[str, str]:
    return login_user_by_role(payload=payload, db=db, role='LOCAL_GUIDE')


@router.post('/signup', response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)) -> User:
    return signup_tourist(payload=payload, db=db)


@router.post('/login', response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> dict[str, str]:
    return login_tourist(payload=payload, db=db)


@router.get('/me', response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user
