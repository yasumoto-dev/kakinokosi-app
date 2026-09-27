# ローカル開発環境のセットアップ

ローカルでカキノコシを動かすための手順です。

## 必要なもの

| ツール | バージョン | 用途 |
|---|---|---|
| Python | 3.12 | バックエンド（FastAPI） |
| Node.js | 20.19 以上（22 推奨） | フロントエンド（Vite 8 の要件） |
| Docker | - | ローカル用 PostgreSQL（Neon の代わり） |

## 全体像

```
ブラウザ ──► Vite 開発サーバー (localhost:5173)
                 │  /api/* はプロキシで転送
                 ▼
             FastAPI (localhost:8000) ──► PostgreSQL (localhost:5432, Docker)
```

## 1. データベースを起動する

本番の Neon は使わず、Docker で PostgreSQL を立てます。

```bash
docker run -d --name kakinokosi-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=kakinokosi \
  -p 5432:5432 \
  postgres:16
```

テーブルはバックエンドの起動時に自動で作成されます（`app/main.py` の `startup` イベント）。

2回目以降は `docker start kakinokosi-db` で起動できます。

## 2. バックエンドを起動する

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt   # 本番用の依存 + テスト/Lint ツール

cp .env.example .env                  # 必要なら DATABASE_URL を編集

uvicorn app.main:app --reload --port 8000
```

- http://localhost:8000/ に `{"message": "カキノコシ API 起動中"}` が返れば OK
- http://localhost:8000/docs で FastAPI の自動生成 API ドキュメント（Swagger UI）が開けます
- `database.py` で `echo=True` になっているため、実行された SQL がターミナルに表示されます

## 3. フロントエンドを起動する

別のターミナルで:

```bash
cd frontend
npm ci                                # package-lock.json どおりにインストール
cp .env.example .env.local            # ローカルでは VITE_API_BASE_URL は空でよい
npm run dev
```

http://localhost:5173/ を開きます。

> **ポイント:** `VITE_API_BASE_URL` が空だと、axios は `/api/...` を同じオリジン（5173）に送ります。
> それを `vite.config.js` の `server.proxy` が `localhost:8000` に転送するので、CORS を気にせず開発できます。

### 2人でのやり取りを試すには

ユーザーはブラウザの `localStorage` に保存された `userUuid` で区別されます。
通常ウィンドウとシークレットウィンドウ（または別ブラウザ）を使うと、2人分のユーザーとして動作を確認できます。

## 環境変数一覧

| 変数 | 場所 | 説明 |
|---|---|---|
| `DATABASE_URL` | `backend/.env` | PostgreSQL の接続文字列。`postgresql+asyncpg://` 形式 |
| `VITE_API_BASE_URL` | `frontend/.env.local` | API のベース URL。ローカルでは空、本番は Render の URL |

`VITE_` で始まる変数はビルド時にフロントエンドのコードへ埋め込まれ、ブラウザから見える点に注意してください（秘密情報は入れない）。

## テストと Lint

```bash
# バックエンド（テスト用 DB を別途起動しておく）
docker run -d --name kakinokosi-test-db \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=kakinokosi_test \
  -p 55432:5432 postgres:16
cd backend
pytest          # tests/conftest.py が localhost:55432 のテスト用 DB に接続する
ruff check .

# フロントエンド
cd frontend
npm test        # vitest
npm run lint    # eslint
```

- テストは実行のたびに全テーブルを空にします。**開発用 DB（5432）ではなくテスト用 DB（55432）を使ってください**
- 接続先は環境変数 `DATABASE_URL` で上書きできます
- 同じチェックが GitHub Actions（`.github/workflows/ci.yml`）で PR ごとに自動実行されます

## トラブルシューティング

### ROS の環境で `pytest` が `ModuleNotFoundError: No module named 'yaml'` で落ちる

ROS を `source` したシェルでは `PYTHONPATH` に ROS のパッケージが入り、
pytest が ROS 側のプラグイン（`launch_testing` など）を自動で読み込もうとして失敗します。

`backend/pytest.ini` で `--disable-plugin-autoload` を指定してプラグインの自動読み込みを止めているため、
現在は ROS を `source` したままでも `pytest` をそのまま実行できます。
このエラーが出る場合は、`backend/` の外から引数なしで pytest を実行して `pytest.ini` が読まれていないか、
pytest が 8.4 未満になっていないかを確認してください。

なお自動読み込みを止めているので、pytest のプラグイン（`pytest-cov` など）を追加したときは
`pytest.ini` の `addopts` に `-p pytest_cov` のように明示的に書く必要があります。

### `npm ci` が lock ファイルの不整合で失敗する

`package.json` と `package-lock.json` がずれています。`npm install` で lock ファイルを更新し、両方をコミットしてください。

### バックエンド起動時に接続エラーになる

- `docker ps` で DB コンテナが動いているか確認
- `DATABASE_URL` が `postgresql+asyncpg://` で始まっているか確認（`postgresql://` だと同期ドライバを探してエラーになる）
