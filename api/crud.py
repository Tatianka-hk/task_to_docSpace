from api.models import UserCreate
from api.config import get_database
from api.auth import pwd_context
async def get_user(email: str):
    db = await get_database()
    user = await db.users.find_one({"email": email})
    return user

async def create_user(user: UserCreate):
    db = await get_database()
    hashed_password = pwd_context.hash(user.password)
    user_data = {"email": user.email, "hashed_password": hashed_password}
    await db.users.insert_one(user_data)
    return user_data
