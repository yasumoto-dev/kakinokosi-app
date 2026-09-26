def room_payload(user_uuid, room_id="room-1", access_key="secret"):
    return {
        "roomId": room_id,
        "roomName": "ルーム1",
        "accessKey": access_key,
        "userUuid": user_uuid,
        "nickname": "alice",
    }


def test_create_room(client, alice):
    res = client.post("/api/rooms", json=room_payload(alice))
    assert res.status_code == 200
    assert res.json() == {"roomId": "room-1", "roomName": "ルーム1"}


def test_create_room_duplicate_id(client, alice, bob):
    client.post("/api/rooms", json=room_payload(alice))
    res = client.post("/api/rooms", json=room_payload(bob))
    assert res.status_code == 409


def test_create_room_short_access_key(client, alice):
    res = client.post("/api/rooms", json=room_payload(alice, access_key="abc"))
    assert res.status_code == 400


def test_join_room(client, alice, bob):
    client.post("/api/rooms", json=room_payload(alice))
    res = client.post("/api/rooms/room-1/join", json={"accessKey": "secret", "userUuid": bob})
    assert res.status_code == 200
    assert res.json()["roomId"] == "room-1"


def test_join_room_twice_is_ok(client, alice, bob):
    client.post("/api/rooms", json=room_payload(alice))
    body = {"accessKey": "secret", "userUuid": bob}
    assert client.post("/api/rooms/room-1/join", json=body).status_code == 200
    assert client.post("/api/rooms/room-1/join", json=body).status_code == 200
    assert len(client.get(f"/api/users/{bob}/rooms").json()) == 1


def test_join_room_wrong_access_key(client, alice, bob):
    client.post("/api/rooms", json=room_payload(alice))
    res = client.post("/api/rooms/room-1/join", json={"accessKey": "wrong", "userUuid": bob})
    assert res.status_code == 401


def test_join_room_not_found(client, bob):
    res = client.post("/api/rooms/nope/join", json={"accessKey": "secret", "userUuid": bob})
    assert res.status_code == 404


def test_get_user_rooms(client, alice):
    client.post("/api/rooms", json=room_payload(alice, room_id="room-1"))
    client.post("/api/rooms", json=room_payload(alice, room_id="room-2"))
    res = client.get(f"/api/users/{alice}/rooms")
    assert res.status_code == 200
    assert {r["roomId"] for r in res.json()} == {"room-1", "room-2"}


def test_get_user_rooms_empty(client, bob):
    res = client.get(f"/api/users/{bob}/rooms")
    assert res.status_code == 200
    assert res.json() == []
