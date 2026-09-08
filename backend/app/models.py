from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer, String, func

from app.database import Base


class HealthCheck(Base):
    __tablename__ = 'health_checks'

    id = Column(Integer, primary_key=True, index=True)


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default='tourist')
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        default=lambda: datetime.now(timezone.utc),
    )
