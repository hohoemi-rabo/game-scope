# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**GameScope（ゲームスコープ）** - 日本語で話題のゲームの評判と雰囲気が3秒でわかるゲーム情報サイト

### コンセプト
海外中心のゲーム評価データ(OpenCritic, Twitch, Steam等)を日本語でわかりやすく可視化し、一般ゲーマーに対して直感的かつ迅速に「どんなゲームか」を理解できる体験を提供する。

### 開発段階
- 現在: MVP (Minimum Viable Product) 段階
- プロトタイプから本番環境へ移行する過程
- Claude Code でのペアプログラミングを前提とした開発

## 技術スタック

- **Next.js 15** (App Router, Turbopack)
- **React 19**
- **TypeScript** (strict mode)
- **Tailwind CSS 3.4.17** (カスタムカラーシステム)
- **Supabase** (Database, Edge Functions, Scheduler) - MCP Server統合
- **Vercel** (デプロイ予定)

## 重要な開発コマンド

```bash
# 開発サーバー起動 (Turbopack使用)
npm run dev

# プロダクションビルド (Turbopack使用)
npm run build

# プロダクションサーバー起動
npm start

# ESLintによる静的解析
npm run lint

# Supabase 型定義の生成 (データベーススキーマから自動生成)
npm run supabase:types

# 初期データ投入 (開発環境)
npm run seed
```

開発サーバーは http://localhost:3000 で起動します。

## アーキテクチャ構造

### ディレクトリ設計

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # トップページ (高評価ゲーム一覧) ✅
│   ├── layout.tsx                # ルートレイアウト (Header/Footer含む) ✅
│   ├── loading.tsx               # ローディング UI ✅
│   ├── error.tsx                 # エラー境界 ✅
│   ├── globals.css               # グローバルスタイル ✅
│   ├── game/[id]/
│   │   └── page.tsx              # ゲーム詳細ページ (未実装)
│   ├── releases/
│   │   └── page.tsx              # 発売予定タブ (Phase 2)
│   ├── api/                      # API Routes (Phase 2以降)
│   └── components/               # UI コンポーネント
│       ├── GameCard.tsx          # ゲームカードコンポーネント ✅
│       ├── GameGrid.tsx          # ゲーム一覧グリッド ✅
│       ├── ScoreBadge.tsx        # スコア表示バッジ ✅
│       ├── Container.tsx         # コンテンツ幅制限 ✅
│       ├── LoadingSpinner.tsx    # ローディングスピナー ✅
│       ├── Header.tsx            # ヘッダー ✅
│       └── Footer.tsx            # フッター ✅
│
├── lib/                          # ビジネスロジック・ユーティリティ
│   ├── supabase/
│   │   ├── server.ts             # Server Components 用クライアント ✅
│   │   ├── client.ts             # Client Components 用クライアント ✅
│   │   └── types.ts              # データベース型定義 (自動生成) ✅
│   └── api/                      # 外部API連携 (Phase 2以降)
│       ├── opencritic.ts         # OpenCritic API
│       ├── twitch.ts             # Twitch API
│       └── rss.ts                # RSS フィード取得
│
supabase/                         # Supabase プロジェクト設定
├── migrations/                   # データベースマイグレーション ✅
└── functions/                    # Edge Functions (Phase 3)

