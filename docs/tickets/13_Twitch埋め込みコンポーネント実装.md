# 13_Twitch埋め込みコンポーネント実装

**ステータス**: [未着手]
**優先度**: 中
**Phase**: Phase 2.5 (Twitch連携 - UI実装)

## 概要

Twitchのライブ配信とクリップを埋め込むReactコンポーネントを実装する。Twitch Embed SDKを使用し、レスポンシブで使いやすいUIを提供。

## 目的

- Twitchライブ配信プレイヤーの埋め込み
- クリップギャラリーコンポーネント
- ライブ配信状況の表示
- モバイル対応とパフォーマンス最適化

## タスク一覧

### 1. Twitch Embed SDK 統合
- [ ] Twitch Player スクリプトの読み込み
- [ ] TypeScript型定義の作成
- [ ] useEffect でのプレイヤー初期化

### 2. ライブ配信コンポーネント
- [ ] TwitchLivePlayer コンポーネント作成
- [ ] ライブ配信リスト表示
- [ ] 視聴者数の表示
- [ ] オフライン時の適切な表示

### 3. クリップコンポーネント
- [ ] TwitchClipGallery コンポーネント作成
- [ ] クリップサムネイル表示
- [ ] モーダルでのクリップ再生
- [ ] 再生数・作成日の表示

### 4. スタイリングとUX
- [ ] Tailwind CSS でのレスポンシブデザイン
- [ ] ローディング状態の表示
- [ ] エラー状態の適切なハンドリング

## 実装詳細

### lib/hooks/useTwitchPlayer.ts

```typescript
'use client'

import { useEffect, useRef } from 'react'

// Twitch Embed Player の型定義
declare global {
  interface Window {
    Twitch?: {
      Player: new (elementId: string, options: TwitchPlayerOptions) => TwitchPlayer
    }
  }
}

interface TwitchPlayerOptions {
  width?: string | number
  height?: string | number
  channel?: string
  video?: string
  collection?: string
  autoplay?: boolean
  muted?: boolean
  time?: string
  parent?: string[]
}

interface TwitchPlayer {
  play(): void
  pause(): void
  setChannel(channel: string): void
  setVideo(videoId: string): void
  getMuted(): boolean
  setMuted(muted: boolean): void
  getVolume(): number
  setVolume(volume: number): void
  getPlaybackStats(): unknown
  addEventListener(event: string, callback: () => void): void
  removeEventListener(event: string, callback: () => void): void
}

/**
 * Twitch Player を初期化するカスタムフック
 */
export function useTwitchPlayer(
  channel: string | null,
  options: Partial<TwitchPlayerOptions> = {}
) {
  const playerRef = useRef<TwitchPlayer | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!channel || !containerRef.current) return

    // Twitch SDK スクリプトの動的読み込み
    const script = document.createElement('script')
    script.src = 'https://player.twitch.tv/js/embed/v1.js'
    script.async = true

    script.onload = () => {
      if (!window.Twitch || !containerRef.current) return

      // プレイヤー初期化
      playerRef.current = new window.Twitch.Player('twitch-player', {
        width: '100%',
        height: '100%',
        channel,
        autoplay: false,
        muted: false,
        parent: ['localhost', 'game-scope.vercel.app'], // 本番ドメイン追加必須
        ...options,
      })
    }

    document.body.appendChild(script)

    return () => {
      if (script.parentNode) {
        document.body.removeChild(script)
      }
    }
  }, [channel, options])

  return { playerRef, containerRef }
}
```

### app/components/TwitchLivePlayer.tsx

```typescript
'use client'

import { useTwitchPlayer } from '@/lib/hooks/useTwitchPlayer'

interface TwitchLivePlayerProps {
  channel: string
  viewerCount?: number
}

/**
 * Twitch ライブ配信プレイヤー
 * チャンネル名を指定してライブ配信を埋め込む
 */
export default function TwitchLivePlayer({
  channel,
  viewerCount,
}: TwitchLivePlayerProps) {
  const { containerRef } = useTwitchPlayer(channel)

  return (
    <div className="w-full">
      {/* 配信情報ヘッダー */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-danger rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-text-primary">
            LIVE
          </span>
          <span className="text-sm text-text-secondary">
            {channel}
          </span>
        </div>

        {viewerCount !== undefined && (
          <div className="text-sm text-text-secondary">
            👁 {viewerCount.toLocaleString()} 視聴中
          </div>
        )}
      </div>

      {/* プレイヤー埋め込みエリア */}
      <div
        ref={containerRef}
        id="twitch-player"
        className="w-full aspect-video bg-gray-900 rounded-lg overflow-hidden"
      />
    </div>
  )
}
```

### app/components/TwitchStreamList.tsx

