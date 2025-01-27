from passlib.context import CryptContext
from api.config import db
from fastapi import Cookie


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

