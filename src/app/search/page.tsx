import { Suspense } from 'react'
import { searchGames } from '@/lib/supabase/search'
import Container from '../components/Container'
import SearchBar from '../components/SearchBar'
import FilterPanel from '../components/FilterPanel'
import GameGrid from '../components/GameGrid'
import LoadingSpinner from '../components/LoadingSpinner'

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    platforms?: string
    minScore?: string
    maxScore?: string
  }>
}

/**
 * 検索ページ
 * 検索クエリとフィルターに基づいてゲームを検索・表示
 */
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = params.q || ''
  const platforms = params.platforms?.split(',').filter(Boolean) || []
  const minScore = parseInt(params.minScore || '0')
  const maxScore = parseInt(params.maxScore || '100')

  // 検索実行
  const games = await searchGames({
    query,
    platforms,
    minScore,
    maxScore,
  })

  return (
    <Container className="py-8">
      <h1 className="text-4xl font-bold mb-8">ゲーム検索</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* フィルターパネル */}
        <aside className="lg:col-span-1">
          <FilterPanel />
        </aside>

        {/* 検索結果 */}
        <div className="lg:col-span-3">
          <div className="mb-6">
            <SearchBar initialQuery={query} />
          </div>

          {query && (
            <div className="mb-4 text-text-secondary">
              「{query}」の検索結果: {games.length} 件
            </div>
          )}

          <Suspense fallback={<LoadingSpinner />}>
            <GameGrid games={games} />
          </Suspense>
        </div>
      </div>
    </Container>
  )
}
