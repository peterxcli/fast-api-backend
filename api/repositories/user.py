import hashlib
from typing import Optional

from config import settings
from fastapi import HTTPException, status
from jose import JWTError, jwt
from schemas.user import User, UserCreate, UserUpdate
from sqlalchemy import false
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from .base import BaseRepository


class UserRepository(BaseRepository[User, UserCreate, UserUpdate]):
    def _get_hash_password(self, password: str) -> str:
        salt_pass = "".join([password, settings.SALT])
        return hashlib.sha256(salt_pass.encode()).hexdigest()

    async def validate_refresh_token(self, refresh_token: str):
        try:
            # Decode the token
            payload = jwt.decode(
                refresh_token,
                settings.REFRESH_TOKEN_SECRET_KEY,
                algorithms=[settings.ACCESS_TOKEN_ALGORITHM],
            )
            # If decoding is successful and the token has not expired, return the user ID
            return payload.get("id")
        except JWTError:
            # If there was an error decoding the token (e.g. it was tampered with, or it's expired), return None
            return None

    async def create(self, db: AsyncSession, user: UserCreate) -> User:
        user.password = self._get_hash_password(user.password)
        db_obj = self.model(**user.dict())
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        result = await db.execute(
            select(self.model).where(
                self.model.email == email and self.model.deleted == false()
            )
        )
        return result.scalars().first()

    async def get_by_username(self, db: AsyncSession, username: str) -> Optional[User]:
        result = await db.execute(
            select(self.model).where(
                self.model.username == username and self.model.deleted == false()
            )
        )
        return result.scalars().first()

    async def update(self, db: AsyncSession, user: UserUpdate, db_obj: User) -> User:
        # delattr(user, "password") # remove password from user update
        if user.password:
            user.password = self._get_hash_password(user.password)

        # Update data
        for field in user.dict(exclude_unset=True):
            print(field, getattr(user, field))
            setattr(db_obj, field, getattr(user, field))
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def authenticate(
        self, db: AsyncSession, username: str, password: str
    ) -> Optional[User]:
        # Check if user exists
        user = await self.get_by_username(db, username)
        if not user:
            return None
        # Check if password is correct
        password = self._get_hash_password(password)
        if password != user.password:
            return None
        from sqlalchemy.sql import func

        user.last_login = func.now()
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user
