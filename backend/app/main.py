from fastapi import FastAPI
from app.database import engine, Base
from app.routers import rooms, posts

app = FastAPI()

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.include_router(rooms.router)
app.include_router(posts.router)

@app.get("/")
async def root():
    return {"message": "カキノコシ API 起動中"}