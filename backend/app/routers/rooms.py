from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from app.database import get_db
from app.models import Room, RoomMember

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
    userUuid: str
    nickname: str

class RoomResponse(BaseModel):
    roomId: str
    roomName: str
    participantCount: int


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
    await db.flush()

    # 作成者を参加者として登録
    member = RoomMember(
        room_id=room.id,
        user_uuid=req.userUuid,
        nickname=req.nickname,
    )
    db.add(member)
    await db.commit()

    return RoomResponse(roomId=room.room_id, roomName=room.room_name, participantCount=1)


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
    
    # 参加人数チェック
    count_result = await db.execute(
        select(func.count()).where(RoomMember.room_id == room.id)
    )
    count = count_result.scalar()
    if count >= 2:
        raise HTTPException(status_code=409, detail="このルームにはこれ以上参加できません")
    
    # すでに参加済みかチェック
    member_result = await db.execute(
        select(RoomMember).where(
            RoomMember.room_id == room.id,
            RoomMember.user_uuid == req.userUuid
        )
    )
    if member_result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="すでにこのルームに参加しています")
    
    # 参加者登録
    member = RoomMember(
        room_id=room.id,
        user_uuid=req.userUuid,
        nickname=req.nickname, 
    )
    db.add(member)
    await db.commit()

    return RoomResponse(roomId=room.room_id, roomName=room.room_name, participantCount=count + 1)

