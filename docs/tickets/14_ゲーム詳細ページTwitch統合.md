# 14_ゲーム詳細ページTwitch統合

**ステータス**: [完了]
**優先度**: 高
**Phase**: Phase 2.5 (Twitch連携 - 統合)

## 概要

ticket 06で実装したゲーム詳細ページに、Twitch関連機能（ライブ配信、クリップ）を統合する。ゲーム情報とTwitchコンテンツをシームレスに表示。

## 目的

- ゲーム詳細ページにTwitchセクションを追加
- ライブ配信とクリップの表示
- Twitch Game IDの自動マッピング
- 配信がない場合の適切なフォールバック

## タスク一覧

### 1. Twitch Game ID マッピング
- [x] gamesテーブルにtwitch_game_idカラム追加
- [x] 英語タイトルからTwitch IDを取得
- [x] キャッシュ機構の実装

### 2. ゲーム詳細ページ更新
- [x] Twitchセクションの追加
- [x] タブUIの実装（概要/配信/クリップ）
- [x] Suspense を使った段階的読み込み

### 3. データ取得最適化
- [x] Server Component でのTwitch ID取得
- [x] Client Component での配信・クリップ表示
- [x] エラーハンドリングの実装

### 4. UX改善
- [x] ライブ配信バッジの表示
- [x] 配信がない場合の代替コンテンツ
- [x] モバイル対応の確認

## 実装詳細

### データベーススキーマ更新

```sql
-- gamesテーブルにTwitch関連カラム追加
ALTER TABLE games
ADD COLUMN IF NOT EXISTS twitch_game_id TEXT,
ADD COLUMN IF NOT EXISTS twitch_last_checked_at TIMESTAMPTZ;

-- インデックス追加
CREATE INDEX IF NOT EXISTS idx_games_twitch_game_id
  ON games(twitch_game_id);

-- コメント追加
COMMENT ON COLUMN games.twitch_game_id IS 'Twitch API Game ID';
COMMENT ON COLUMN games.twitch_last_checked_at IS 'Twitch ID 最終確認日時';
```

### lib/api/game-twitch.ts (新規作成)

```typescript
import { createClient } from '@/lib/supabase/server'
import { getTwitchGameId } from './twitch'

/**
 * ゲームのTwitch Game IDを取得（キャッシュ優先）
 * 1. データベースからキャッシュを確認
 * 2. なければTwitch APIから取得してキャッシュ
 */
export async function getGameTwitchId(gameId: string): Promise<string | null> {
  const supabase = await createClient()

  // データベースからキャッシュを確認
  const { data: game } = await supabase
    .from('games')
    .select('twitch_game_id, twitch_last_checked_at, title_en')
    .eq('id', gameId)
    .single()

  if (!game) return null

  // キャッシュが1週間以内なら再利用
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  if (
    game.twitch_game_id &&
    game.twitch_last_checked_at &&
    new Date(game.twitch_last_checked_at) > oneWeekAgo
  ) {
    return game.twitch_game_id
  }

  // Twitch APIから取得
  const twitchGameId = await getTwitchGameId(game.title_en)

  // データベースに保存
  if (twitchGameId) {
    await supabase
      .from('games')
      .update({
        twitch_game_id: twitchGameId,
        twitch_last_checked_at: new Date().toISOString(),
      })
      .eq('id', gameId)
  }

  return twitchGameId
}

/**
 * ゲームにライブ配信があるか確認
 */
export async function hasLiveStreams(gameId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/twitch/streams/${gameId}?limit=1`,
      { next: { revalidate: 300 } } // 5分キャッシュ
    )

    if (!response.ok) return false

    const data = await response.json()
    return data.count > 0
  } catch {
    return false
  }
}
```

### app/game/[id]/page.tsx (更新)

```typescript
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getGameTwitchId, hasLiveStreams } from '@/lib/api/game-twitch'
import GameInfo from '@/app/components/GameInfo'
import TwitchSection from '@/app/components/TwitchSection'
import LoadingSpinner from '@/app/components/LoadingSpinner'

