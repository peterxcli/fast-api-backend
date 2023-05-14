import schemas
from deps import get_db
from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from repositories import user_repo
from sqlalchemy.ext.asyncio import AsyncSession
from utils import create_access_token, create_refresh_token

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


@router.post(
    "/",
    status_code=status.HTTP_200_OK,
    responses=USER_AUTH,
    response_model=schemas.AuthToken,
    name="auth:user_auth",
)
async def user_auth(
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

    # Create a response object
    response = JSONResponse(
        content={"access_token": access_token, "refresh_token": refresh_token}
    )

    # Set the JWT as a cookie
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,  # HttpOnly prevents the cookie from being accessed by client-side scripts, reducing risk of XSS attacks
        secure=True,  # Secure ensures the cookie is only sent over https
        samesite="strict",  # Strict SameSite cookies are only sent with same-site requests, reducing risk of CSRF attacks
    )

    # Set the refresh token as a cookie
    #FIXME: This is not working, because the set multiple set-cookie header is not allowed, need to find a way to set multiple cookies
    response.set_cookie(
        key="refresh_token",
        value=f"Bearer {refresh_token}",
        httponly=True,
        secure=True,
        samesite="strict",
    )
    return response

    return schemas.AuthToken(
        access_token=create_access_token(claims), token_type="bearer"
    )  # nosec


@router.post("/token/refresh")
async def refresh_token(refresh_token: str, db: AsyncSession = Depends(get_db)):
    user_id = await user_repo.validate_refresh_token(db, refresh_token)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    claims = {"id": user_id}
    new_access_token = create_access_token(claims)

    return {"access_token": new_access_token, "token_type": "bearer"}
