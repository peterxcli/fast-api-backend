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