export default async function GamePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // ゲーム基本情報を取得
  const { data: game, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !game) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-danger">ゲームが見つかりませんでした</p>
      </div>
    )
  }

  // Twitch Game ID を取得（サーバーサイド、キャッシュ優先）
  const twitchGameId = await getGameTwitchId(id)

  // ライブ配信の有無を確認
  const isLive = twitchGameId ? await hasLiveStreams(twitchGameId) : false

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ゲーム基本情報 */}
      <GameInfo game={game} isLive={isLive} />

      {/* Twitch セクション（配信がある場合のみ） */}
      {twitchGameId && (
        <Suspense
          fallback={
            <div className="mt-8 p-8 bg-gray-800/50 rounded-lg">
              <div className="flex justify-center">
                <LoadingSpinner size="md" />
              </div>
            </div>
          }
        >
          <TwitchSection
            gameId={id}
            twitchGameId={twitchGameId}
            gameName={game.title_ja}
          />
        </Suspense>
      )}

      {/* その他のセクション（レビュー、スコアなど） */}
    </div>
  )
}
```

### app/components/TwitchSection.tsx (新規作成)

```typescript
'use client'

import { useState } from 'react'
import TwitchStreamList from './TwitchStreamList'
import TwitchClipGallery from './TwitchClipGallery'

interface TwitchSectionProps {
  gameId: string
  twitchGameId: string
  gameName: string
}

type TabType = 'streams' | 'clips'

/**
 * Twitch セクション
 * ライブ配信とクリップをタブで切り替え表示
 */
