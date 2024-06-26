from typing import Any, Dict

import pytest
from config import settings
from fastapi import FastAPI
from httpx import Response
from jose import jwt
from tests import DEFAULT_USER, RequestBody, ResponseBody, assert_request

""" Test user authentication endpoint
@router post /auth/
@status_code 200
@response_model schemas.Token
@name auth:user_auth
"""


def _test_user_auth_success_assert(resp: Response, expected_resp: ResponseBody):
    body = resp.json()
    payload: Dict[str, Any] = jwt.decode(
        body["access_token"],
        settings.ACCESS_TOKEN_SECRET_KEY,
        algorithms=[settings.ACCESS_TOKEN_ALGORITHM],
    )

    assert resp.status_code == expected_resp.status_code
    assert payload["id"] == DEFAULT_USER.id


async def test_user_auth_success(app: FastAPI):
    req = RequestBody(
        url=app.url_path_for(name="auth:user_auth"),
        body={},
    )
    resp = ResponseBody(status_code=200, body={"token_type": "bearer"})
    await assert_request(
        app=app,
        method="POST",
        req_body=req,
        resp_body=resp,
        assert_func=_test_user_auth_success_assert,
        data={
            "grant_type": "",
            "username": DEFAULT_USER.username,
            "password": DEFAULT_USER.password,
            "scope": "",
            "client_id": "",
            "client_secret": "",
        },
    )


@pytest.mark.parametrize(
    "data",
    [
        {
            "grant_type": "",
            "username": DEFAULT_USER.username,
            "password": "meow",
            "scope": "",
            "client_id": "",
            "client_secret": "",
        },
        {
            "grant_type": "",
            "username": "meow@gmail.com",
            "password": DEFAULT_USER.password,
            "scope": "",
            "client_id": "",
            "client_secret": "",
        },
    ],
)
async def test_user_auth_invalid_email_or_password(app: FastAPI, data: Dict[str, Any]):
    req = RequestBody(
        url=app.url_path_for(name="auth:user_auth"),
        body={},
    )
    resp = ResponseBody(status_code=401, body={"detail": "Incorrect email or password"})
    await assert_request(
        app=app,
        method="POST",
        req_body=req,
        resp_body=resp,
        data=data,
    )
