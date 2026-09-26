"""calc_publish_at（公開日時の計算）の単体テスト。

「今」を固定するために、posts モジュール内の datetime を差し替える。
"""
from datetime import datetime, timedelta, timezone

import pytest

from app.routers import posts

JST = timezone(timedelta(hours=9))


def freeze_now(monkeypatch, fixed: datetime):
    class FixedDatetime(datetime):
        @classmethod
        def now(cls, tz=None):
            return fixed.astimezone(tz)

    monkeypatch.setattr(posts, "datetime", FixedDatetime)


def test_immediate(monkeypatch):
    freeze_now(monkeypatch, datetime(2026, 4, 1, 15, 30, tzinfo=JST))
    # JST 15:30 → UTC 06:30（tzinfo なしで保存される）
    assert posts.calc_publish_at("immediate") == datetime(2026, 4, 1, 6, 30)


def test_today_22(monkeypatch):
    freeze_now(monkeypatch, datetime(2026, 4, 1, 15, 30, tzinfo=JST))
    assert posts.calc_publish_at("today_22") == datetime(2026, 4, 1, 13, 0)


def test_tomorrow_10(monkeypatch):
    freeze_now(monkeypatch, datetime(2026, 4, 1, 15, 30, tzinfo=JST))
    assert posts.calc_publish_at("tomorrow_10") == datetime(2026, 4, 2, 1, 0)


def test_tomorrow_10_across_month_end(monkeypatch):
    freeze_now(monkeypatch, datetime(2026, 4, 30, 23, 0, tzinfo=JST))
    assert posts.calc_publish_at("tomorrow_10") == datetime(2026, 5, 1, 1, 0)


def test_invalid_timing():
    with pytest.raises(ValueError):
        posts.calc_publish_at("someday")
