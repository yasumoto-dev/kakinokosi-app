# API リファレンス

バックエンド（FastAPI）のエンドポイント一覧です。
起動中のサーバーの `/docs`（Swagger UI）でも同じ内容を確認・実行できます。

- 本番: Render 上のバックエンド URL
- ローカル: `http://localhost:8000`
- リクエスト / レスポンスは JSON。キー名は camelCase
- エラー時は `{"detail": "エラーメッセージ"}` の形で返る
- 日時はすべて **UTC・タイムゾーン表記なし** の ISO 8601 文字列（例: `2026-04-01T13:00:00`）。フロントエンドでは末尾に `Z` を付けて UTC として解釈している

## 一覧

| メソッド | パス | 概要 | 定義場所 |
|---|---|---|---|
| GET / HEAD | `/` | 死活確認 | `app/main.py` |
| POST | `/api/rooms` | ルーム作成 | `app/routers/rooms.py` |
| POST | `/api/rooms/{roomId}/join` | ルーム参加 | `app/routers/rooms.py` |
| GET | `/api/users/{userUuid}/rooms` | 参加済みルーム一覧 | `app/routers/rooms.py` |
| POST | `/api/rooms/{roomId}/posts` | 投稿作成 | `app/routers/posts.py` |
| GET | `/api/rooms/{roomId}/posts` | 投稿一覧 | `app/routers/posts.py` |
| GET | `/api/rooms/{roomId}/posts/{postId}` | 投稿詳細（既読登録） | `app/routers/posts.py` |
| DELETE | `/api/rooms/{roomId}/posts/{postId}` | 投稿削除 | `app/routers/posts.py` |

`roomId` はユーザーが決めた文字列のルーム ID（DB の `rooms.room_id`）で、内部の連番 ID（`rooms.id`）ではありません。
`postId` は投稿の連番 ID です。

