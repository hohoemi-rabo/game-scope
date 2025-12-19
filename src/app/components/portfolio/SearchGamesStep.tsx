'use client'

import { useState } from 'react'
import { useGameSearch } from '@/hooks/useGameSearch'

interface SelectedGame {
  id: string
  title: string
  thumbnail: string | null
}

interface SearchGamesStepProps {
  onSelect: (game: SelectedGame) => void
  onBack: () => void
}

/**
 * Step 2b: RAWGデータベースから検索
 */
export default function SearchGamesStep({
  onSelect,
  onBack,
}: SearchGamesStepProps) {
  const [query, setQuery] = useState('')
  const [isRegistering, setIsRegistering] = useState<number | null>(null)
  const { results, isLoading, error, search, registerGame } = useGameSearch()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    search(value)
  }

  const handleSelect = async (game: typeof results[number]) => {
    setIsRegistering(game.rawg_id)
    try {
      // まずゲームをDBに登録
      const result = await registerGame(game)
      // 登録後、詳細入力ステップへ
      onSelect({
        id: result.game_id,
        title: game.title_en,
        thumbnail: game.thumbnail_url,
      })
    } catch (err) {
      console.error('Failed to register game:', err)
      alert('ゲームの登録に失敗しました')
    } finally {
      setIsRegistering(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
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
      </div>

      {/* 検索入力 */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="ゲームタイトルを入力..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pl-10
                     text-text-primary placeholder:text-text-secondary
                     focus:border-accent focus:outline-none"
          autoFocus
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent" />
          </div>
        )}
      </div>

      {/* 検索ヒント */}
      {query.length === 0 && (
        <p className="text-sm text-text-secondary text-center py-4">
          2文字以上入力すると検索が始まります
        </p>
      )}

      {query.length === 1 && (
        <p className="text-sm text-text-secondary text-center py-4">
          もう1文字入力してください
        </p>
      )}

      {/* エラー表示 */}
      {error && (
        <p className="text-danger text-sm text-center py-4">{error}</p>
      )}

      {/* 検索結果 */}
      {results.length > 0 && (
        <div className="max-h-[350px] overflow-y-auto space-y-2 pr-2">
          {results.map((game) => (
            <button
              key={game.rawg_id}
              onClick={() => handleSelect(game)}
              disabled={isRegistering !== null}
              className="w-full flex items-center gap-3 p-3 bg-gray-800 rounded-lg
                         border border-gray-700 hover:border-[#06b6d4]
                         transition-colors text-left group disabled:opacity-50"
            >
              {game.thumbnail_url ? (
                <img
                  src={game.thumbnail_url}
                  alt={game.title_en}
                  className="w-16 h-10 object-cover rounded"
                />
              ) : (
                <div className="w-16 h-10 bg-gray-700 rounded flex items-center justify-center">
                  <span className="text-text-secondary text-xs">No Image</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-text-primary truncate group-hover:text-[#06b6d4] transition-colors">
                  {game.title_en}
                </h4>
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  {game.metacritic && (
                    <span
                      className={`px-1.5 py-0.5 rounded ${
                        game.metacritic >= 80
                          ? 'bg-success/20 text-success'
                          : game.metacritic >= 60
                          ? 'bg-warning/20 text-warning'
                          : 'bg-danger/20 text-danger'
                      }`}
                    >
                      {game.metacritic}
                    </span>
                  )}
                  {game.release_date && (
                    <span>{new Date(game.release_date).getFullYear()}</span>
                  )}
                  {game.platforms.length > 0 && (
                    <span className="truncate max-w-[150px]">
                      {game.platforms.slice(0, 2).join(', ')}
                    </span>
                  )}
                </div>
              </div>
              {isRegistering === game.rawg_id ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#06b6d4]" />
              ) : (
                <svg
                  className="w-5 h-5 text-text-secondary group-hover:text-[#06b6d4] transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}

      {/* 結果なし */}
      {query.length >= 2 && !isLoading && results.length === 0 && !error && (
        <p className="text-text-secondary text-center py-8">
          該当するゲームが見つかりませんでした
        </p>
      )}
    </div>
  )
}
