def test_root(client):
    res = client.get("/")
    assert res.status_code == 200
    assert "message" in res.json()


def test_root_head(client):
    # UptimeRobot が HEAD リクエストで死活監視するため
    res = client.head("/")
    assert res.status_code == 200
