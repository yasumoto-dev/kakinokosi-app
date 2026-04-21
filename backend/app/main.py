from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import rooms, posts

app = FastAPI()

# CORSエラー対策 : フロントエンドからの通信を許可
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.include_router(rooms.router)
app.include_router(posts.router)

@app.get("/")
@app.head("/") # uptimeRobotリクエスト用
async def root():
    return {"message": "カキノコシ API 起動中"}