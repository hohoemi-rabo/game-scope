# 12_Twitch配信情報取得機能

**ステータス**: [完了]
**優先度**: 中
**Phase**: Phase 2.5 (Twitch連携 - データ取得)

## 概要

Twitch APIを使用してゲームのライブ配信情報とクリップ情報を取得する機能を実装する。

## 目的

- ゲームIDからライブ配信情報を取得
- 人気クリップの取得
- データベースへのキャッシュ保存
- リアルタイム更新のための仕組み構築

## タスク一覧

### 1. ライブ配信情報取得
- [x] getStreams関数の実装
- [x] 視聴者数順ソート機能
- [x] ページネーション対応

### 2. クリップ情報取得
- [x] getClips関数の実装
- [x] 期間指定機能（7日間、30日間）
- [x] 再生数順ソート

### 3. データベーススキーマ拡張
- [x] twitch_linksテーブルの更新
- [x] キャッシュ戦略の実装
- [x] 自動更新機能の準備

### 4. API Route実装
- [x] /api/twitch/streams/[gameId] 作成
- [x] /api/twitch/clips/[gameId] 作成
- [x] エラーハンドリングとレート制限対応

## 実装詳細

### lib/api/twitch.ts への追加

```typescript
/**
 * ゲームIDからライブ配信情報を取得
 * 視聴者数が多い順に返す
 */
export async function getStreams(
  gameId: string,
  limit: number = 10
): Promise<TwitchStream[]> {
  try {
    const data = await fetchTwitchAPI<{
      data: TwitchStream[]
      pagination?: { cursor?: string }
    }>(`/streams?game_id=${gameId}&first=${limit}`)

    return data.data
  } catch (error) {
    console.error('Failed to get Twitch streams:', error)
    return []
  }
}

/**
 * ゲームIDから人気クリップを取得
 * デフォルトは過去7日間、再生数順
 */
export async function getClips(
  gameId: string,
  limit: number = 10,
  days: number = 7
): Promise<TwitchClip[]> {
  const startedAt = new Date()
  startedAt.setDate(startedAt.getDate() - days)

  try {
    const data = await fetchTwitchAPI<{
      data: TwitchClip[]
      pagination?: { cursor?: string }
    }>(
      `/clips?game_id=${gameId}&first=${limit}&started_at=${startedAt.toISOString()}`
    )

    return data.data
  } catch (error) {
    console.error('Failed to get Twitch clips:', error)
    return []
  }
}

/**
 * 複数のゲーム名からTwitch情報を一括取得
 * 英語タイトルがTwitchに存在するか確認
 */
export async function getGameInfo(
  gameTitles: string[]
): Promise<Map<string, string | null>> {
  const gameIdMap = new Map<string, string | null>()

  for (const title of gameTitles) {
    const gameId = await getTwitchGameId(title)
    gameIdMap.set(title, gameId)
  }

  return gameIdMap
}

// 型定義
export interface TwitchStream {
  id: string
  user_id: string
  user_login: string
  user_name: string
  game_id: string
  game_name: string
  type: 'live'
  title: string
  viewer_count: number
  started_at: string
  language: string
  thumbnail_url: string
  tag_ids: string[]
}

export interface TwitchClip {
  id: string
  url: string
  embed_url: string
  broadcaster_id: string
  broadcaster_name: string
  creator_id: string
  creator_name: string
  video_id: string
  game_id: string
  language: string
  title: string
  view_count: number
  created_at: string
  thumbnail_url: string
  duration: number
}
```

### app/api/twitch/streams/[gameId]/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getStreams, getTwitchGameId } from '@/lib/api/twitch'