`userUuid` はフロントエンドが `crypto.randomUUID()` で生成し、`localStorage` に保存している値です（[architecture.md](architecture.md#ユーザーの識別) 参照）。

---

## 死活確認

### `GET /`・`HEAD /`

```json
{ "message": "カキノコシ API 起動中" }
```

`HEAD` は外部の監視サービス（UptimeRobot）からの定期アクセス用です。

---

## ルーム

### `POST /api/rooms` — ルーム作成

作成者は自動的にルームのメンバーとして登録されます。

リクエスト:

```json
{
  "roomId": "our-room",
  "roomName": "ふたりの部屋",
  "accessKey": "secret",
  "userUuid": "0b5c...-...",
  "nickname": "alice"
}
```

レスポンス `200`:

```json
{ "roomId": "our-room", "roomName": "ふたりの部屋" }
```

| ステータス | 条件 |
|---|---|
| 409 | `roomId` がすでに使われている |
| 400 | `accessKey` が 4 文字未満 |

### `POST /api/rooms/{roomId}/join` — ルーム参加

リクエスト:

```json
{ "accessKey": "secret", "userUuid": "5f1a...-..." }
```

レスポンス `200`: ルーム作成と同じ形。すでにメンバーの場合も `200` を返す（重複登録はしない）。

| ステータス | 条件 |
|---|---|
| 404 | ルームが存在しない |
| 401 | `accessKey` が一致しない |

### `GET /api/users/{userUuid}/rooms` — 参加済みルーム一覧

参加日時の新しい順に返します。

レスポンス `200`:

```json
[
  { "roomId": "our-room", "roomName": "ふたりの部屋", "joinedAt": "2026-04-01T06:30:00" }
]
```

---

## 投稿

### `POST /api/rooms/{roomId}/posts` — 投稿作成

リクエスト:

```json
{
  "userUuid": "0b5c...-...",
  "nickname": "alice",
  "moodColor": "red",
  "emotionTag": "ありがとう",
  "text": "昨日はありがとう",
  "publishTiming": "today_22"
}
```

| フィールド | 説明 |
|---|---|
| `moodColor` | 気分カラー。フロントエンドでは `red` / `blue` / `yellow` / `green` のいずれか |
| `emotionTag` | 感情タグ（任意）。カラーごとの候補はフロントエンドの `PostNew.jsx` の `COLOR_TAGS` で定義 |
| `text` | 本文。400 文字以内 |
| `publishTiming` | 公開タイミング。下表のいずれか |

| `publishTiming` | 公開日時（日本時間で計算） |
|---|---|
| `immediate` | 今すぐ |
| `today_22` | 当日 22:00 |
| `tomorrow_10` | 翌日 10:00 |

レスポンス `200`:

```json
{ "postId": "12", "isPublished": false, "publishedAt": "2026-04-01T13:00:00" }
```

`publishedAt` は公開（予定）日時です。

| ステータス | 条件 |
|---|---|
| 404 | ルームが存在しない |
| 400 | `text` が 400 文字を超える / `publishTiming` が不正 |

### `GET /api/rooms/{roomId}/posts?userUuid=...` — 投稿一覧

次の投稿を **公開日時の新しい順** で返します。

- 公開済み（`publish_at <= 現在`）のすべての投稿
- `userUuid` 本人の公開前の投稿

レスポンス `200`:

```json
{
  "roomId": "our-room",
  "roomName": "ふたりの部屋",
  "publishedPosts": [
    {
      "postId": "12",
      "nickname": "alice",
      "moodColor": "red",
      "emotionTag": "ありがとう",
      "text": "昨日はありがとう",
      "publishedAt": "2026-04-01T13:00:00",
      "updatedAt": "2026-04-01T06:30:00",
      "isPublished": true,
      "isRead": false,
      "userUuid": "0b5c...-..."
    }
  ]
}
```

| フィールド | 意味 |
|---|---|
| `isPublished` | 公開日時を過ぎているか |
| `isRead` | リクエストした本人が既読か。**自分の投稿は常に `true`** |

フロントエンド（`PostList.jsx`）はこの結果を 3 つのタブに振り分けます。

| タブ | 条件 |
|---|---|
| 未読 | 相手の投稿 かつ 公開済み かつ 未読 |
| 既読 | 公開済み かつ（自分の投稿 または 既読） |
| 時間指定 | 自分の投稿 かつ 未公開 |

| ステータス | 条件 |
|---|---|
| 404 | ルームが存在しない |

### `GET /api/rooms/{roomId}/posts/{postId}?userUuid=...` — 投稿詳細

投稿を 1 件返します。**他人の投稿を開いた場合は、このタイミングで既読として記録されます**（`post_reads` に 1 行追加。2 回目以降は追加しない）。

レスポンス `200`:

```json
{
  "postId": "12",
  "nickname": "alice",
  "moodColor": "red",
  "emotionTag": "ありがとう",
  "text": "昨日はありがとう",
  "publishedAt": "2026-04-01T13:00:00",
  "isPublished": true,
  "userUuid": "0b5c...-..."
}
```

| ステータス | 条件 |
|---|---|
| 404 | ルームまたは投稿が存在しない |
| 403 | 公開前の投稿を本人以外が開こうとした |

### `DELETE /api/rooms/{roomId}/posts/{postId}?userUuid=...` — 投稿削除

本人の投稿のみ削除できます。既読記録（`post_reads`）も一緒に削除されます。

レスポンス `200`:

```json
{ "message": "削除しました" }
```

| ステータス | 条件 |
|---|---|
| 404 | ルームまたは投稿が存在しない |
| 403 | 本人の投稿ではない |

---

## 共通のエラー

| ステータス | 条件 |
|---|---|
| 422 | 必須フィールドの欠落・型の不一致（FastAPI / Pydantic が自動で返す） |
| 500 | 想定外のエラー（DB の文字数上限超過など） |
