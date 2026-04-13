from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"status": "ok"}

@app.post("/api/rooms")
def create_room():
    return {"message": "Room created successfully"}