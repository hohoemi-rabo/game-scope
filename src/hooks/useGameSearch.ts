'use client'

import { useState, useCallback } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import type { GameSearchResult, RegisterGameResponse } from '@/types/game-search'

/**
 * ゲーム検索フック
 * RAWG APIを使用したゲーム検索とDB登録機能を提供
 */
export function useGameSearch() {
  const [results, setResults] = useState<GameSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 検索（500ms debounce）
  const search = useDebouncedCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/games/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Search failed')
      }

      setResults(data.games)
    } catch (err) {
      console.error('Game search error:', err)
      setError('検索に失敗しました')
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, 500)

  // ゲームをDBに登録
  const registerGame = useCallback(async (game: GameSearchResult): Promise<RegisterGameResponse> => {
    const response = await fetch('/api/games/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rawg_id: game.rawg_id,
        title_en: game.title_en,
        thumbnail_url: game.thumbnail_url,
        release_date: game.release_date,
        platforms: game.platforms,
        genres: game.genres,
        metascore: game.metacritic,
      }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to register game')
    }

    return response.json()
  }, [])

  // 検索結果をクリア
  const clearResults = useCallback(() => {
    setResults([])
    setError(null)
  }, [])

  return {
    results,
    isLoading,
    error,
    search,
    registerGame,
    clearResults,
  }
}
