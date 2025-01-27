from passlib.context import CryptContext
from fastapi import Cookie


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

