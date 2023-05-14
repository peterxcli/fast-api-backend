from sqlalchemy import Column, Integer, String, Date, DateTime
from sqlalchemy.sql import func

from .base import Base
class User(Base):
    username = Column(String, primary_key=True)
    password = Column(String, nullable=False)
    birthday = Column(Date)
    create_time = Column(DateTime, default=func.now())
    last_login = Column(DateTime)
