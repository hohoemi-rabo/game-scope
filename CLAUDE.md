# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**GameScope（ゲームスコープ）** - 日本語で話題のゲームの評判と雰囲気が3秒でわかるゲーム情報サイト

### コンセプト
海外中心のゲーム評価データ(OpenCritic, Twitch等)を日本語でわかりやすく可視化し、一般ゲーマーに対して直感的かつ迅速に「どんなゲームか」を理解できる体験を提供する。

### 開発段階
- **現在**: Phase 1〜2 完了
- Claude Code でのペアプログラミングを前提とした開発
- Phase 2（Gaming ROI / コスパ管理機能）実装完了

## 技術スタック

- **Next.js 15.5.7** (App Router, Turbopack)
- **React 19**
- **TypeScript** (strict mode)
- **Tailwind CSS 3.4.17**
- **Supabase** (Database, Auth, Edge Functions, Scheduler) - MCP Server統合
- **SWR** (クライアント側データフェッチング)
- **Vercel** (デプロイ予定)

### Phase 2 追加技術
- **Supabase Auth** - Google OAuth認証
- **Row Level Security (RLS)** - ユーザーデータの行レベルセキュリティ
- **Server Actions** - ポートフォリオCRUD操作
- **DeepL API** - 日本語→英語翻訳（ゲーム検索用）

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

### user_portfoliosテーブル（Phase 2）

ユーザーのゲームポートフォリオを管理:
- `user_id` (UUID): auth.usersへの外部キー
- `game_id` (UUID): gamesテーブルへの外部キー
- `purchase_price` (INTEGER): 購入金額（円）
- `play_time_minutes` (INTEGER): プレイ時間（分）
- `is_subscription` (BOOLEAN): サブスク/無料フラグ
- `status` (TEXT): playing / completed / dropped / backlog
- `platform` (TEXT): プラットフォームID（PLATFORM_MASTERのid）

**RLS必須**: ユーザーは自分のデータのみアクセス可能

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
- ナビゲーション: 🏆 高評価 | 🔍 検索 | 📰 ニュース | 🔄 更新状況
- SNSリンク（PCのみ表示）: Instagram、X（公式SVGロゴ）
- モバイル: 768px未満ではアイコンのみ表示
- ログインボタン / ユーザーメニュー（ドロップダウン）実装済み

**フッター** (`src/app/components/Footer.tsx`):
- 同期ステータス表示（🟢 最新情報更新済 / 🔴 更新エラー + 経過時間）
- SNSリンク（全デバイス表示）
- リンク: お問い合わせ（GitHub Issues + Instagram DM）、プライバシーポリシー、Powered by OpenCritic
- **SyncStatus**: Client ComponentでAPIから最新状態を取得（`/api/sync-status`）

### 5. 更新状況ページ

**実装場所**: `src/app/status/page.tsx`

- データソース一覧（OpenCritic, RAWG, Twitch, ニュースRSS）
- 更新スケジュール（毎日3:00 JST）
- 最近の更新履歴（operation_logsから取得）
- **動的レンダリング**: `export const dynamic = 'force-dynamic'` で常に最新データ

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

