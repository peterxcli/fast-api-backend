import uuid
import schemas
from app import APP
from fastapi import FastAPI
from tests import DEFAULT_USER, RequestBody, ResponseBody, assert_request

""" Test create user endpoint
@router post /user/
@status_code 201
@response_model schemas.User
@name user:create_user
"""

async def test_create_user_success(app: FastAPI):
    req = RequestBody(
        url=app.url_path_for(name="user:create_user"),
        body={"password": "test", "username": "test", "id": "c8763"},
    )
    resp = ResponseBody(
        status_code=201,
        body={
            "username": "test",
        },
    )
    await assert_request(app=APP, method="POST", req_body=req, resp_body=resp)


async def test_create_user_exists(app: FastAPI):
    req = RequestBody(
        url=app.url_path_for(name="user:create_user"),
        body=DEFAULT_USER.__dict__,
    )
    resp = ResponseBody(status_code=400, body={"detail": "User already exists"})
    await assert_request(app=APP, method="POST", req_body=req, resp_body=resp)


""" Test get user endpoint
@router get /user/
@status_code 200
@response_model schemas.UserWithoutPassword
@name user:get_user
"""


async def test_get_user_success(app: FastAPI):
    claims = {
        "id": DEFAULT_USER.id,
        "exp": 123,
    }
    req = RequestBody(url=app.url_path_for(name="user:get_user"), body={})
    resp = ResponseBody(status_code=200, body=DEFAULT_USER.dict())
    await assert_request(app=APP, method="GET", req_body=req, resp_body=resp, claims=claims)


async def test_get_user_none_exists(app: FastAPI):
    claims = {
        "id": "100",
        "name": DEFAULT_USER.username,
        "exp": 123,
    }
    req = RequestBody(url=app.url_path_for(name="user:get_user"), body={})
    resp = ResponseBody(status_code=404, body={"detail": "User not found"})
    await assert_request(
        app=APP, method="GET", req_body=req, resp_body=resp, claims=claims
    )


""" Test update user endpoint
@router put /user/
@status_code 200
@response_model schemas.UserWithoutPassword
@name user:update_user
"""


async def test_update_user_success(app: FastAPI):
    claims = {
        "id": DEFAULT_USER.id,
        "exp": 123,
    }
    req = RequestBody(
        url=app.url_path_for(name="user:update_user"),
        body={
            "username": "default1",
            "password": "test",
        },
    )
    resp = ResponseBody(
        status_code=200, body={"id": DEFAULT_USER.id, "username": "default1"}
    )
    await assert_request(app=APP, method="PUT", req_body=req, resp_body=resp, claims=claims)

async def test_update_user_with_existing_username(app: FastAPI):
    claims = {
        "id": DEFAULT_USER.id,
        "exp": 123,
    }
    req = RequestBody(
        url=app.url_path_for(name="user:update_user"),
        body={
            "username": "test",
            "password": "default",
        },
    )
    resp = ResponseBody(status_code=400, body={"detail": "Username already exists"})
    await test_create_user_success(app)
    await assert_request(app=APP, method="PUT", req_body=req, resp_body=resp, claims=claims)


""" Test delete user endpoint
@router delete /user/
@status_code 200
@response_model schemas.Msg
@name user:delete_user
"""

async def test_delete_user_success(app: FastAPI):
    claims = {
        "id": DEFAULT_USER.id,
        "exp": 123,
    }
    req = RequestBody(url=app.url_path_for(name="user:delete_user", user_id=DEFAULT_USER.id), body={})
    resp = ResponseBody(status_code=200, body={"detail": "OK"})
    await assert_request(app=APP, method="DELETE", req_body=req, resp_body=resp, claims=claims)

    # make sure user is deleted
    await test_get_user_none_exists(app)

async def test_delete_user_none_exists(app: FastAPI):
    id = uuid.uuid4().hex
    claims = {
        "id": id,
        "exp": 123,
    }
    req = RequestBody(
        url=app.url_path_for(name="user:delete_user", user_id=id), body={}
    )
    resp = ResponseBody(status_code=404, body={"detail": "User not found"})
    await assert_request(app=APP, method="DELETE", req_body=req, resp_body=resp, claims=claims)
