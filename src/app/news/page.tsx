'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import useSWR from 'swr'
import Container from '../components/Container'
import NewsCard from '../components/NewsCard'
import LoadingSpinner from '../components/LoadingSpinner'
import type { NewsItem } from '@/lib/api/rss'
import { getPlatformButtonColor } from '@/lib/utils/platform-colors'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// 1回に表示する件数
const ITEMS_PER_PAGE = 20

const KEYWORDS = ['全て', '発売', '配信', 'リリース', '予定']

// ニュースサイトの表示順
const PLATFORM_ORDER = [
  'All',
  '4Gamer',
  '4Gamer (PC)',
  '4Gamer (スマホ)',
  '4Gamer (PlayStation)',
  '4Gamer (Switch)',
  'PlayStation Blog',
  'Nintendo',
  'Game*Spark',
  'GAME Watch',
  'GAMER',
]

/**
 * ニュース一覧ページ
 * Client Component としてリアルタイム更新
 * RSSフィードからの情報をニュースサイト名とキーワードでフィルタリング可能
 */
export default function NewsPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All')
  const [selectedKeyword, setSelectedKeyword] = useState<string>('全て')
  const [displayCount, setDisplayCount] = useState<number>(ITEMS_PER_PAGE)

  const observerTarget = useRef<HTMLDivElement>(null)

  const { data, error, isLoading } = useSWR('/api/news', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  // フィルタリング処理
  const filteredNews = useMemo(() => {
    const news: NewsItem[] = data?.news || []

    let filtered = news

    // ニュースサイト名でフィルタリング
    if (selectedPlatform !== 'All') {
      filtered = filtered.filter((n) => n.platform === selectedPlatform)
    }

    // キーワードでフィルタリング
    if (selectedKeyword !== '全て') {
      filtered = filtered.filter((n) => {
        const text = `${n.title} ${n.description || ''}`
        return text.includes(selectedKeyword)
      })
    }

    return filtered
  }, [data?.news, selectedPlatform, selectedKeyword])

  // フィルターが変更されたら表示件数をリセット
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE)
  }, [selectedPlatform, selectedKeyword])

  // 表示するニュース（displayCountで制限）
  const displayedNews = useMemo(() => {
    return filteredNews.slice(0, displayCount)
  }, [filteredNews, displayCount])

  // もっと読み込めるかどうか
  const hasMore = displayCount < filteredNews.length

  // 追加読み込み
  const loadMore = useCallback(() => {
    if (hasMore) {
      setDisplayCount((prev) => prev + ITEMS_PER_PAGE)
    }
  }, [hasMore])

  // Intersection Observerでスクロール検知
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasMore, loadMore])

  if (error) {
    return (
      <Container className="py-8">
        <div className="text-center text-danger">
          <p>ニュース情報の取得に失敗しました</p>
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

  const news: NewsItem[] = data?.news || []

  // ニュースサイト名一覧を取得（定義された順番で、実際に存在するもののみ）
  const availablePlatforms = new Set(news.map((n) => n.platform))
  const platforms = PLATFORM_ORDER.filter(
    (p) => p === 'All' || availablePlatforms.has(p)
  )

  return (
    <Container className="py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">ニュース一覧</h1>
        <p className="text-text-secondary">
          国内外のゲームニュースサイトから最新情報を掲載しています
        </p>
      </header>

      {/* フィルター */}
      <div className="mb-6 space-y-4">
        {/* ニュースサイト名フィルター */}
        <div>
          <h3 className="text-sm font-semibold text-text-secondary mb-2">
            ニュースサイト
          </h3>
          <div className="flex flex-wrap gap-2">
            {platforms.map((platform) => (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium
                  ${getPlatformButtonColor(platform, selectedPlatform === platform)}`}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>

        {/* キーワードフィルター */}
        <div>
          <h3 className="text-sm font-semibold text-text-secondary mb-2">
            キーワード
          </h3>
          <div className="flex flex-wrap gap-2">
            {KEYWORDS.map((keyword) => (
              <button
                key={keyword}
                onClick={() => setSelectedKeyword(keyword)}
                className={`px-4 py-2 rounded-lg transition-colors text-sm
                  ${selectedKeyword === keyword
                    ? 'bg-accent text-white'
                    : 'bg-gray-800 text-text-secondary hover:bg-gray-700'
                  }`}
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 件数表示 */}
      <div className="mb-4 text-text-secondary text-sm">
        {filteredNews.length} 件のニュース
      </div>

      {/* ニュース一覧 */}
      <div className="space-y-4">
        {filteredNews.length === 0 ? (
          <div className="text-center text-text-secondary py-12">
            ニュースが見つかりませんでした
          </div>
        ) : (
          displayedNews.map((newsItem, index) => (
            <NewsCard key={`${newsItem.link}-${index}`} {...newsItem} />
          ))
        )}
      </div>

      {/* ローディング表示 */}
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <LoadingSpinner />
        </div>
      )}

      {/* すべて読み込み完了 */}
      {!hasMore && filteredNews.length > ITEMS_PER_PAGE && (
        <div className="mt-8 text-center text-text-secondary">
          <p>すべてのニュースを表示しました（全{filteredNews.length}件）</p>
        </div>
      )}

      {/* Intersection Observer用のターゲット要素 */}
      <div ref={observerTarget} className="h-10" />
    </Container>
  )
}
