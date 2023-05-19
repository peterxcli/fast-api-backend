# glsoft fast api

## password

| username   | salt | hash |
| ----------- | ----------- | ----  |
| peter      | rfefefefee       | sskglmalglkm |

**Password**: The user-provided secret string.

**↓**

**Hash Function**: A function used to convert the password into a unique hash.

**↓**

**Salt**: Random data that is used as an additional input to the hash function to protect the password.

**↓**

**Concatenate password and salt**:

## bug

### multiple set-cookie header

<https://stackoverflow.com/a/18967872>

### rewrite Oauth2PasswordBearer with a custom method

<https://www.fastapitutorial.com/blog/fastapi-jwt-httponly-cookie/>

### Double Submit Cookie to prevent CSRF

<https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#double-submit-cookie>

## TO-DO

- [ ] unit test