docs/                             # 開発ドキュメント
├── tickets/                      # 機能別開発チケット ✅
└── troubleshooting/              # エラー解決記録
```

### データフロー

1. **外部API → Supabase (キャッシュ) → Next.js → ユーザー**
   - コスト削減のため、Supabaseをキャッシュ層として活用
   - 日次自動更新 (Supabase Scheduler)

2. **データソース**
   - OpenCritic API: ゲームスコア・レビュー
   - Twitch API: 配信情報・クリップ
   - Steam Web API: 海外発売予定
   - RSS (4Gamer/任天堂/PS Blog): 国内発売予定

## TypeScript 設定の重要ポイント

- **Path Alias**: `@/*` は `./src/*` を指す
- **Strict Mode**: 有効化されているため型安全性が重要
- **Module Resolution**: `bundler` (Next.js 15対応)
- **JSX**: `preserve` (Next.js がトランスパイル)

## デザインシステム

### カラーパレット (REQUIREMENTS.md より)

```css
:root {
  --bg-primary: #0e0e10;    /* ブラックグレー */
  --accent: #5865f2;        /* ブルーバイオレット */
  --success: #00c896;       /* エメラルドグリーン (スコア80+) */
  --warning: #ffb300;       /* アンバー (スコア60-79) */
  --danger: #ff5252;        /* コーラルレッド (スコア59以下) */
  --text-primary: #f2f2f2;  /* ホワイト */
  --text-secondary: #9e9e9e;/* グレー */
}
```

### フォント設定

- **Geist Sans**: メインフォント (Vercel提供)
- **Geist Mono**: コードフォント
- **日本語**: Noto Sans JP (導入予定)
- **数値**: Roboto Mono (導入予定)

### レスポンシブデザイン

- モバイルファースト設計
- ブレークポイント: 767px (1列/2列切り替え)
- Tailwindのユーティリティクラスを活用

## データベース設計

### 主要テーブル (REQUIREMENTS.md より)

1. **games** - ゲーム情報
   - タイトル (日本語/英語)
   - プラットフォーム、メタスコア、レビュー数
   - OpenCritic ID (外部キー)

2. **twitch_links** - Twitch連携情報
   - クリップURL、ライブ配信状況、視聴者数

3. **releases** - 発売予定情報
   - タイトル、プラットフォーム、発売日、情報ソース

4. **operation_logs** - 操作ログ
   - 自動更新の実行記録、エラートラッキング

## 開発時の注意事項

### MVP段階での優先事項

1. **段階的な実装**: Phase 1 → Phase 2 → Phase 3 の順で実装
2. **Phase 1 (MVP 必須機能)**:
   - トップページ (高評価ゲーム一覧)
   - ゲーム詳細ページ
   - Supabase 初期データ投入 (20件)
3. **Phase 2以降は明示的な指示があるまで実装しない**

### コーディング規約

- **コメント**: 日本語でのコメント推奨 (「なぜ」を説明)
- **型定義**: TypeScript strict mode に対応
- **コンポーネント**: 単一責任の原則に従う
- **エラーハンドリング**: 外部API呼び出しは必ず try-catch で囲む

### セキュリティ・法的遵守

- **スクレイピング禁止**: すべてのデータは公式API/RSS経由で取得
- **出典明示**: 外部データには必ず出典リンクを表示
- **環境変数管理**: APIキーは `.env.local` で管理 (コミット禁止)

### エラー解決の記録

- 問題解決時は `docs/troubleshooting/` に記録を残す
- 再発防止のため、原因と解決方法を明記

### チケット管理

機能別のチケットは `docs/tickets/` に配置されています。開発を始める前に必ず該当チケットを確認してください。

**チケット構成:**
- ファイル名: `連番_機能名.md` の形式（例: `01_データベーススキーマ作成.md`）
- 各チケットには以下が含まれます:
  - ステータス、優先度、Phase
  - 概要と目的
  - タスク一覧（チェックリスト形式）
  - 実装詳細（具体的なコード例）
  - 完了条件
  - 関連チケット（前後のチケットへのリンク）

**チケット内のTodo管理:**
- 未完了: `- [ ] タスク名`
- 完了: `- [x] タスク名`

**チケットのステータス:**
- `[未着手]`: まだ作業を開始していない
- `[進行中]`: 現在作業中
- `[完了]`: 実装とテストが完了
- `[保留]`: 何らかの理由でブロックされている

**開発チケット一覧:**

**Phase 1 (MVP - 必須機能):**
- `00_環境セットアップ.md` - プロジェクト初期化、Supabase設定 ✅
- `01_データベーススキーマ作成.md` - テーブル定義、RLS設定 ✅
- `02_Supabaseクライアント設定.md` - Server/Client用クライアント実装 ✅
- `03_デザインシステム実装.md` - Tailwind設定、共通コンポーネント ✅
- `04_ゲームカードコンポーネント.md` - GameCard/GameGrid実装 ✅
- `05_トップページ実装.md` - 高評価ゲーム一覧ページ ✅
- `06_ゲーム詳細ページ実装.md` - 動的ルーティング、詳細表示 (次のタスク)
- `07_初期データ投入.md` - テストデータ20件投入 (必須)

**Phase 2 (UX拡張):**
- `08_検索機能実装.md` - リアルタイム検索、フィルター
- `09_発売予定タブ実装.md` - RSSフィード取得、一覧表示

**Phase 3 (運用自動化):**
- `10_自動更新システム.md` - Edge Functions、Cron Jobs

## 環境変数 (.env.local)

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

## Next.js 15 App Router ベストプラクティス

### Server Components vs Client Components

**デフォルトは Server Components**
- `app/` ディレクトリ内のコンポーネントは、デフォルトで Server Components
- データフェッチング、データベースアクセス、環境変数アクセスはサーバーで実行
- Client Components は `'use client'` ディレクティブで明示的に宣言

**使い分けの基準:**

```typescript
// ✅ Server Component (デフォルト) - データフェッチングに最適
export default async function GameList() {
  const games = await fetch('https://api.example.com/games', {
    cache: 'force-cache' // 静的キャッシュ
  })
  const data = await games.json()

  return <div>{/* ... */}</div>
}

