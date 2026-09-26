import os
import uuid

# app を import する前に接続先を決める必要がある（app/database.py が import 時にエンジンを作るため）。
# 未指定ならローカルの Docker の Postgres を使う（docs/setup.md 参照）。
os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:55432/kakinokosi_test",
)

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import text  # noqa: E402

from app.database import engine  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture(scope="session")
def client():
    # with で囲むと startup イベント（テーブル作成）が走り、
    # テスト全体で同じイベントループが使われる
    with TestClient(app) as c:
        yield c


@pytest.fixture(autouse=True)
def clean_db(client):
    """各テストの前に全テーブルを空にする"""

    async def truncate():
        async with engine.begin() as conn:
            await conn.execute(
                text("TRUNCATE post_reads, posts, room_members, rooms RESTART IDENTITY CASCADE")
            )

    client.portal.call(truncate)


def new_uuid() -> str:
    return str(uuid.uuid4())


@pytest.fixture
def alice():
    return new_uuid()


@pytest.fixture
def bob():
    return new_uuid()


@pytest.fixture
def room(client, alice, bob):
    """alice が作成し、bob が参加済みのルーム"""
    res = client.post(
        "/api/rooms",
        json={
            "roomId": "test-room",
            "roomName": "テストルーム",
            "accessKey": "secret",
            "userUuid": alice,
            "nickname": "alice",
        },
    )
    assert res.status_code == 200
    res = client.post("/api/rooms/test-room/join", json={"accessKey": "secret", "userUuid": bob})
    assert res.status_code == 200
    return "test-room"
