from sqlalchemy import Column, Date, DateTime, Integer, String
from sqlalchemy.sql import func

from .base import Base


class User(Base):
    username = Column(String, index=True, unique=True)
    password = Column(String, nullable=False)
    birthday = Column(Date)
    create_time = Column(DateTime, default=func.now())
    last_login = Column(DateTime)
