from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routers import search_api # Import router search mới

app = FastAPI(title="TDTU Food AI Backend")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gắn Router vào App
app.include_router(search_api.router) # <-- Đăng ký ở đây
# app.include_router(admin.router)

@app.get("/")
def root():
    return {"message": "Server Python AI đang chạy!"}