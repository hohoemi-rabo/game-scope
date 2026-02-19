---
paths:
  - "src/lib/supabase/**"
  - "src/app/api/**"
  - "src/app/actions/**"
  - "scripts/**"
---

# データベース設計

## gamesテーブル（ハイブリッド構成）

**共通フィールド**:
- `title_ja`, `title_en`, `platforms[]`, `metascore`, `release_date`, `thumbnail_url`

**OpenCriticフィールド**:
- `opencritic_id` (TEXT): URLスラッグ（例: "elden-ring"）
- `opencritic_numeric_id` (INTEGER): 数値ID（例: 12090）
- `review_count` (INTEGER)
- **URL構築**: `https://opencritic.com/game/{numeric_id}/{slug}`

**RAWGフィールド**（補完データ）:
- `description_en` (TEXT): 英語説明文
- `genres` (TEXT[]): ジャンル配列

**Twitchフィールド**:
- `twitch_game_id` (TEXT): キャッシュ（1週間有効）
- `twitch_last_checked_at` (TIMESTAMPTZ)

## operation_logsテーブル

自動更新の実行記録とエラートラッキング:
- `operation_type` (TEXT): 例 "auto_sync", "news_sync"
- `status` (TEXT): "success" / "error" / "partial"
- `message` (TEXT): UI表示用メッセージ
- `details` (JSONB): デバッグ用詳細情報
- `created_at` (TIMESTAMPTZ): **タイムゾーン付き必須**

フッターに最新ログのステータスを表示（同期成功/失敗 + 経過時間）

## user_portfoliosテーブル（Phase 2）

ユーザーのゲームポートフォリオを管理:
- `user_id` (UUID): auth.usersへの外部キー
- `game_id` (UUID): gamesテーブルへの外部キー
- `purchase_price` (INTEGER): 購入金額（円）
- `play_time_minutes` (INTEGER): プレイ時間（分）
- `is_subscription` (BOOLEAN): サブスク/無料フラグ
- `status` (TEXT): playing / completed / dropped / backlog
- `platform` (TEXT): プラットフォームID（PLATFORM_MASTERのid）
- `memo` (TEXT): 投資戦略メモ（200文字制限）

**RLS**: ユーザーは自分のデータのみアクセス可能（SELECT/INSERT/UPDATE/DELETE 全4ポリシー）

## newsテーブル（Phase 3）

RSSフィードから取得したニュース記事を保存:
- `id` (UUID), `title` (TEXT), `url` (TEXT, UNIQUE), `site_name` (TEXT)
- `published_at` (TIMESTAMPTZ), `thumbnail_url` (TEXT), `created_at` (TIMESTAMPTZ)
- **データ管理**: 7日以上前の記事は自動削除
- **RLS**: 公開読み取り / service_role のみ書き込み

## daily_digestsテーブル（Phase 3）

AI生成された日次要約:
- `target_date` (DATE), `category` (TEXT), `content` (TEXT)
- **UNIQUE制約**: `(target_date, category)` - 1日1カテゴリにつき1レコード
- **RLS**: 公開読み取り / service_role のみ書き込み

## RLS ベストプラクティス

- **全テーブルにRLS有効化必須**: `public` スキーマのテーブルは PostgREST 経由で公開されるため
- **`(select auth.uid())` パターン**: RLSポリシーで `auth.uid()` や `auth.role()` を使う場合、`(select ...)` で包んで1回だけ評価させる（行ごとの再評価を防止）

```sql
-- 悪い例: 行ごとに auth.uid() が再評価される
CREATE POLICY "bad" ON table USING (auth.uid() = user_id);
-- 良い例: 1回だけ評価
CREATE POLICY "good" ON table USING ((select auth.uid()) = user_id);
```

## DB関数のセキュリティ

- 関数には必ず `SET search_path = public` を指定（search_path 操作攻撃の防止）

## Supabase データアクセスパターン

```typescript
// lib/supabase/server.ts - Server Components用
import { createClient } from '@supabase/supabase-js'

export async function getGames() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // サーバー専用
  )
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .order('metascore', { ascending: false })
    .limit(60)
  if (error) throw error
  return data
}
```

## Supabase MCP Server の活用

プロジェクトローカル設定（`.mcp.json`）で統合:
- データベースマイグレーション実行、SQLクエリ実行、Edge Functionsデプロイ、ログ取得
- **重要**: `.mcp.json` は機密情報を含むため**絶対にコミットしない**（`.gitignore`済み）
