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
