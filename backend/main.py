from fastapi import FastAPI, HTTPException,Depends, Response, Cookie
from fastapi.middleware.cors import CORSMiddleware
from models import UserCreate, UserLogin, PasswordReset
from crud import create_user, get_user
from auth import pwd_context
import secrets
from dotenv import load_dotenv
from config import db
from typing import Optional
load_dotenv()
from http import cookies
app = FastAPI()
origins = ['http://localhost:3000', 'http://127.0.0.1:3000',
           'https://localhost:3000', 'https://127.0.0.1:3000'] 
# Налаштування CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def get_current_user(session_token: Optional[str] = Cookie(None)):
    print(f"Cookie: {session_token}") 
    if not session_token:
        return None
    print(f"Session Token: {session_token}")  # Логування для відлагодження
    user_session = await db.sessions.find_one({"session_token": session_token})
    if user_session:
        user = await db.users.find_one({"email": user_session["email"]})
        return user  # Повертаємо саму інформацію про користувача, а не лише токен
    return None

# Маршрути
@app.post("/api/register")
async def register(user: UserCreate):
    print('register')
    existing_user = await get_user(user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    await create_user(user)
    return {"status": "success", "message": "User registered successfully"}

@app.post("/api/login")
async def login(user: UserLogin, response: Response):
    db_user = await get_user(user.email)
    if not db_user or not pwd_context.verify(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    print("all are valid")
    session_token = secrets.token_urlsafe(32)
    print(f"SS: {session_token} ")
    await db.sessions.insert_one({"email": user.email, "session_token": session_token})
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        max_age=3600  # 1 hour
    )
    print(f"Session Token Set: {session_token}") 
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
