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

    members: Mapped[list["RoomMenmber"]] = relationship("RoomMember", back_populates="room")
    posts: Mapped[list["Post"]] = relationship("Post", back_populates="room")