// ✅ Client Component - インタラクティブな操作が必要な場合
'use client'

import { useState } from 'react'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  // onClick, onChange などのイベントハンドラが必要
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />
}
```

### データフェッチング戦略

#### 1. Server Components での fetch (推奨)

```typescript
// Static Data (SSG相当) - デフォルト動作
const staticData = await fetch('https://...', {
  cache: 'force-cache' // 省略可能
})

// Dynamic Data (SSR相当) - リクエストごとに取得
const dynamicData = await fetch('https://...', {
  cache: 'no-store'
})

// ISR相当 - 一定時間キャッシュして再検証
const revalidatedData = await fetch('https://...', {
  next: { revalidate: 3600 } // 1時間ごとに再検証
})
```

#### 2. データベース直接アクセス (Supabase)

```typescript
// lib/supabase/server.ts
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
    .limit(20)

  if (error) throw error
  return data
}

// app/page.tsx (Server Component)
import { getGames } from '@/lib/supabase/server'

export default async function HomePage() {
  const games = await getGames()
  return <GameGrid games={games} />
}
```

#### 3. Client Components でのデータフェッチング (SWR 推奨)

```typescript
'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function LiveStreamStatus({ gameId }: { gameId: string }) {
  const { data, error, isLoading } = useSWR(
    `/api/twitch/live/${gameId}`,
    fetcher,
    { refreshInterval: 30000 } // 30秒ごとに再検証
  )

  if (isLoading) return <div>読み込み中...</div>
  if (error) return <div>エラーが発生しました</div>

  return <div>{data.viewerCount} 人が視聴中</div>
}
```

### データの受け渡しパターン

#### Server → Client へのプロップス渡し

```typescript
// app/game/[id]/page.tsx (Server Component)
import { getGame } from '@/lib/supabase/server'
import GameDetails from '@/app/components/GameDetails'

export default async function GamePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const game = await getGame(id)

  // ✅ Client Component に必要なデータのみを渡す
  return <GameDetails
    title={game.title_ja}
    score={game.metascore}
    platforms={game.platforms}
  />
}

// app/components/GameDetails.tsx (Client Component)
'use client'

interface GameDetailsProps {
  title: string
  score: number
  platforms: string[]
}

export default function GameDetails({ title, score, platforms }: GameDetailsProps) {
  // インタラクティブな処理
  return <div>{/* ... */}</div>
}
```

### Suspense とストリーミング

```typescript
import { Suspense } from 'react'

export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <>
      <GameHeader id={params.id} /> {/* 高速表示 */}

      <Suspense fallback={<div>レビューを読み込み中...</div>}>
        <GameReviews id={params.id} /> {/* 遅延読み込み */}
      </Suspense>

      <Suspense fallback={<div>配信情報を読み込み中...</div>}>
        <TwitchStream id={params.id} /> {/* 遅延読み込み */}
      </Suspense>
    </>
  )
}
```

### React の cache() でメモ化

```typescript
// lib/data.ts
import { cache } from 'react'
import 'server-only' // Client で実行されないことを保証

export const getGame = cache(async (id: string) => {
  // 同一リクエスト内で複数回呼ばれても1回だけ実行される
  const supabase = createClient(...)
  const { data } = await supabase
    .from('games')
    .select('*')
    .eq('id', id)
    .single()

  return data
})

// 複数のコンポーネントで呼んでも重複リクエストなし
// app/game/[id]/page.tsx
const game = await getGame(id) // 1回目の実行

