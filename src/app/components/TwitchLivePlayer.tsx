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
