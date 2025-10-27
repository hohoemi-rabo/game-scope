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
