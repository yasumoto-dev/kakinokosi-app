# カキノコシ

**大切な気持ちを時間差で届けよう✒️**

---

### 🚩概要

その場では伝えづらい感情を、時間差でそっと届けるための非同期コミュニケーションアプリです。ルームを共有した2人だけが、感情のこもった「手紙」を送り合うことができます。

公開URL: https://kakinokosi-frontend.vercel.app/

---

### 🎯主な機能

- ルームの作成・参加
- 感情パレット・感情タグを使った投稿
- 公開タイミングの指定（即時 / 当日22:00 / 翌日10:00）
- 未読 / 既読 / 時間指定 のタブ切り替え表示
- 投稿の削除

---

### 📃ディレクトリ構成

```
kakinokosi-app
├─ backend/               # バックエンド (FastAPI)
│  └─ app/
│     ├─ main.py          # アプリのエントリポイント・APIルート定義
│     ├─ models.py        # SQLAlchemyによるDBモデル定義
│     ├─ database.py      # DB接続設定
│     └─ routers/         # 機能ごとのエンドポイント分割
│        ├─ posts.py      # 投稿関連API
│        └─ rooms.py      # ルーム関連API
├─ frontend/              # フロントエンド (React + Vite)
│  ├─ src/
│  │  ├─ api/             # axios等を用いたAPI通信クライアント
│  │  ├─ components/      # 各画面共通のUIコンポーネント
│  │  ├─ pages/           # 各画面のページコンポーネント
│  │  │  └─ (各画面名)/    # JSXとCSS Modulesをカプセル化
│  │  ├─ App.jsx          # ルーティング・全体レイアウト設定
│  │  └─ main.jsx         # Reactマウント処理
│  ├─ index.html          # HTMLテンプレート
│  └─ package.json        # 依存ライブラリ管理
└─ README.md
```

---

### ⚙️使用技術

#### フロントエンド
- **React** (UIライブラリ)
- **Vite** (ビルドツール)
- **Vercel** (ホスティング)

#### バックエンド
- **FastAPI** (Python フレームワーク)
- **SQLAlchemy** (ORM / データベース操作)
- **Render** (ホスティング)

#### データベース / インフラ
- **Neon** (Serverless PostgreSQL)

---

### 今後の改善

- 投稿のリロード機能追加
- 投稿絞り込み機能追加
- 未読投稿を開く際のモーション追加
