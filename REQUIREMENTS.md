# 🎮 GameScope 要件定義書

## 1. プロジェクト概要

### 1.1 サービス名

**GameScope（ゲームスコープ）**

### 1.2 コンセプト

「日本語で、いま話題のゲームの"評判と雰囲気"が 3 秒でわかる。」

### 1.3 目的

海外中心のゲーム評価データを日本語でわかりやすく可視化し、一般ゲーマーに対して直感的かつ迅速に「どんなゲームか」を理解できる体験を提供する。

### 1.4 開発方針

- MVP（Minimum Viable Product）段階において最小限の機能で公開
- 外部 API 利用に関してはコストをかけない方針（Supabase キャッシュ活用）
- UI/UX は「日本語」「視覚的理解」「操作のシンプルさ」を重視
- データ取得は公式 API または正規 RSS 等の合法的手段のみを使用
- Claude Code でのペアプログラミング開発を前提

## 2. 技術スタック

### 2.1 フロントエンド

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** (Phase 2 以降)

### 2.2 バックエンド・インフラ

- **Supabase**
  - Database (PostgreSQL)
  - Edge Functions
  - Scheduler (自動更新)
  - MCP Server 統合
- **Vercel** (デプロイ)

### 2.3 外部 API

- **OpenCritic API** - ゲームスコア・レビュー
- **Twitch API** - ゲーム映像・配信情報
- **Steam Web API** - 海外発売予定
- **4Gamer/任天堂/PS Blog RSS** - 国内発売予定

## 3. コア機能要件

### 3.1 Phase 1: MVP 構築（必須機能）

#### 3.1.1 トップページ

