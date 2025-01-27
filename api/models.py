from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PasswordReset(BaseModel):
    email: EmailStr

class DataItem(BaseModel):
    name: str
    category: str
    value: float
    date: str

class DataItemCreate(DataItem):
    pass

class DataItemUpdate(DataItem):
    pass