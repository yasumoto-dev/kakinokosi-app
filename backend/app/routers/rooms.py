from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.database import get_db
from app.models import Room

router = APIRouter()


#リクエスト・レスポンス定義
class RoomCreateRequest(BaseModel):
    roomId: str
    roomName: str
    accessKey: str
    userUuid: str
    nickname: str

class RoomJoinRequest(BaseModel):
    accessKey: str

class RoomResponse(BaseModel):
    roomId: str
    roomName: str


# ルーム作成API
@router.post("/api/rooms", response_model=RoomResponse)     
async def create_room(req: RoomCreateRequest, db: AsyncSession = Depends(get_db)):

    # ルームID重複チェック
    result = await db.execute(select(Room).where(Room.room_id == req.roomId))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="そのルームIDはすでに使用されています")
    
    # アクセスキーの長さチェック
    if len(req.accessKey) < 4:
        raise HTTPException(status_code=400, detail="アクセスキーは４文字以内で入力してください")
    
    # ルーム作成
    room = Room(
        room_id=req.roomId,
        room_name=req.roomName,
        access_key=req.accessKey,
    )
    db.add(room)
    await db.commit()

    return RoomResponse(roomId=room.room_id, roomName=room.room_name)


# ルーム参加API
@router.post("/api/rooms/{roomId}/join", response_model=RoomResponse)
async def join_room(roomId: str, req: RoomJoinRequest, db: AsyncSession = Depends(get_db)):

    # ルーム存在チェック
    result = await db.execute(select(Room).where(Room.room_id == roomId))
    room = result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="ルームが存在しません")
    
    # アクセスキー照合
    if room.access_key != req.accessKey:
        raise HTTPException(status_code=401, detail="ルームIDまたはアクセスキーが正しくありません")
    
    return RoomResponse(roomId=room.room_id, roomName=room.room_name)

