# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**GameScope（ゲームスコープ）** - 日本語で話題のゲームの評判と雰囲気が3秒でわかるゲーム情報サイト

### コンセプト
海外中心のゲーム評価データ(OpenCritic, Twitch等)を日本語でわかりやすく可視化し、一般ゲーマーに対して直感的かつ迅速に「どんなゲームか」を理解できる体験を提供する。

### 開発段階
- **現在**: MVP完了、Phase 3（運用自動化）完了
- Claude Code でのペアプログラミングを前提とした開発
- 次のステップ: 継続的なUI/UX改善

## 技術スタック

- **Next.js 15** (App Router, Turbopack)
- **React 19**
- **TypeScript** (strict mode)
- **Tailwind CSS 3.4.17**
- **Supabase** (Database, Edge Functions, Scheduler) - MCP Server統合
- **SWR** (クライアント側データフェッチング)
- **Vercel** (デプロイ予定)

## 重要な開発コマンド

```bash
# 開発サーバー起動 (Turbopack使用)
npm run dev

# プロダクションビルド
npm run build

# 型チェック＋ビルド（デプロイ前）
npm run lint && npm run build

# Supabase 型定義の再生成
npm run supabase:types

# ハイブリッドデータ同期（OpenCritic + RAWG）
npx tsx scripts/sync-hybrid-to-supabase.ts

# Edge Function手動トリガー
./scripts/trigger-sync.sh
```

開発サーバーは http://localhost:3000 で起動します。

## アーキテクチャの全体像

### データフロー

```
外部API (OpenCritic, RAWG)
    ↓ (日次自動更新 3AM JST)
Supabase Database (キャッシュ層)
    ↓
Next.js Server Components
    ↓
ユーザー (Browser)
```

**キャッシュ戦略**:
- **Supabase**: 外部APIのキャッシュ層として機能（コスト削減）
- **Edge Functions**: 日次自動更新（Cron Job @ 3AM JST）
- **API Routes**: 短時間キャッシュ（ニュース: 1時間、Twitch配信: 5分）

### ハイブリッドデータ統合

**現在の構成**: OpenCritic (主データ) + RAWG (補完データ)

1. **OpenCritic API** → 最新トップ60ゲーム（skip=0, 20, 40で3回取得）
   - スコア、レビュー数、プラットフォーム、画像、リンク
2. **RAWG API** → 各ゲームの英語説明文とジャンル補完
3. **Supabase** → 統合データを保存

**同期スクリプト**: `scripts/sync-hybrid-to-supabase.ts`
- APIレート制限: OpenCritic 3回/日、RAWG 120回/日（月間無料枠内）

### TypeScript 設定の重要ポイント

- **Path Alias**: `@/*` は `./src/*` を指す
- **Strict Mode**: 有効化されているため型安全性が重要
- **Exclude**: `scripts/` ディレクトリは型チェック対象外（ビルド時エラー回避）

## データベース設計の要点

### gamesテーブル（ハイブリッド構成）

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

### operation_logsテーブル

自動更新の実行記録とエラートラッキング:
- `operation_type` (TEXT): 例 "auto_sync"
- `status` (TEXT): "success" / "error"
- `message` (TEXT): UI表示用メッセージ
- `details` (JSONB): デバッグ用詳細情報
- `created_at` (TIMESTAMPTZ): **タイムゾーン付き必須**

フッターに最新ログのステータスを表示（同期成功/失敗 + 経過時間）

## デザインシステム

### カラーパレット

```css
:root {
  --bg-primary: #0e0e10;    /* ブラックグレー */
  --accent: #5865f2;        /* ブルーバイオレット */
  --success: #00c896;       /* エメラルドグリーン (スコア80+) */
  --warning: #ffb300;       /* アンバー (スコア60-79) */
  --danger: #ff5252;        /* コーラルレッド (スコア59以下) */
  --text-primary: #f2f2f2;
  --text-secondary: #9e9e9e;
}
```

### フォント設定