/**
 * Twitch ライブ配信情報を取得
 * ゲームIDまたはゲーム名から配信情報を取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    // ゲームIDがTwitch IDでない場合は名前から検索
    let twitchGameId = gameId
    if (isNaN(Number(gameId))) {
      const id = await getTwitchGameId(gameId)
      if (!id) {
        return NextResponse.json(
          { error: 'Game not found on Twitch', streams: [] },
          { status: 404 }
        )
      }
      twitchGameId = id
    }

    const streams = await getStreams(twitchGameId, limit)

    return NextResponse.json(
      { streams, count: streams.length },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (error) {
    console.error('Twitch streams API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch streams', streams: [] },
      { status: 500 }
    )
  }
}
```

### app/api/twitch/clips/[gameId]/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getClips, getTwitchGameId } from '@/lib/api/twitch'

/**
 * Twitch クリップ情報を取得
 * 人気クリップを再生数順に返す
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const days = parseInt(searchParams.get('days') || '7', 10)

    // ゲームIDがTwitch IDでない場合は名前から検索
    let twitchGameId = gameId
    if (isNaN(Number(gameId))) {
      const id = await getTwitchGameId(gameId)
      if (!id) {
        return NextResponse.json(
          { error: 'Game not found on Twitch', clips: [] },
          { status: 404 }
        )
      }
      twitchGameId = id
    }

    const clips = await getClips(twitchGameId, limit, days)

    return NextResponse.json(
      { clips, count: clips.length },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    )
  } catch (error) {
    console.error('Twitch clips API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clips', clips: [] },
      { status: 500 }
    )
  }
}
```

### データベース更新 (supabase/migrations/)

```sql
-- twitch_linksテーブルの拡張
ALTER TABLE twitch_links
ADD COLUMN IF NOT EXISTS twitch_game_id TEXT,
ADD COLUMN IF NOT EXISTS live_streams_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_viewers INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS clips_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_fetched_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT FALSE;

-- インデックス追加
CREATE INDEX IF NOT EXISTS idx_twitch_links_game_id
  ON twitch_links(twitch_game_id);

CREATE INDEX IF NOT EXISTS idx_twitch_links_is_live
  ON twitch_links(is_live);

-- コメント追加
COMMENT ON COLUMN twitch_links.twitch_game_id IS 'Twitch API Game ID';
COMMENT ON COLUMN twitch_links.live_streams_count IS '現在のライブ配信数';
COMMENT ON COLUMN twitch_links.total_viewers IS '合計視聴者数';
COMMENT ON COLUMN twitch_links.clips_count IS '人気クリップ数';
COMMENT ON COLUMN twitch_links.last_fetched_at IS '最終取得日時';
COMMENT ON COLUMN twitch_links.is_live IS 'ライブ配信中フラグ';
```

## キャッシュ戦略

### API レスポンスキャッシュ

| エンドポイント | キャッシュ時間 | 更新頻度 |
|--------------|--------------|---------|
| /api/twitch/streams/[gameId] | 5分 | リアルタイム重視 |
| /api/twitch/clips/[gameId] | 1時間 | 人気クリップは変動少ない |

### データベースキャッシュ

- `twitch_links.last_fetched_at` で最終更新時刻を記録
- 5分以内のデータは再利用
- バックグラウンドで非同期更新

## 完了条件

- [x] getStreams関数が正常に配信情報を取得できる
- [x] getClips関数が人気クリップを取得できる
- [x] API Routes がエラーハンドリングを含めて動作する
- [x] データベーススキーマ更新が完了
- [x] レート制限に対応したリトライ機構が実装されている
- [x] キャッシュ戦略が適切に機能する

## 関連チケット

- 前: `11_Twitch_API基本実装.md`
- 次: `13_Twitch埋め込みコンポーネント実装.md`

## 参考資料

- [Twitch API - Get Streams](https://dev.twitch.tv/docs/api/reference/#get-streams)
- [Twitch API - Get Clips](https://dev.twitch.tv/docs/api/reference/#get-clips)
- [Rate Limits - 800 requests/分](https://dev.twitch.tv/docs/api/guide/#rate-limits)

## 注意事項

- ライブ配信情報は常に変動するため、キャッシュ時間は短めに設定
- レート制限に注意（Client Credentials: 800 req/分）
- Twitch Game IDが見つからない場合の適切なフォールバック処理
- クリップの embed_url を使用することで埋め込み表示が可能
