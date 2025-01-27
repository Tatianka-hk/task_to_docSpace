from api.models import UserCreate
from api.config import db

async def get_user(email: str):
    user = await db.users.find_one({"email": email})
    return user

async def create_user(user: UserCreate):
    hashed_password = pwd_context.hash(user.password)
    user_data = {"email": user.email, "hashed_password": hashed_password}
    await db.users.insert_one(user_data)
    return user_data