**Phase 2 チケット一覧**（全完了）:
| # | チケット名 | 内容 | ステータス |
|---|-----------|------|----------|
| 15 | Google認証セットアップ | Supabase Auth + GCP OAuth設定 | ✅ 完了 |
| 16 | DBマイグレーション | user_portfoliosテーブル + RLS | ✅ 完了 |
| 17 | 認証UI実装 | ログインボタン / ユーザーメニュー | ✅ 完了 |
| 18 | RAWGゲーム検索API | 検索・登録API実装 | ✅ 完了 |
| 19 | ポートフォリオ登録機能 | モーダルUI + Server Action | ✅ 完了 |
| 20 | ダッシュボードUI | サマリー + ゲームリスト + CPH | ✅ 完了 |
| 21 | 編集削除機能 | 編集モーダル + 削除ダイアログ | ✅ 完了 |

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
DEEPL_API_KEY=          # DeepL API（ゲーム検索の日本語→英語翻訳）
```

## 開発ワークフロー

1. **チケット確認**: `docs/tickets/` から該当チケットを開く
2. **実装**: チケット内のタスク一覧に従って実装
3. **Lint & Build**: `npm run lint && npm run build` で品質確認
4. **動作確認**: 開発サーバーで確認
5. **エラー記録**: 問題発生時は `docs/troubleshooting/` に記録

## 現在の開発状況

- ✅ **Phase 1 (MVP)**: 完了（高評価ゲーム一覧、詳細ページ）
- ✅ **Phase 1.5 (UX拡張)**: 完了（検索、ニュース一覧、更新状況ページ）
- ✅ **Phase 1.6 (Twitch連携)**: 完了（配信・クリップ表示）
- ✅ **Phase 1.7 (運用自動化)**: 完了（Edge Functions、Cron Jobs）
- ✅ **UI改善**: 完了（フォント、ヘッダー/フッター、SNSリンク、無限スクロール）
- ✅ **Phase 2 (Gaming ROI)**: 完了（認証、ダッシュボード、ポートフォリオCRUD）

### Phase 2 実装内容（Gaming ROI / コスパ管理機能）

ユーザーが購入したゲームの「金額」と「プレイ時間」を記録し、**CPH（Cost Per Hour: 時間あたりコスト）**を算出・可視化する機能。

**コンセプト**: ゲームを「消費」ではなく「投資」として捉え直し、ユーザーの自己肯定感を高める。

**主要ルート**:
- `/dashboard` - マイダッシュボード（サマリー + ゲームリスト）
- `/auth/callback` - OAuth コールバック
- `/auth/error` - 認証エラーページ

**主要コンポーネント**:
- `src/app/components/auth/` - 認証UI（LoginButton, UserMenu）
- `src/app/components/dashboard/` - ダッシュボード
  - `DashboardSummary` - サマリーカード（総投資額、総プレイ時間、平均時間単価）+ ランク表ツールチップ
  - `MarketInsight` - もしも換算ウィジェット（VS構造、一般娯楽との比較）
  - `GameList` - ゲーム一覧
  - `GameListItem` - 投資アプリ風UIのゲームカード（CPH、プログレスバー、メタファー）
  - `AddGameButton` - ゲーム追加ボタン
- `src/app/components/portfolio/` - ポートフォリオ操作
  - `AddGameModal` - ゲーム追加モーダル（検索/手動登録）
  - `SearchGamesStep` - RAWG検索（DeepL翻訳対応）
  - `ManualEntryStep` - 手動登録フォーム
  - `EditGameModal`, `DeleteConfirmDialog` - 編集・削除UI

**Server Actions** (`src/app/actions/portfolio.ts`):
- `createPortfolioEntry` - ゲーム登録
- `updatePortfolioEntry` - ゲーム編集
- `deletePortfolioEntry` - ゲーム削除

**API Routes**:
- `/api/games/search` - RAWGゲーム検索（DeepL翻訳対応）
- `/api/games/register` - ゲーム登録（DB upsert、手動登録対応）

**CPH計算** (`src/lib/utils/cph.ts`):
- `calculateCPH()` - 個別ゲームのCPH計算
- `calculateAverageCPH()` - 平均CPH計算
- `getDisplayRank()` - ステータスに応じた表示ランク決定（Premium/LossCut対応）
- `getRankProgress()` - ランク内進捗率計算（RPG経験値バー風）
- `getNextRankInfo()` - 次のランクまでの情報取得
- `getCPHMetaphor()` - ランク別メタファー取得
- `getStockColor()` - ランク別カラー/アイコン取得
- `formatPlayTime()` - プレイ時間フォーマット（1.0時間→1時間）

**もしも換算（Market Insight）** (`src/lib/utils/profit.ts`):
ゲーマーの「実質無料」理論を可視化するウィジェット。一般的な娯楽（映画、カラオケ、飲み会）の平均コスト ¥1,000/時間 と比較して、ゲームがいかにお得かを表示。

- `STANDARD_ENTERTAINMENT_RATE` - 基準単価（¥1,000/時間）
- `CONVERSION_ITEMS` - 換算アイテム8種類（ラーメン、ガチャ、ビール等）
- `calculateMarketInsight()` - 含み益/投資状態を計算

**計算式**:
```
仮想コスト = 総プレイ時間 × ¥1,000/h
含み益 = 仮想コスト - 総支出
元を取るまでの残り時間 = |含み益| ÷ ¥1,000/h
```

**表示状態**:
| 状態 | 条件 | テーマカラー | 表示内容 |
|------|------|------------|---------|
| 勝ち (profit) | 支出 < 仮想コスト | 🟢 エメラルド | `+¥X,XXX お得` + 換算アイテム |
| 先行投資中 (investing) | 支出 > 仮想コスト | 🔵 ブルー | `差額: -¥X,XXX` + 残り時間 |

**換算アイテム（日替わりランダム）**:
| アイコン | アイテム | 単価 |
|---------|---------|------|
| 🍜 | ラーメン | ¥900 |
| 🥤 | スタバのフラペチーノ | ¥700 |
| 💎 | 10連ガチャ | ¥3,000 |
| 🍺 | 生ビール | ¥500 |
| 🎬 | 映画鑑賞 | ¥1,900 |
| 🥢 | うまい棒 | ¥12 |
| ☕ | コンビニコーヒー | ¥150 |
| 📺 | Netflix 1ヶ月 | ¥990 |

**UI構造（VS天秤スタイル）**:
- 左側: 一般的な娯楽（グレー、赤線で否定）
- 中央: VS バッジ
- 右側: GameScope/ユーザー（勝ち=エメラルド、投資中=ブルー）
- フッター: 換算メッセージまたは残り時間表示

**プラットフォーム選択** (`src/constants/platforms.ts`):
- `PLATFORM_MASTER` - 固定リスト方式（8種類）
  - pc, ps5, ps4, switch, xbox-series, xbox-one, smartphone, retro
- `getPlatformById()`, `getPlatformIcon()`, `getPlatformName()` - ヘルパー関数
- RAWGプラットフォームからの自動マッチング機能（初期選択補助）
- 設計ドキュメント: `docs/platform-selection-design.md`

**CPHランク定義**:
| ランク | CPH範囲 | メタファー | アイコン |
|--------|---------|-----------|---------|
| 💎 God Tier | 0〜50円 | 実質無料 | 🏆 |
| 🥇 Gold Tier | 51〜200円 | 缶コーヒー級 | 📉 |
| 🥈 Silver Tier | 201〜500円 | ランチ級 | 📉 |
| 🥉 Bronze Tier | 501〜1500円 | 映画館級 | 📉 |
| 💸 Luxury | 1501円〜 | 元が取れていません | 📉 |
| 🍷 Premium | Luxury + Completed | 極上の体験 | ✨ |
| 📉 Loss Cut | Luxury + Dropped | 損切り | 📉 |
| 🎁 Free | サブスク/無料 | 完全無料 | 🎁 |
| 📦 Unplayed | 未プレイ | 未開封 | 📦 |

**CPH Density Rule（濃密ゲーム救済ルール）**:
- 高単価（Luxury）でも「クリア済み」なら**Premium（紫色）**に昇格
- 高単価で「やめた」なら**Loss Cut（暗い赤）**で損切り扱い
- 両ケースでプログレスバー非表示（これ以上遊ぶ必要がない）
- 設計ドキュメント: `docs/cph-density-rule-design.md`

**ダッシュボードUI（投資アプリ風）**:
- キャッチコピー: 「遊べば遊ぶほど安くなる。目指せ『💎 実質無料』！」
- 平均時間単価カード + ランク表ツールチップ（?ボタン）
- **もしも換算ウィジェット**: 一般娯楽 vs GameScope の VS構造バナー
- CPHカラーコーディング（緑=良い、赤=悪い）
- RPG経験値バー風プログレスバー（次のランクまでの進捗表示）
- 📉アイコン（遊ぶほど下がるポジティブ表現）

**無料プラン制限**:
- ゲーム登録上限: **3タイトル**まで
- 4つ目以降は有料プラン（未実装）
- 上限到達時: 🔒「無料プランの上限に達しました」モーダル表示
- 実装: `AddGameButton.tsx` の `FREE_TIER_LIMIT` 定数

**本番環境のログイン制限**:
- localhost: 通常のGoogleログイン可能（開発用）
- 本番環境: 🚧「現在開発中です」モーダル表示
- Google Cloud Console設定完了後に本番ログイン有効化予定
- 実装: `LoginButton.tsx` の `isDevelopment()` 関数

## 参考資料

- [REQUIREMENTS.md](./REQUIREMENTS.md) - Phase 1 要件定義書
- [docs/REQUIREMENTS_PHASE2.md](./docs/REQUIREMENTS_PHASE2.md) - Phase 2 (Gaming ROI) 要件定義書
- [docs/tickets/](./docs/tickets/) - 機能別開発チケット
- [docs/自動更新システム.md](./docs/自動更新システム.md) - 運用ドキュメント
- [docs/platform-selection-design.md](./docs/platform-selection-design.md) - プラットフォーム選択設計
- [docs/cph-density-rule-design.md](./docs/cph-density-rule-design.md) - CPH Density Rule設計
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
