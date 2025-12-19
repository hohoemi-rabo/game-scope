'use client'

import { useState, useEffect } from 'react'
import type { Tables } from '@/lib/supabase/types'

type Game = Tables<'games'>

interface SelectedGame {
  id: string
  title: string
  thumbnail: string | null
}

interface PopularGamesStepProps {
  onSelect: (game: SelectedGame) => void
  onBack: () => void
}

/**
 * Step 2a: 人気ゲーム（Top60）から選択
 */
export default function PopularGamesStep({
  onSelect,
  onBack,
}: PopularGamesStepProps) {
  const [games, setGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGames = async () => {
      try {
        // Top60を全て取得
        const response = await fetch('/api/games?limit=60')
        if (!response.ok) throw new Error('Failed to fetch games')
        const data = await response.json()
        setGames(data.games || [])
      } catch (err) {
        console.error('Failed to fetch popular games:', err)
        setError('ゲームの取得に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    fetchGames()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-danger mb-4">{error}</p>
        <button
          onClick={onBack}
          className="text-accent hover:underline"
        >
          戻る
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-text-secondary hover:text-text-primary transition-colors
                     flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          戻る
        </button>
        <span className="text-sm text-text-secondary">
          {games.length}タイトル
        </span>
      </div>

      <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() =>
              onSelect({
                id: game.id,
                title: game.title_ja || game.title_en,
                thumbnail: game.thumbnail_url,
              })
            }
            className="w-full flex items-center gap-3 p-3 bg-gray-800 rounded-lg
                       border border-gray-700 hover:border-accent
                       transition-colors text-left group"
          >
            {game.thumbnail_url ? (
              <img
                src={game.thumbnail_url}
                alt={game.title_ja || game.title_en}
                className="w-16 h-10 object-cover rounded"
              />
            ) : (
              <div className="w-16 h-10 bg-gray-700 rounded flex items-center justify-center">
                <span className="text-text-secondary text-xs">No Image</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-text-primary truncate group-hover:text-accent transition-colors">
                {game.title_ja || game.title_en}
              </h4>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                {game.metascore && (
                  <span
                    className={`px-1.5 py-0.5 rounded ${
                      game.metascore >= 80
                        ? 'bg-success/20 text-success'
                        : game.metascore >= 60
                        ? 'bg-warning/20 text-warning'
                        : 'bg-danger/20 text-danger'
                    }`}
                  >
                    {game.metascore}
                  </span>
                )}
                {game.release_date && (
                  <span>{new Date(game.release_date).getFullYear()}</span>
                )}
              </div>
            </div>
            <svg
              className="w-5 h-5 text-text-secondary group-hover:text-accent transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}
