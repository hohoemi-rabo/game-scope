'use client'

import { useState } from 'react'

interface SelectedGame {
  id: string
  title: string
  thumbnail: string | null
}

interface ManualEntryStepProps {
  onSelect: (game: SelectedGame) => void
  onBack: () => void
}

/**
 * 手動登録ステップ
 * RAWGで見つからないゲームを手動で登録する
 */
export default function ManualEntryStep({
  onSelect,
  onBack,
}: ManualEntryStepProps) {
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError('タイトルを入力してください')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // 手動登録用のAPIを呼び出し
      const response = await fetch('/api/games/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title_en: title.trim(),
          title_ja: title.trim(),
          is_manual: true, // 手動登録フラグ
        }),
      })

      if (!response.ok) {
        throw new Error('登録に失敗しました')
      }

      const data = await response.json()

      // 次のステップへ
      onSelect({
        id: data.game_id,
        title: title.trim(),
        thumbnail: null,
      })
    } catch (err) {
      console.error('Manual registration error:', err)
      setError('ゲームの登録に失敗しました')
    } finally {
      setIsSubmitting(false)
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

      <div className="text-center py-2">
        <h3 className="text-lg font-medium text-text-primary mb-1">
          手動でゲームを登録
        </h3>
        <p className="text-sm text-text-secondary">
          データベースにないゲームを登録できます
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            ゲームタイトル <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: My Favorite Game"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3
                       text-text-primary placeholder:text-text-secondary
                       focus:border-accent focus:outline-none"
            autoFocus
          />
        </div>

        {error && (
          <p className="text-danger text-sm">{error}</p>
        )}

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-text-secondary">
            💡 手動登録したゲームは、後から編集できます。
            サムネイル画像は表示されませんが、プレイ時間やコストの記録には影響ありません。
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          className="w-full py-3 bg-accent text-white rounded-lg font-medium
                     hover:bg-accent/80 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              登録中...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 4v16m8-8H4" />
              </svg>
              このタイトルで登録する
            </>
          )}
        </button>
      </form>
    </div>
  )
}
