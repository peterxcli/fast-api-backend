from typing import List, Union
from deps import get_current_user, get_current_user_insecure
import schemas
from typing_extensions import Annotated
from deps import get_db
from fastapi import APIRouter, Depends, HTTPException, Header, Response, status, Request
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from repositories import user_repo
from sqlalchemy.ext.asyncio import AsyncSession
from utils import create_access_token, create_refresh_token
import secrets

router = APIRouter()

USER_AUTH = {
    200: {
        "description": "User authenticated successfully",
        "content": {"json": {"access_token": "token", "token_type": "bearer"}},
    },
    401: {
        "description": "Incorrect email or password",
        "content": {"json": {"detail": "Incorrect email or password"}},
    },
}

@router.get("/user", response_model=schemas.UserWithToken)
async def get_user(
    response: Response,
    user: schemas.UserWithoutPassword = Depends(get_current_user_insecure),
):
    csrf_token = secrets.token_urlsafe(32)
    response.set_cookie(
        key="csrf_token",
        value=f"{csrf_token}",
        httponly=True,
        secure=True,
    )
    user.csrf_token = csrf_token
    return user


@router.post(
    "/token",
    status_code=status.HTTP_200_OK,
    responses=USER_AUTH,
    # response_model=schemas.AuthToken,
    name="auth:user_auth",
)
async def user_auth(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    user = await user_repo.authenticate(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    claims = {"id": user.id}
    access_token = create_access_token(claims)
    refresh_token = create_refresh_token(claims)
    csrf_token = secrets.token_urlsafe(32)

    # Set the JWT as a cookie
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        secure=True,
    )
    response.set_cookie(
        key="refresh_token",
        value=f"Bearer {refresh_token}",
        httponly=True,
        secure=True,
        samesite="strict",
    )
    return {
            "access_token": access_token,
            "refresh_token": refresh_token,
        }


@router.post("/token/refresh")
async def refresh_token(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    refresh_token = request.cookies["refresh_token"].split(" ")[1]
    print(refresh_token)
    user_id = await user_repo.validate_refresh_token(refresh_token)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    claims = {"id": user_id}
    new_access_token = create_access_token(claims)
    new_refresh_token = create_refresh_token(claims)
    response.set_cookie(
        key="access_token",
        value=f"Bearer {new_access_token}",
        httponly=True,
        secure=True,
    )
    response.set_cookie(
        key="refresh_token",
        value=f"Bearer {new_refresh_token}",
        httponly=True,
        secure=True,
        samesite="strict",
    )

    return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
        }

@router.post("/logout")
async def refresh_token(response: Response, db: AsyncSession = Depends(get_db)):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    response.delete_cookie("csrf_token")
    return {"message": "Logout successful"}