export default function TwitchSection({
  gameId,
  twitchGameId,
  gameName,
}: TwitchSectionProps) {
  const [activeTab, setActiveTab] = useState<TabType>('streams')

  return (
    <section className="mt-8">
      {/* セクションヘッダー */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          Twitch 配信・クリップ
        </h2>
        <p className="text-text-secondary">
          {gameName} のライブ配信と人気クリップをチェック
        </p>
      </div>

      {/* タブナビゲーション */}
      <div className="flex gap-2 mb-6 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('streams')}
          className={`px-6 py-3 font-semibold transition-colors relative
            ${activeTab === 'streams'
              ? 'text-accent'
              : 'text-text-secondary hover:text-text-primary'
            }`}
        >
          ライブ配信
          {activeTab === 'streams' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('clips')}
          className={`px-6 py-3 font-semibold transition-colors relative
            ${activeTab === 'clips'
              ? 'text-accent'
              : 'text-text-secondary hover:text-text-primary'
            }`}
        >
          人気クリップ
          {activeTab === 'clips' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
          )}
        </button>
      </div>

      {/* タブコンテンツ */}
      <div className="bg-gray-800/30 rounded-lg p-6">
        {activeTab === 'streams' ? (
          <TwitchStreamList gameId={twitchGameId} limit={5} />
        ) : (
          <TwitchClipGallery gameId={twitchGameId} limit={12} days={7} />
        )}
      </div>

      {/* Twitch リンク */}
      <div className="mt-4 text-center">
        <a
          href={`https://www.twitch.tv/directory/game/${encodeURIComponent(gameName)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-accent hover:underline"
        >
          Twitch で {gameName} を見る →
        </a>
      </div>
    </section>
  )
}
```

### app/components/GameInfo.tsx (更新)

```typescript
import Image from 'next/image'
import ScoreBadge from './ScoreBadge'
import type { Database } from '@/lib/supabase/types'

type Game = Database['public']['Tables']['games']['Row']

interface GameInfoProps {
  game: Game
  isLive?: boolean
}

/**
 * ゲーム基本情報コンポーネント
 * スコア、プラットフォーム、配信状況などを表示
 */
export default function GameInfo({ game, isLive = false }: GameInfoProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
      <div className="flex flex-col md:flex-row gap-6">
        {/* ゲーム画像 */}
        {game.image_url && (
          <div className="w-full md:w-64 flex-shrink-0">
            <Image
              src={game.image_url}
              alt={game.title_ja}
              width={256}
              height={256}
              className="rounded-lg w-full h-auto"
              priority
            />
          </div>
        )}

        {/* ゲーム情報 */}
        <div className="flex-1">
          {/* タイトルとライブバッジ */}
          <div className="flex items-start gap-3 mb-4">
            <h1 className="text-3xl font-bold text-text-primary flex-1">
              {game.title_ja}
            </h1>
            {isLive && (
              <div className="flex items-center gap-2 px-3 py-1 bg-danger/20 border border-danger rounded-full">
                <div className="w-2 h-2 bg-danger rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-danger">LIVE</span>
              </div>
            )}
          </div>

          {/* 英語タイトル */}
          {game.title_en && (
            <p className="text-lg text-text-secondary mb-4">{game.title_en}</p>
          )}

          {/* スコアとプラットフォーム */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <ScoreBadge score={game.metascore} size="lg" />

            <div className="flex flex-wrap gap-2">
              {game.platforms?.map((platform) => (
                <span
                  key={platform}
                  className="px-3 py-1 bg-gray-700/50 rounded text-sm"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>

          {/* 説明 */}
          {game.description && (
            <p className="text-text-secondary leading-relaxed">
              {game.description}
            </p>
          )}

          {/* リンク */}
          {game.opencritic_url && (
            <div className="mt-6">
              <a
                href={game.opencritic_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                OpenCritic で詳細を見る →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

### 環境変数追加 (.env.local)

```env
# サイトURL（Twitch API呼び出し用）
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## データ移行スクリプト

既存ゲームデータに対してTwitch Game IDを一括取得するスクリプト（オプション）:

```typescript
// scripts/sync-twitch-ids.ts
import { createClient } from '@supabase/supabase-js'
import { getTwitchGameId } from '../src/lib/api/twitch'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function syncTwitchIds() {
  const { data: games } = await supabase
    .from('games')
    .select('id, title_en')
    .is('twitch_game_id', null)

  if (!games) return

  console.log(`Processing ${games.length} games...`)

  for (const game of games) {
    const twitchGameId = await getTwitchGameId(game.title_en)

    if (twitchGameId) {
      await supabase
        .from('games')
        .update({
          twitch_game_id: twitchGameId,
          twitch_last_checked_at: new Date().toISOString(),
        })
        .eq('id', game.id)

      console.log(`✓ ${game.title_en}: ${twitchGameId}`)
    } else {
      console.log(`✗ ${game.title_en}: Not found`)
    }

    // レート制限対策（1秒待機）
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  console.log('Sync complete!')
}

syncTwitchIds()
```

## 完了条件

- [ ] gamesテーブルにtwitch_game_idカラムが追加されている
- [ ] getGameTwitchId関数がキャッシュ優先で動作する
- [ ] ゲーム詳細ページにTwitchセクションが表示される
- [ ] ライブ配信とクリップがタブで切り替え可能
- [ ] 配信中のゲームにLIVEバッジが表示される
- [ ] 配信がない場合の適切なフォールバックが実装されている

## 関連チケット

- 前: `13_Twitch埋め込みコンポーネント実装.md`
- 依存: `06_ゲーム詳細ページ実装.md`

## 参考資料

- [Next.js Suspense Documentation](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming#streaming-with-suspense)
- [React Suspense for Data Fetching](https://react.dev/reference/react/Suspense)

## 注意事項

- Twitch Game IDが見つからないゲームは Twitch セクションを非表示に
- キャッシュ戦略: データベース（1週間）→ API（5分）
- Server Component で ID取得、Client Component で配信表示
- `NEXT_PUBLIC_SITE_URL` は本番デプロイ時に Vercel の環境変数で設定
- LIVEバッジは目立つようアニメーション付き
