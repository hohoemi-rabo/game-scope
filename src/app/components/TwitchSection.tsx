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
