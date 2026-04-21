from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
from app.database import get_db
from app.models import Post, Room, RoomMember

router = APIRouter()

JST = timezone(timedelta(hours=9))


#リクエスト・レスポンス定義
class PostCreateRequest(BaseModel):
    userUuid: str
    nickname: str
    moodColor: str
    emotionTag: str | None = None
    text: str
    publishTiming: str # "immediate" | "today_22" | "tomorrow_10"

class PostResponse(BaseModel):
    postId: str
    isPublished: bool
    publishedAt: str

class PostItem(BaseModel):
    postId: str
    nickname: str
    moodColor: str
    emotionTag: str | None
    text: str
    publishedAt: str
    updatedAt: str

class PostListResponse(BaseModel):
    roomId: str
    roomName: str
    publishedPosts: list[PostItem]


def calc_publish_at(timing: str) -> datetime:
    now = datetime.now(JST)
    if timing == "immediate":
        result = now
    elif timing == "today_22":
        result = now.replace(hour=22, minute=0, second=0, microsecond=0)
    elif timing == "tomorrow_10":
        tomorrow = now + timedelta(days=1)
        result = tomorrow.replace(hour=10, minute=0, second=0, microsecond=0)
    else:
        raise ValueError("不正な公開タイミングです")
    
    # タイムゾーン情報を除去してUTCに変換して返す
    return result.astimezone(timezone.utc).replace(tzinfo=None)


# 投稿作成API
@router.post("/api/rooms/{roomId}/posts", response_model=PostResponse)
async def create_post(roomId: str, req: PostCreateRequest, db: AsyncSession = Depends(get_db)):

    # ルーム存在チェック
    result = await db.execute(select(Room).where(Room.room_id == roomId))
    room = result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="ルームが存在しません")

    # 参加者チェック
    member_result = await db.execute(
        select(RoomMember).where(
              RoomMember.room_id == room.id,
              RoomMember.user_uuid == req.userUuid
        )
    )       
    if not member_result.scalar_one_or_none:
        raise HTTPException(status_code=401, detail="このルームに参加していません")
      
    # 文字数チェック
    if len(req.text) > 400:
      raise HTTPException(status_code=400, detail="本文は400字以内で入力してください")

    # 公開日時の計算
    try:
        publish_at = calc_publish_at(req.publishTiming)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # 投稿保存
    post = Post(
        room_id=room.id,
        user_uuid=req.userUuid,
        nickname=req.nickname,
        mood_color=req.moodColor,
        emotion_tag=req.emotionTag,
        text=req.text,
        publish_at=publish_at,
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)

    is_published = publish_at <= datetime.utcnow()

    return PostResponse(
        postId=str(post.id),
        isPublished=is_published,
        publishAt=post.publish_at.isoformat(),
    )


# 投稿一覧取得API
@router.get("/api/rooms/{roomId}/posts", response_model=PostListResponse)
async def get_posts(roomId: str, db: AsyncSession = Depends(get_db)):

    # ルーム存在チェック
    result = await db.execute(select(Room).where(Room.room_id == roomId))
    room = result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="ルームが存在しません")
    
    # 公開済みの投稿を取得
    now = datetime.now(JST)
    posts_result =  await db.execute(
        select(Post)
        .where(Post.room_id == room.id, Post.publish_at <= now)
        .order_by(Post.publish_at.desc())
    )
    posts = posts_result.scalars().all()

    published_posts = [
        PostItem(
            postId=str(post.id),
            nickname=post.nickname,
            moodColor=post.mood_color,
            emotionTag=post.emotion_tag,
            text=post.text,
            publishedAt=post.publish_at.isoformat(),
            updatedAt=post.updated_at.isoformat(),
        )
        for post in posts
    ]

    return PostListResponse(
        roomId=room.room_id,
        roomName=room.room_name,
        publishedPosts=published_posts
    )