// app/game/[id]/header.tsx
const game = await getGame(id) // キャッシュから取得
```

### セキュリティベストプラクティス

#### ❌ アンチパターン: 全データの露出

```typescript
// 危険: ユーザーデータ全体を Client Component に渡す
export async function Page({ params }) {
  const user = await db.user.findUnique({ where: { id: params.id } })
  return <Profile user={user} /> // ❌ 全フィールドが公開される
}
```

#### ✅ 推奨: 必要なデータのみを渡す

```typescript
// 安全: 必要な情報だけを抽出
export async function Page({ params }) {
  const user = await db.user.findUnique({ where: { id: params.id } })

  return <Profile
    name={user.name}
    avatar={user.avatar}
    // ✅ email, password hash などは渡さない
  />
}
```

#### 環境変数の扱い

```typescript
// ✅ Server Component / API Route でのみアクセス可能
const apiKey = process.env.OPENCRITIC_API_KEY // サーバーのみ

// ✅ Client でもアクセス可能 (NEXT_PUBLIC_ プレフィックス)
const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
```

### キャッシング戦略の選択

| ユースケース | 戦略 | コード例 |
|------------|------|---------|
| 静的コンテンツ | force-cache | `{ cache: 'force-cache' }` |
| リアルタイム情報 | no-store | `{ cache: 'no-store' }` |
| 定期更新 | revalidate | `{ next: { revalidate: 3600 } }` |
| ユーザー固有 | no-store | `{ cache: 'no-store' }` |

### このプロジェクトでの適用例

```typescript
// app/page.tsx - トップページ (高評価ゲーム)
export default async function HomePage() {
  // 1時間ごとに再検証 (ISR)
  const games = await fetch('/api/games/top', {
    next: { revalidate: 3600 }
  })

  return <GameGrid games={await games.json()} />
}

// app/game/[id]/page.tsx - ゲーム詳細
export default async function GamePage({ params }) {
  const { id } = await params

  // 基本情報: 静的キャッシュ
  const game = await getGame(id)

  return (
    <>
      <GameInfo game={game} />

      {/* Twitch ライブ配信: リアルタイム */}
      <Suspense fallback={<div>配信情報を確認中...</div>}>
        <TwitchLiveStream gameId={id} />
      </Suspense>
    </>
  )
}
```

## Context7 MCP との連携

Next.js 15 の最新ベストプラクティスや Supabase 統合パターンについては、Context7 MCPを活用して最新情報を取得すること。

## Supabase MCP Server の活用

プロジェクトには Supabase MCP Server が統合されており、以下の操作が可能:
- データベースマイグレーション実行
- SQL クエリ実行
- テーブル・拡張機能の一覧取得
- Edge Functions のデプロイ
- ログ取得とアドバイザー実行

## 開発ワークフロー

### 新機能の実装手順

1. **チケット確認**: `docs/tickets/` から該当するチケットを開く
2. **実装**: チケット内のタスク一覧に従って実装
3. **Todo更新**: 完了したタスクに `- [x]` をマーク
4. **Lint & Build**: `npm run lint && npm run build` で品質確認
5. **動作確認**: 開発サーバーで動作確認
6. **ステータス更新**: チケットのステータスを更新（`[進行中]` → `[完了]`）
7. **エラー記録**: 問題が発生した場合は `docs/troubleshooting/` に記録

### 現在の開発状況

Phase 1 (MVP) の進捗:
- ✅ 00-05: 環境構築からトップページまで完了
- 🚧 06: ゲーム詳細ページ (次のタスク)
- ⚠️ 07: 初期データ投入 (必須 - データがないとページが空)

**重要**: チケット07のデータ投入を完了しないと、トップページにゲームが表示されません。

### コードレビューのポイント

- Server Components と Client Components の使い分けが適切か
- 環境変数が適切に保護されているか（サーバー専用キーが漏洩していないか）
- TypeScript の型定義が厳密か
- エラーハンドリングが実装されているか
- Supabase RLS ポリシーが設定されているか
- Next.js Image コンポーネントで画像最適化されているか
- ISR (revalidate) が適切に設定されているか

## 参考資料

- [REQUIREMENTS.md](./REQUIREMENTS.md) - 詳細な要件定義書
- [docs/tickets/](./docs/tickets/) - 機能別開発チケット
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
