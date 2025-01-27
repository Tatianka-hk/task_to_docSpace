from api.models import UserCreate
from api.config import db

async def get_user(email: str):
    return await db.users.find_one({"email": email})

async def create_user(user: UserCreate):
    hashed_password = pwd_context.hash(user.password)
    user_data = {"email": user.email, "hashed_password": hashed_password}
    await db.users.insert_one(user_data)
    return user_data
