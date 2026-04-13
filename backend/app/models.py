from sqlalchemy import BigInteger, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.database import Base


class Room(Base):
    __tablename__ = "rooms"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    room_id: Mapped[int] = mapped_column(String(50), unique=True, nullable=False)
    room_name: Mapped[str] = mapped_column(String(100), nullable=False)
    access_key: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    members: Mapped[list["RoomMember"]] = relationship("RoomMember", back_populates="room")
    posts: Mapped[list["Post"]] = relationship("Post", back_populates="room")


class RoomMember(Base):
    __tablename__ = "room_members"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    room_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("room.id"), nullable=False)
    user_uuid: Mapped[str] = mapped_column(String(36), nullable=False)
    nickname: Mapped[str] = mapped_column(String(50), nullable=False)
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    room: Mapped["Room"] = relationship("Room", back_populates="members")


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    room_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("rooms.id"), nullable=False)
    user_uuid: Mapped[str] = mapped_column(String(36), nullable=False)
    nickname: Mapped[str] = mapped_column(String(50), nullable=False)
    mood_color: Mapped[str] = mapped_column(String(20), nullable=False)
    emotion_tag: Mapped[str | None] = mapped_column(String(50), nullable=False)
    text: Mapped[str] = mapped_column(String(400), nullable=False)
    published_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    room: Mapped["Room"] = relationship("Room", back_populates="posts")