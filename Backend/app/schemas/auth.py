from pydantic import BaseModel

class SIGNUP_SCHEMA(BaseModel):
    firstName: str
    lastName: str
    email: str
    password: str

class LOGIN_SCHEMA(BaseModel):
    email: str
    password: str

class VERIFY_LOGIN_SCHEMA(BaseModel):
    email: str
    otp: str

class FORGET_PASSWORD_INITIATE_SCHEMA(BaseModel):
    email: str

class FORGET_PASSWORD_VERIFY_SCHEMA(BaseModel):
    email: str
    otp: str
    new_password: str