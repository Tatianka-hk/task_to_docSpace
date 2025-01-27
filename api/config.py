import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
async def get_database():
    client = AsyncIOMotorClient(MONGO_URL)
    return client.your_database_name