def create_post(client, room_id, user_uuid, timing="immediate", text="こんにちは"):
    return client.post(
        f"/api/rooms/{room_id}/posts",
        json={
            "userUuid": user_uuid,
            "nickname": "alice",
            "moodColor": "yellow",
            "emotionTag": "うれしい",
            "text": text,
            "publishTiming": timing,
        },
    )


def list_posts(client, room_id, user_uuid):
    res = client.get(f"/api/rooms/{room_id}/posts", params={"userUuid": user_uuid})
    assert res.status_code == 200
    return res.json()["publishedPosts"]


# --- 作成 ---

def test_create_immediate_post(client, room, alice):
    res = create_post(client, room, alice)
    assert res.status_code == 200
    assert res.json()["isPublished"] is True


def test_create_scheduled_post(client, room, alice):
    res = create_post(client, room, alice, timing="tomorrow_10")
    assert res.status_code == 200
    assert res.json()["isPublished"] is False


def test_create_post_invalid_timing(client, room, alice):
    res = create_post(client, room, alice, timing="someday")
    assert res.status_code == 400


def test_create_post_text_too_long(client, room, alice):
    assert create_post(client, room, alice, text="あ" * 400).status_code == 200
    assert create_post(client, room, alice, text="あ" * 401).status_code == 400


def test_create_post_room_not_found(client, alice):
    res = create_post(client, "nope", alice)
    assert res.status_code == 404


# --- 一覧・既読 ---

def test_list_immediate_post_is_unread_for_partner(client, room, alice, bob):
    create_post(client, room, alice)
    [post] = list_posts(client, room, bob)
    assert post["isPublished"] is True
    assert post["isRead"] is False


def test_own_post_is_always_read(client, room, alice):
    create_post(client, room, alice)
    [post] = list_posts(client, room, alice)
    assert post["isRead"] is True


def test_scheduled_post_visible_only_to_author(client, room, alice, bob):
    create_post(client, room, alice, timing="tomorrow_10")
    assert list_posts(client, room, bob) == []
    [post] = list_posts(client, room, alice)
    assert post["isPublished"] is False


def test_open_detail_marks_as_read(client, room, alice, bob):
    post_id = create_post(client, room, alice).json()["postId"]
    res = client.get(f"/api/rooms/{room}/posts/{post_id}", params={"userUuid": bob})
    assert res.status_code == 200
    [post] = list_posts(client, room, bob)
    assert post["isRead"] is True


def test_open_detail_twice_is_ok(client, room, alice, bob):
    post_id = create_post(client, room, alice).json()["postId"]
    url = f"/api/rooms/{room}/posts/{post_id}"
    assert client.get(url, params={"userUuid": bob}).status_code == 200
    assert client.get(url, params={"userUuid": bob}).status_code == 200


# --- 詳細 ---

def test_scheduled_post_detail_forbidden_for_partner(client, room, alice, bob):
    post_id = create_post(client, room, alice, timing="tomorrow_10").json()["postId"]
    url = f"/api/rooms/{room}/posts/{post_id}"
    assert client.get(url, params={"userUuid": bob}).status_code == 403
    assert client.get(url, params={"userUuid": alice}).status_code == 200


def test_post_detail_not_found(client, room, alice):
    res = client.get(f"/api/rooms/{room}/posts/999999", params={"userUuid": alice})
    assert res.status_code == 404


# --- 削除 ---

def test_delete_own_post(client, room, alice):
    post_id = create_post(client, room, alice).json()["postId"]
    res = client.delete(f"/api/rooms/{room}/posts/{post_id}", params={"userUuid": alice})
    assert res.status_code == 200
    assert list_posts(client, room, alice) == []


def test_delete_read_post(client, room, alice, bob):
    # 既読レコード（post_reads）があっても削除できる
    post_id = create_post(client, room, alice).json()["postId"]
    client.get(f"/api/rooms/{room}/posts/{post_id}", params={"userUuid": bob})
    res = client.delete(f"/api/rooms/{room}/posts/{post_id}", params={"userUuid": alice})
    assert res.status_code == 200


def test_cannot_delete_others_post(client, room, alice, bob):
    post_id = create_post(client, room, alice).json()["postId"]
    res = client.delete(f"/api/rooms/{room}/posts/{post_id}", params={"userUuid": bob})
    assert res.status_code == 403
