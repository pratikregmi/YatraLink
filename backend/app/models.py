from sqlalchemy import Column, Integer

from app.database import Base


class HealthCheck(Base):
    __tablename__ = 'health_checks'

    id = Column(Integer, primary_key=True, index=True)