- 高評価ゲーム一覧表示（グリッドレイアウト）
- メタスコアの色分け表示
  - 80 以上: エメラルドグリーン (#00c896)
  - 60-79: アンバー (#ffb300)
  - 59 以下: コーラルレッド (#ff5252)
- ゲームカードコンポーネント
  - タイトル（日本語/英語）
  - メタスコア
  - プラットフォームアイコン
  - サムネイル画像

#### 3.1.2 ゲーム詳細ページ

- スコア・レビュー概要表示
- Twitch 映像埋め込み（配信中の場合）
- 発売日情報
- プラットフォーム情報
- 外部リンク（OpenCritic, Steam 等）

#### 3.1.3 データ管理

- Supabase 初期データ投入（仮データ 20 件）
- 基本的な CRUD 操作

### 3.2 Phase 2: UX 拡張

#### 3.2.1 検索機能

- あいまい検索（かな/英語対応）
- プラットフォームフィルタ
- スコア範囲フィルタ

#### 3.2.2 発売予定タブ

- 国内発売予定リスト
- RSS 自動取得・パース
- 発売日順ソート

### 3.3 Phase 3: 運用自動化

#### 3.3.1 自動更新システム

- Supabase Scheduler 設定
- 日次データ更新（OpenCritic, RSS）
- エラーハンドリング・リトライ機構

## 4. データベース設計

### 4.1 テーブル構成

```sql
-- ゲーム情報
CREATE TABLE games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_ja TEXT,
  title_en TEXT NOT NULL,
  platforms TEXT[],
  metascore INTEGER,
  review_count INTEGER,
  release_date DATE,
  thumbnail_url TEXT,
  opencritic_id TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Twitch連携情報
CREATE TABLE twitch_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES games(id),
  clip_url TEXT,
  thumbnail_url TEXT,
  has_live BOOLEAN DEFAULT false,
  viewer_count INTEGER,
  checked_at TIMESTAMP DEFAULT NOW()
);

-- 発売予定情報
CREATE TABLE releases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  platform TEXT,
  release_date DATE,
  source TEXT,
  link_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 操作ログ
CREATE TABLE operation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  operation_type TEXT,
  status TEXT,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 5. UI/UX デザイン

### 5.1 デザインシステム

#### カラーパレット

```css
:root {
  --bg-primary: #0e0e10; /* ブラックグレー */
  --accent: #5865f2; /* ブルーバイオレット */
  --success: #00c896; /* エメラルドグリーン */
  --warning: #ffb300; /* アンバー */
  --danger: #ff5252; /* コーラルレッド */
  --text-primary: #f2f2f2; /* ホワイト */
  --text-secondary: #9e9e9e; /* グレー */
}
```

#### タイポグラフィ

- 見出し: Poppins / Inter
- 日本語: Noto Sans JP
- 数値: Roboto Mono

### 5.2 レスポンシブ対応

- モバイルファースト設計
- ブレークポイント: 767px（1 列/2 列切り替え）
- タッチフレンドリーな UI 要素

## 6. 開発フロー

### 6.1 初期セットアップ

1. `/init`コマンドで環境初期化
2. context7 MCP で Next.js 最新ベストプラクティスを取得
3. CLAUDE.md にプロジェクト固有の情報を記載

### 6.2 開発進行

1. docs/配下に機能別チケット作成
2. 機能単位での実装・テスト
3. エラー解決内容の文書化
4. 定期的な`/init`で CLAUDE.md 更新

### 6.3 ディレクトリ構成

```
gamescope/
├── app/
│   ├── page.tsx                 # トップページ
│   ├── game/
│   │   └── [id]/
│   │       └── page.tsx         # 詳細ページ
│   ├── releases/
│   │   └── page.tsx             # 発売予定
│   ├── api/                     # API Routes
│   └── components/
│       ├── GameCard.tsx
│       ├── ScoreBadge.tsx
│       └── SearchBar.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── types.ts
│   └── api/
│       ├── opencritic.ts
│       ├── twitch.ts
│       └── rss.ts
├── supabase/
│   ├── migrations/
│   └── functions/
├── docs/
│   ├── tickets/                 # 開発チケット
│   └── troubleshooting/         # エラー解決記録
├── styles/
│   └── globals.css
├── REQUIREMENTS.md              # この文書
└── CLAUDE.md                    # プロジェクト固有情報
```

## 7. 環境変数

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# External APIs
OPENCRITIC_API_KEY=
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=
STEAM_API_KEY=
```

## 8. セキュリティ・法的遵守

### 8.1 基本方針

- すべての外部データは公式 API/RSS 経由で取得
- API キーは環境変数で管理
- 出典リンクを必ず明示
- スクレイピングは禁止

### 8.2 データ利用規約

| データソース  | 利用条件               | 対応                   |
| ------------- | ---------------------- | ---------------------- |
| OpenCritic    | 商用利用可（出典明示） | 詳細ページに出典リンク |
| Twitch        | API ガイドライン準拠   | 埋め込みプレイヤー使用 |
| 4Gamer 等 RSS | 出典必須               | タイトル・リンク引用   |
| Steam         | API 規約準拠           | タイトル・URL のみ利用 |

## 9. 拡張計画（Future）

### Phase 4 以降の展望

- AI 要約機能（レビュー自動要約）
- ユーザー認証・お気に入り機能
- レコメンドシステム
- 分析ダッシュボード
- 多言語対応

## 10. 成功指標

### MVP 段階

- ページ読み込み: 3 秒以内
- 初回訪問での理解: 1 分以内
- モバイル対応: 完全レスポンシブ
- データ更新: 日次自動実行

## 11. 開発上の注意事項

### Claude Code 開発時の留意点

1. **段階的な実装**: MVP から始めて機能を追加
2. **エラー記録**: 解決方法を docs/troubleshooting/に記載
3. **定期的な動作確認**: 各機能実装後にローカルテスト
4. **コメント重視**: 日本語でのコメント記載推奨
5. **型安全性**: TypeScript の型定義を厳密に

### 初期データ準備

- OpenCritic から人気ゲーム 20 件を仮データとして投入
- 日本語タイトルは手動マッピングまたは翻訳 API 使用を検討
- Twitch データは動的取得のため初期投入不要

## 12. 次のステップ

1. この要件定義書を REQUIREMENTS.md として保存
2. `/init`コマンドで開発環境を初期化
3. context7 MCP で Next.js 15 のベストプラクティスを取得
4. CLAUDE.md にプロジェクト固有情報を記載
5. Supabase プロジェクトのセットアップ
6. 基本構造の実装開始

---

_このドキュメントは開発進行に応じて更新されます_
_最終更新: 2025 年 1 月_
