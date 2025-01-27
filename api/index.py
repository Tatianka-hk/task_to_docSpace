from fastapi import FastAPI, HTTPException,Depends, Response, Cookie
from fastapi.middleware.cors import CORSMiddleware
from api.models import UserCreate, UserLogin, PasswordReset, DataItemCreate, DataItemUpdate, DataItem
from api.crud import create_user, get_user
from api.auth import pwd_context
import secrets
from dotenv import load_dotenv
from api.config import get_database
from typing import Optional
from bson import ObjectId

from http import cookies
app = FastAPI()

# Налаштування CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def get_current_user(session_token: Optional[str] = Cookie(None)):
    db = await get_database()
    if not session_token:
        return None
    user_session = await db.sessions.find_one({"session_token": session_token})
    if user_session:
        user = await db.users.find_one({"email": user_session["email"]})
        return user  
    return None

# Маршрути
@app.post("/api/register")
async def register(user: UserCreate):
    existing_user = await get_user(user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    await create_user(user)
    return {"status": "success", "message": "User registered successfully"}

@app.post("/api/login")
async def login(user: UserLogin, response: Response):
    db = await get_database()
    db_user = await get_user(user.email)
    if not db_user or not pwd_context.verify(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    session_token = secrets.token_urlsafe(32)
    await db.sessions.insert_one({"email": user.email, "session_token": session_token})
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=False, 
        samesite="lax",
        max_age=3600  
    )
    return {"status": "success", "message": "Login successful"}

@app.post("/api/reset-password")
async def reset_password(reset_data: PasswordReset):
    user = await get_user(reset_data.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"status": "success", "message": "Password reset link sent to email"}



@app.post("/api/logout")
async def logout(response: Response, current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    await db.sessions.delete_one({"email": current_user["email"]})
    response.delete_cookie(key="session_token")
    return {"status": "success", "message": "Logout successful"}

@app.get("/api/user")
async def get_user_info(current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {"status": "success", "user": current_user["email"]}

@app.get("/api/data")
async def get_data(current_user: dict = Depends(get_current_user)):
    db = await get_database()
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    data = await db.user_data.find({"user_email": current_user["email"]}).to_list(1000)
    return [{"id": str(item["_id"]), **{k: v for k, v in item.items() if k != "_id" and k != "user_email"}} for item in data]

@app.post("/api/data")
async def create_data(item: DataItemCreate, current_user: dict = Depends(get_current_user)):
    db = await get_database()
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    new_item = item.dict()
    new_item["user_email"] = current_user["email"]
    result = await db.user_data.insert_one(new_item)
    created_item = await db.user_data.find_one({"_id": result.inserted_id})
    return {"id": str(created_item["_id"]), **{k: v for k, v in created_item.items() if k != "_id" and k != "user_email"}}

@app.put("/api/data/{item_id}")
async def update_data(item_id: str, item: DataItemUpdate, current_user: dict = Depends(get_current_user)):
    db = await get_database()
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    updated_item = await db.user_data.find_one_and_update(
        {"_id": ObjectId(item_id), "user_email": current_user["email"]},
        {"$set": item.dict()},
        return_document=True
    )
    if updated_item:
        return {"id": str(updated_item["_id"]), **{k: v for k, v in updated_item.items() if k != "_id" and k != "user_email"}}
    raise HTTPException(status_code=404, detail="Item not found")

@app.delete("/api/data/{item_id}")
async def delete_data(item_id: str, current_user: dict = Depends(get_current_user)):
    db = await get_database()
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    delete_result = await db.user_data.delete_one({"_id": ObjectId(item_id), "user_email": current_user["email"]})
    if delete_result.deleted_count:
        return {"status": "success", "message": "Item deleted successfully"}
    raise HTTPException(status_code=404, detail="Item not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
