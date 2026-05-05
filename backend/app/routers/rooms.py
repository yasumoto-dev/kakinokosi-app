from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
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

class RoomResponse(BaseModel):
    roomId: str
    roomName: str

class UserRoomItem(BaseModel):
    roomId: str
    roomName: str
    joinedAt: str


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

    # 作成者をroom_membersに登録
    member = RoomMember(room_id=room.id, user_uuid=req.userUuid)
    db.add(member)
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
    
    # room_membersに登録
    existing = await db.execute(
        select(RoomMember).where(
            RoomMember.room_id == room.id,
            RoomMember.user_uuid == req.userUuid
        )
    )
    if not existing.scalar_one_or_none():
        member = RoomMember(room_id=room.id, user_uuid=req.userUuid)
        db.add(member)
        await db.commit()
    
    return RoomResponse(roomId=room.room_id, roomName=room.room_name)


# 参加済みルーム一覧取得API
@router.get("/api/users/{userUuid}/rooms", response_model=list[UserRoomItem])
async def get_user_rooms(userUuid: str, db: AsyncSession = Depends(get_db)):

    result = await db.execute(
        select(RoomMember, Room)
        .join(Room, RoomMember.room_id == Room.id)
        .where(RoomMember.user_uuid == userUuid)
        .order_by(RoomMember.joined_at.desc())
    )
    rows = result.all()

    return [
        UserRoomItem(
            roomId=room.room_id, # Roomモデルから取得
            roomName=room.room_name, # Roomモデルから取得
            joinedAt=member.joined_at.isoformat() # RoomMemberモデルから取得
        )
        for member, room in rows
    ]
