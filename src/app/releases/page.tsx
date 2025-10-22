'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Container from '../components/Container'
import ReleaseCard from '../components/ReleaseCard'
import LoadingSpinner from '../components/LoadingSpinner'
import type { ReleaseItem } from '@/lib/api/rss'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

/**
 * 発売予定ページ
 * Client Component としてリアルタイム更新
 * RSSフィードからの情報をプラットフォームでフィルタリング可能
 */
export default function ReleasesPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All')

  const { data, error, isLoading } = useSWR('/api/releases', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  if (error) {
    return (
      <Container className="py-8">
        <div className="text-center text-danger">
          <p>発売予定情報の取得に失敗しました</p>
        </div>
      </Container>
    )
  }

  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Container>
    )
  }

  const releases: ReleaseItem[] = data?.releases || []

  // プラットフォームでフィルタリング
  const filteredReleases =
    selectedPlatform === 'All'
      ? releases
      : releases.filter((r) => r.platform === selectedPlatform)

  // プラットフォーム一覧を取得
  const platforms = ['All', ...new Set(releases.map((r) => r.platform))]

  return (
    <Container className="py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">発売予定</h1>
        <p className="text-text-secondary">
          国内外のゲーム発売予定情報を掲載しています
        </p>
      </header>

      {/* プラットフォームフィルター */}
      <div className="flex flex-wrap gap-2 mb-6">
        {platforms.map((platform) => (
          <button
            key={platform}
            onClick={() => setSelectedPlatform(platform)}
            className={`px-4 py-2 rounded-lg transition-colors
              ${selectedPlatform === platform
                ? 'bg-accent text-white'
                : 'bg-gray-800 text-text-secondary hover:bg-gray-700'
              }`}
          >
            {platform}
          </button>
        ))}
      </div>

      {/* 発売予定一覧 */}
      <div className="space-y-4">
        {filteredReleases.length === 0 ? (
          <div className="text-center text-text-secondary py-12">
            発売予定情報が見つかりませんでした
          </div>
        ) : (
          filteredReleases.map((release, index) => (
            <ReleaseCard key={`${release.link}-${index}`} {...release} />
          ))
        )}
      </div>
    </Container>
  )
}
