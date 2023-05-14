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

    async def validate_refresh_token(refresh_token: str):
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

    async def update_multiple_field(
        self, db: AsyncSession, user: UserUpdate, db_obj: User
    ) -> User:
        # Hash the new password if it's provided
        if user.new_password:
            user.new_password = self._get_hash_password(user.new_password)

        # Update the fields in db_obj with those from the user object
        for field in user.dict(exclude_unset=True):
            if field == "password":
                # Check if the old password matches
                if (
                    user.password
                    and self._get_hash_password(user.password) != db_obj.password
                ):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST, detail="Wrong password"
                    )
                elif user.new_password:
                    # If a new password has been provided, update the password
                    setattr(db_obj, field, user.new_password)
            else:
                # For any field other than 'password', just update the value
                setattr(db_obj, field, getattr(user, field))

        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(self, db: AsyncSession, user: UserUpdate, db_obj: User) -> User:
        # TODO: let this user update function can handle multiple fields update, there is only password update in this function
        # Check password
        user.password = self._get_hash_password(user.password)
        if not user.password == db_obj.password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Wrong password"
            )

        # Update data
        user.password = self._get_hash_password(user.new_password)
        for field in user.dict():
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
