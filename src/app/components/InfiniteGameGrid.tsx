'use client'

import { useEffect, useRef, useState } from 'react'
import GameCard from './GameCard'
import LoadingSpinner from './LoadingSpinner'
import type { Database } from '@/lib/supabase/types'

type Game = Database['public']['Tables']['games']['Row']

interface InfiniteGameGridProps {
  initialGames: Game[]
  initialHasMore: boolean
}

/**
 * 無限スクロール対応のゲームグリッド
 *
 * 初期20件を表示し、スクロールで追加読み込み
 * Intersection Observer APIを使用して自動読み込み
 */
export default function InfiniteGameGrid({
  initialGames,
  initialHasMore,
}: InfiniteGameGridProps) {
  const [games, setGames] = useState<Game[]>(initialGames)
  const [offset, setOffset] = useState(initialGames.length)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const observerTarget = useRef<HTMLDivElement>(null)

  // 追加データを読み込む関数
  const loadMore = async () => {
    if (isLoading || !hasMore) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/games?offset=${offset}&limit=20`)

      if (!response.ok) {
        throw new Error('Failed to fetch games')
      }

      const data = await response.json()

      // 重複を防ぐため、既存のIDをチェック
      setGames((prev) => {
        const existingIds = new Set(prev.map((g) => g.id))
        const newGames = data.games.filter((g: Game) => !existingIds.has(g.id))
        return [...prev, ...newGames]
      })

      // offsetは取得した件数で更新（重複排除に関係なく）
      setOffset((prev) => prev + 20)
      setHasMore(data.hasMore)
    } catch (err) {
      setError('ゲームの読み込みに失敗しました')
      console.error('Load more error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Intersection Observerでスクロール検知
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading) {
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
  }, [hasMore, isLoading, offset]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      {/* ゲームグリッド */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {games.map((game) => (
          <GameCard
            key={game.id}
            id={game.id}
            titleJa={game.title_ja}
            titleEn={game.title_en}
            metascore={game.metascore}
            platforms={game.platforms || []}
            thumbnailUrl={game.thumbnail_url}
            reviewCount={game.review_count}
          />
        ))}
      </div>

      {/* ローディング表示 */}
      {isLoading && (
        <div className="mt-12 flex justify-center">
          <LoadingSpinner />
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="mt-12 text-center text-danger">
          <p>{error}</p>
          <button
            onClick={loadMore}
            className="mt-4 px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition-colors"
          >
            再試行
          </button>
        </div>
      )}

      {/* すべて読み込み完了 */}
      {!hasMore && !isLoading && games.length > 0 && (
        <div className="mt-12 text-center text-text-secondary">
          <p>すべてのゲームを表示しました（全{games.length}件）</p>
        </div>
      )}

      {/* Intersection Observer用のターゲット要素 */}
      <div ref={observerTarget} className="h-10" />
    </div>
  )
}
