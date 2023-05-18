from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


# Shared properties
class UserBase(BaseModel):
    id: Optional[str] = Field(None)
    username: Optional[str] = Field(None)
    password: Optional[str] = Field(None)
    birthday: Optional[date] = Field(None)
    last_login: Optional[datetime] = Field(None)


"""
CRUD schemas for User
"""


# Properties to receive on user creation
class UserCreate(UserBase):
    class Config:
        fields = {"last_login": {"exclude": True}}


# Properties to receive on user update
class UserUpdate(BaseModel):
    password: Optional[str] = Field(None)
    birthday: Optional[date] = Field(None)
    pass


"""
Database schemas for User
"""


# Shared properties
class UserDB(UserBase):
    id: str

    class Config:
        orm_mode = True


# Properties to return to client
class User(UserDB):
    pass


class UserWithoutPassword(UserDB):
    class Config:
        fields = {"password": {"exclude": True}}

class UserWithToken(UserWithoutPassword):
    csrf_token: Optional[str] = Field(None)
    class Config:
        pass