- **Inter**: 見出し用（Google Fonts、優先度高）
- **Noto Sans JP**: 日本語本文用（Google Fonts）
- **Geist Mono**: スコアバッジ用（Vercel提供）

### ニュースサイト別カラーシステム

**重要**: 動的カラークラスを使用するため、`tailwind.config.ts` の `safelist` に登録が必須

10サイト別の固有カラー（4Gamer 5種、Nintendo、PlayStation Blog、Game*Spark、GAME Watch、GAMER）
- 実装: `src/lib/utils/platform-colors.ts`
- 関数: `getPlatformButtonColor()`, `getPlatformBadgeColor()`, `getPlatformBorderColor()`

### レスポンシブデザイン

- モバイルファースト設計
- ブレークポイント: 768px (md:)
- SNSリンク: PCのみヘッダー表示、全デバイスでフッター表示（誤タップ防止）

## 主要機能の実装パターン

### 1. ニュース一覧（RSS統合）

**実装場所**: `src/app/news/page.tsx`, `src/lib/api/rss.ts`, `src/app/api/news/route.ts`

**アーキテクチャ**:
```
RSS Feeds (10サイト)
  ↓
lib/api/rss.ts (サーバー側でRSS取得)
  ↓
API Route (/api/news) - 1時間キャッシュ
  ↓
Client (SWR) - 2軸フィルタリング（サイト名 + キーワード）
```

**重要**: バックエンドではキーワードフィルタリングせず全記事取得。クライアント側でフィルタリング。

### 2. 検索機能

**実装場所**: `src/app/search/page.tsx`, `src/lib/supabase/search.ts`

- タイトル検索（日本語/英語、debounce 500ms）
- プラットフォームフィルター（overlaps演算子使用）
- スコア範囲フィルター（80+、60-79、60未満）
- URL同期（検索状態をURLパラメータに保存）

### 3. Twitch連携

**実装場所**:
- `src/lib/api/twitch.ts` - Twitch API クライアント
- `src/lib/api/game-twitch.ts` - Game ID キャッシュ機構
- `src/app/api/twitch/streams/[gameId]/route.ts` - ライブ配信API（5分キャッシュ）
- `src/app/api/twitch/clips/[gameId]/route.ts` - クリップAPI（1時間キャッシュ）

**キャッシュ戦略**:
- Twitch Game ID: データベースキャッシュ 1週間
- ライブ配信情報: 5分
- クリップ情報: 1時間
- SWR自動更新: 60秒ごと

**フォールバック検索**: タイトル表記ゆれ対応（数字前スペース削除、ローマ数字変換、"Remastered"削除）

### 4. ヘッダー/フッターデザイン

**ヘッダー** (`src/app/components/Header.tsx`):
- GameScopeロゴ: グラデーション（Game: ブルー→パープル→ピンク、Scope: グリーン→シアン）
- ナビゲーション: 🏆 高評価 | 🔍 検索 | 📰 ニュース
- SNSリンク（PCのみ表示）: Instagram、X（公式SVGロゴ）
- モバイル: 768px未満ではアイコンのみ表示

**フッター** (`src/app/components/Footer.tsx`):
- 同期ステータス表示（🟢 成功 / 🔴 失敗 + 経過時間）
- SNSリンク（全デバイス表示）
- リンク: お問い合わせ（GitHub Issues + Instagram DM）、プライバシーポリシー、Powered by OpenCritic

## Next.js 15 App Router ベストプラクティス

### Server Components vs Client Components

**デフォルトは Server Components**
- データフェッチング、データベースアクセスはサーバーで実行
- Client Components は `'use client'` で明示的に宣言

```typescript
// ✅ Server Component (デフォルト)
export default async function GameList() {
  const games = await getGames()
  return <GameGrid games={games} />
}

// ✅ Client Component（イベントハンドラ、useState等が必要）
'use client'
export default function SearchBar() {
  const [query, setQuery] = useState('')
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />
}
```

### データフェッチング戦略

