import binascii
import os

from sqlalchemy import Boolean, Column, DateTime, Integer, String, func
from sqlalchemy.ext.declarative import as_declarative, declared_attr

"""
Base class for all models.
"""


def generate_id():
    return binascii.hexlify(os.urandom(16)).decode()


@as_declarative()
class Base:
    id: Column = Column(String, primary_key=True, default=generate_id)
    deleted: Column = Column(Boolean, default=False)
    created_at: Column = Column(DateTime(timezone=True), default=func.now())
    update_at: Column = Column(
        DateTime(timezone=True), default=func.now(), onupdate=func.now()
    )

    __name__: str

    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower()
