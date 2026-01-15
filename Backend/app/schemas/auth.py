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
    user_id: str
    otp: str