```typescript
// Static Data (SSG相当)
const staticData = await fetch('https://...', {
  cache: 'force-cache' // デフォルト
})

// Dynamic Data (SSR相当)
const dynamicData = await fetch('https://...', {
  cache: 'no-store'
})

// ISR相当（1時間ごとに再検証）
const revalidatedData = await fetch('https://...', {
  next: { revalidate: 3600 }
})
```

### キャッシング戦略

| ユースケース | 戦略 | コード例 |
|------------|------|---------|
| 静的コンテンツ | force-cache | `{ cache: 'force-cache' }` |
| リアルタイム情報 | no-store | `{ cache: 'no-store' }` |
| 定期更新 | revalidate | `{ next: { revalidate: 3600 } }` |

### Supabase データアクセス

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

### セキュリティベストプラクティス

```typescript
// ✅ 必要なデータのみをClient Componentに渡す
export async function GamePage({ params }) {
  const { id } = await params
  const game = await getGame(id)

  return <GameDetails
    title={game.title_ja}
    score={game.metascore}
    // ❌ 全データを渡さない
  />
}

// 環境変数の扱い
const apiKey = process.env.OPENCRITIC_API_KEY // サーバーのみ
const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL // Client可
```

## Supabase MCP Server の活用

プロジェクトローカル設定（`.mcp.json`）で統合:
- データベースマイグレーション実行
- SQL クエリ実行
- Edge Functions デプロイ
- ログ取得

**重要**: `.mcp.json` は機密情報を含むため**絶対にコミットしない**（`.gitignore`済み）

## 開発時の注意事項

### コーディング規約

- **コメント**: 日本語で「なぜ」を説明
- **型定義**: TypeScript strict mode 対応
- **エラーハンドリング**: 外部API呼び出しは必ず try-catch で囲む

### セキュリティ・法的遵守

- **スクレイピング禁止**: すべてのデータは公式API/RSS経由
- **出典明示**: 外部データには必ず出典リンクを表示
- **環境変数管理**: APIキーは `.env.local` で管理（コミット禁止）

### トラブルシューティング

- 問題解決時は `docs/troubleshooting/` に記録を残す
- 自動更新の問題: `docs/自動更新システム.md` 参照

### チケット管理

機能別チケット: `docs/tickets/`（連番_機能名.md 形式）
- ステータス: `[未着手]`, `[進行中]`, `[完了]`, `[保留]`
- Todoマーク: `- [ ]` (未完了), `- [x]` (完了)

## 環境変数 (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# External APIs（ハイブリッド構成）
OPENCRITIC_API_KEY=     # OpenCritic API (RapidAPI経由)
RAWG_API_KEY=           # RAWG API
TWITCH_CLIENT_ID=       # Twitch API
TWITCH_CLIENT_SECRET=   # Twitch API
```

## 開発ワークフロー

1. **チケット確認**: `docs/tickets/` から該当チケットを開く
2. **実装**: チケット内のタスク一覧に従って実装
3. **Lint & Build**: `npm run lint && npm run build` で品質確認
4. **動作確認**: 開発サーバーで確認
5. **エラー記録**: 問題発生時は `docs/troubleshooting/` に記録

## 現在の開発状況

- ✅ **Phase 1 (MVP)**: 完了（高評価ゲーム一覧、詳細ページ）
- ✅ **Phase 2 (UX拡張)**: 完了（検索、ニュース一覧）
- ✅ **Phase 2.5 (Twitch連携)**: 完了（配信・クリップ表示）
- ✅ **Phase 3 (運用自動化)**: 完了（Edge Functions、Cron Jobs）
- 🎨 **UI改善**: 継続中（フォント、ヘッダー/フッター、SNSリンク）

## 参考資料

- [REQUIREMENTS.md](./REQUIREMENTS.md) - 詳細な要件定義書
- [docs/tickets/](./docs/tickets/) - 機能別開発チケット
- [docs/自動更新システム.md](./docs/自動更新システム.md) - 運用ドキュメント
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