```typescript
'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { TwitchStream } from '@/lib/api/twitch'
import TwitchLivePlayer from './TwitchLivePlayer'
import LoadingSpinner from './LoadingSpinner'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface TwitchStreamListProps {
  gameId: string
  limit?: number
}

/**
 * Twitch ライブ配信リスト
 * ゲームIDから配信中のチャンネルを取得して表示
 */
export default function TwitchStreamList({
  gameId,
  limit = 5,
}: TwitchStreamListProps) {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)

  const { data, error, isLoading } = useSWR<{
    streams: TwitchStream[]
    count: number
  }>(`/api/twitch/streams/${gameId}?limit=${limit}`, fetcher, {
    refreshInterval: 60000, // 1分ごとに更新
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="md" />
      </div>
    )
  }

  if (error || !data || data.streams.length === 0) {
    return (
      <div className="text-center text-text-secondary py-8">
        現在配信中のチャンネルはありません
      </div>
    )
  }

  const { streams } = data

  return (
    <div className="space-y-6">
      {/* 選択された配信のプレイヤー */}
      {selectedChannel && (
        <div className="mb-6">
          <TwitchLivePlayer
            channel={selectedChannel}
            viewerCount={
              streams.find((s) => s.user_login === selectedChannel)?.viewer_count
            }
          />
        </div>
      )}

      {/* 配信リスト */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-text-primary">
          ライブ配信中 ({streams.length})
        </h3>

        <div className="grid gap-3">
          {streams.map((stream) => (
            <button
              key={stream.id}
              onClick={() => setSelectedChannel(stream.user_login)}
              className={`p-4 rounded-lg border transition-colors text-left
                ${selectedChannel === stream.user_login
                  ? 'bg-accent/10 border-accent'
                  : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                }`}
            >
              <div className="flex items-start gap-3">
                {/* サムネイル */}
                <img
                  src={stream.thumbnail_url
                    .replace('{width}', '160')
                    .replace('{height}', '90')}
                  alt={stream.title}
                  className="w-40 h-[90px] object-cover rounded"
                  loading="lazy"
                />

                {/* 配信情報 */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-text-primary mb-1 line-clamp-2">
                    {stream.title}
                  </h4>
                  <p className="text-sm text-text-secondary mb-2">
                    {stream.user_name}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-danger rounded-full" />
                      LIVE
                    </span>
                    <span>👁 {stream.viewer_count.toLocaleString()}</span>
                    <span>{stream.language.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### app/components/TwitchClipGallery.tsx

```typescript
'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { TwitchClip } from '@/lib/api/twitch'
import LoadingSpinner from './LoadingSpinner'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface TwitchClipGalleryProps {
  gameId: string
  limit?: number
  days?: number
}

/**
 * Twitch クリップギャラリー
 * 人気クリップをサムネイル一覧で表示
 */
export default function TwitchClipGallery({
  gameId,
  limit = 10,
  days = 7,
}: TwitchClipGalleryProps) {
  const [selectedClip, setSelectedClip] = useState<TwitchClip | null>(null)

  const { data, error, isLoading } = useSWR<{
    clips: TwitchClip[]
    count: number
  }>(`/api/twitch/clips/${gameId}?limit=${limit}&days=${days}`, fetcher)

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="md" />
      </div>
    )
  }

  if (error || !data || data.clips.length === 0) {
    return (
      <div className="text-center text-text-secondary py-8">
        人気クリップが見つかりませんでした
      </div>
    )
  }

  const { clips } = data

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">
        人気クリップ (過去{days}日間)
      </h3>

      {/* クリップグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clips.map((clip) => (
          <button
            key={clip.id}
            onClick={() => setSelectedClip(clip)}
            className="group text-left"
          >
            <div className="relative aspect-video rounded-lg overflow-hidden mb-2">
              <img
                src={clip.thumbnail_url}
                alt={clip.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                loading="lazy"
              />
              {/* 再生ボタンオーバーレイ */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center
                              opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-black ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
              </div>
              {/* 再生時間 */}
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-xs text-white">
                {Math.floor(clip.duration)}s
              </div>
            </div>

            <h4 className="font-semibold text-text-primary mb-1 line-clamp-2">
              {clip.title}
            </h4>
            <p className="text-sm text-text-secondary mb-1">
              {clip.broadcaster_name}
            </p>
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <span>👁 {clip.view_count.toLocaleString()}</span>
              <span>•</span>
              <span>{new Date(clip.created_at).toLocaleDateString('ja-JP')}</span>
            </div>
          </button>
        ))}
      </div>

      {/* クリップ再生モーダル */}
      {selectedClip && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedClip(null)}
        >
          <div
            className="bg-bg-primary rounded-lg max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">
                  {selectedClip.title}
                </h3>
                <button
                  onClick={() => setSelectedClip(null)}
                  className="text-text-secondary hover:text-text-primary"
                >
                  ✕
                </button>
              </div>

              {/* Twitch Clip 埋め込み */}
              <iframe
                src={`${selectedClip.embed_url}&parent=localhost&parent=game-scope.vercel.app&autoplay=true`}
                height="400"
                width="100%"
                allowFullScreen
                className="rounded"
              />

              <div className="mt-4 text-sm text-text-secondary">
                {selectedClip.broadcaster_name} •{' '}
                {selectedClip.view_count.toLocaleString()} 再生 •{' '}
                {new Date(selectedClip.created_at).toLocaleDateString('ja-JP')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

## 完了条件

- [ ] useTwitchPlayer フックが正常に動作する
- [ ] TwitchLivePlayer でライブ配信が再生できる
- [ ] TwitchStreamList で配信一覧が表示される
- [ ] TwitchClipGallery でクリップが表示・再生できる
- [ ] レスポンシブデザインが適切に機能する
- [ ] ローディング・エラー状態が適切に表示される

## 関連チケット

- 前: `12_Twitch配信情報取得機能.md`
- 次: `14_ゲーム詳細ページTwitch統合.md`

## 参考資料

- [Twitch Embed Documentation](https://dev.twitch.tv/docs/embed/)
- [Twitch Player JavaScript API](https://dev.twitch.tv/docs/embed/video-and-clips/)
- [Parent Domain Requirements](https://discuss.dev.twitch.tv/t/parent-parameter-in-embedding-twitch-now-required/32252)

## 注意事項

- **parent パラメータは必須**: 本番ドメインを必ず追加すること
- Twitch SDK は動的読み込みを推奨（バンドルサイズ削減）
- iframe埋め込みはクリップのみ（ライブはSDK推奨）
- クリップモーダルは `autoplay=true` を設定
- サムネイルは遅延読み込み（`loading="lazy"`）
