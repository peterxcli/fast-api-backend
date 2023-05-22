from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from config import settings
from fastapi import HTTPException, Request, status
from fastapi.openapi.models import OAuthFlows as OAuthFlowsModel
from fastapi.security import OAuth2
from fastapi.security.utils import get_authorization_scheme_param
from jose import jwt


def create_access_token(claims: Dict[str, Any]) -> str:
    expires = datetime.utcnow() + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    claims.update({"exp": expires})
    return jwt.encode(
        claims,
        settings.ACCESS_TOKEN_SECRET_KEY,
        algorithm=settings.ACCESS_TOKEN_ALGORITHM,
    )


def create_refresh_token(claims: Dict[str, Any]) -> str:
    expires = datetime.utcnow() + timedelta(
        minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES
    )
    claims.update({"exp": expires})
    return jwt.encode(
        claims,
        settings.REFRESH_TOKEN_SECRET_KEY,
        algorithm=settings.ACCESS_TOKEN_ALGORITHM,
    )


def getAuthorizationHeader(request: Request) -> Optional[str]:
    authorization: str = request.headers.get("Authorization")
    scheme, param = get_authorization_scheme_param(authorization)
    print("authorization is none", scheme, param)
    if not authorization or scheme.lower() != "bearer" or param == "null":
        print("authorization is none")
        return None
    return param


class OAuth2PasswordBearerWithCookie(OAuth2):
    def __init__(
        self,
        tokenUrl: str,
        scheme_name: Optional[str] = None,
        scopes: Optional[Dict[str, str]] = None,
        auto_error: bool = True,
        csrf_enable: bool = True,
    ):
        if not scopes:
            scopes = {}
        flows = OAuthFlowsModel(password={"tokenUrl": tokenUrl, "scopes": scopes})
        super().__init__(flows=flows, scheme_name=scheme_name, auto_error=auto_error)
        self.csrf_enable = csrf_enable

    async def __call__(self, request: Request) -> Optional[str]:
        token = getAuthorizationHeader(request)
        if token:
            return token
        authorization: str = request.cookies.get(
            "access_token"
        )  # changed to accept access token from httpOnly Cookie
        csrf_token_from_http_only_cookie: str = request.cookies.get("csrf_token")
        csrf_token_from_header: str = request.headers.get("csrf_token")
        print("access_token is", authorization)

        scheme, param = get_authorization_scheme_param(authorization)
        if self.csrf_enable and (
            csrf_token_from_header != csrf_token_from_http_only_cookie
            or csrf_token_from_header == None
            or csrf_token_from_http_only_cookie == None
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="CSRF token is invalid",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not authorization or scheme.lower() != "bearer":
            if self.auto_error:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Not authenticated",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            else:
                return None
        return param
