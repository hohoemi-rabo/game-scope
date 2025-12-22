'use client'

import { useState } from 'react'
import { createPortfolioEntry } from '@/app/actions/portfolio'
import { PLATFORM_MASTER } from '@/constants/platforms'

type GameStatus = 'playing' | 'completed' | 'dropped' | 'backlog'

interface GameDetailsFormProps {
  gameId: string
  gameName: string
  gameThumbnail: string | null
  rawgPlatforms?: string[] // RAWGから取得したプラットフォーム一覧（初期選択用）
  onSuccess: () => void
  onCancel: () => void
}

/**
 * Step 3: 詳細入力フォーム
 * 購入金額、プレイ時間、ステータスを入力
 */
/**
 * RAWGのプラットフォーム名からPLATFORM_MASTERのIDを推測
 * 部分一致で判定（例: "PlayStation 5" → "ps5"）
 */
function guessInitialPlatform(rawgPlatforms: string[]): string {
  const platformMappings: Record<string, string[]> = {
    'pc': ['PC', 'Windows', 'Mac', 'Linux'],
    'ps5': ['PlayStation 5'],
    'ps4': ['PlayStation 4'],
    'switch': ['Nintendo Switch'],
    'xbox-series': ['Xbox Series'],
    'xbox-one': ['Xbox One'],
    'smartphone': ['iOS', 'Android'],
  }

  for (const rawgPlatform of rawgPlatforms) {
    for (const [masterId, keywords] of Object.entries(platformMappings)) {
      if (keywords.some(keyword => rawgPlatform.includes(keyword))) {
        return masterId
      }
    }
  }
  return '' // マッチしない場合は空
}

export default function GameDetailsForm({
  gameId,
  gameName,
  gameThumbnail,
  rawgPlatforms = [],
  onSuccess,
  onCancel,
}: GameDetailsFormProps) {
  // RAWGのプラットフォームから初期値を推測
  const initialPlatform = guessInitialPlatform(rawgPlatforms)

  const [purchasePrice, setPurchasePrice] = useState('')
  const [playTimeHours, setPlayTimeHours] = useState('')
  const [isSubscription, setIsSubscription] = useState(false)
  const [status, setStatus] = useState<GameStatus>('backlog')
  const [platform, setPlatform] = useState(initialPlatform)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // プラットフォーム必須チェック
    if (!platform) {
      setError('プラットフォームを選択してください')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await createPortfolioEntry({
        gameId,
        purchasePrice: isSubscription ? 0 : parseInt(purchasePrice) || 0,
        playTimeMinutes: Math.round((parseFloat(playTimeHours) || 0) * 60),
        isSubscription,
        status,
        platform,
      })

      if (!result.success) {
        setError(result.error)
      } else {
        onSuccess()
      }
    } catch (err) {
      console.error('Portfolio creation error:', err)
      setError('登録に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ゲーム情報表示 */}
      <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
        {gameThumbnail ? (
          <img
            src={gameThumbnail}
            alt={gameName}
            className="w-20 h-12 object-cover rounded"
          />
        ) : (
          <div className="w-20 h-12 bg-gray-700 rounded flex items-center justify-center">
            <span className="text-text-secondary text-xs">No Image</span>
          </div>
        )}
        <h3 className="font-bold text-text-primary">{gameName}</h3>
      </div>

      {/* 購入金額 */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          購入金額
        </label>
        <div className="flex items-center gap-2">
          <span className="text-text-secondary">¥</span>
          <input
            type="number"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            disabled={isSubscription}
            placeholder="9000"
            min="0"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2
                       text-text-primary focus:border-accent focus:outline-none
                       disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <label className="flex items-center gap-2 mt-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isSubscription}
            onChange={(e) => setIsSubscription(e.target.checked)}
            className="w-4 h-4 rounded border-gray-700 bg-gray-800
                       text-accent focus:ring-accent focus:ring-offset-0"
          />
          <span className="text-sm text-text-secondary">
            サブスク / 無料で入手
          </span>
        </label>
      </div>

      {/* プラットフォーム */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          プラットフォーム <span className="text-danger">*</span>
        </label>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2
                     text-text-primary focus:border-accent focus:outline-none
                     appearance-none cursor-pointer"
        >
          <option value="">選択してください</option>
          {PLATFORM_MASTER.map((p) => (
            <option key={p.id} value={p.id}>
              {p.icon} {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* プレイ時間 */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          プレイ時間
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="0.5"
            value={playTimeHours}
            onChange={(e) => setPlayTimeHours(e.target.value)}
            placeholder="120"
            min="0"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2
                       text-text-primary focus:border-accent focus:outline-none"
          />
          <span className="text-text-secondary">時間</span>
        </div>
        <p className="text-xs text-text-secondary mt-1">
          0.5時間（30分）単位で入力できます
        </p>
      </div>

      {/* ステータス */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          ステータス
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'playing', label: 'Playing', icon: '🎮', desc: 'プレイ中' },
            { value: 'completed', label: 'Completed', icon: '✅', desc: 'クリア済み' },
            { value: 'dropped', label: 'Dropped', icon: '❌', desc: 'やめた' },
            { value: 'backlog', label: 'Backlog', icon: '📚', desc: '積みゲー' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatus(option.value as GameStatus)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                status === option.value
                  ? 'border-accent bg-accent/10'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-600'
              }`}
            >
              <span className="text-lg">{option.icon}</span>
              <span className="ml-2 font-medium text-text-primary">
                {option.label}
              </span>
              <p className="text-xs text-text-secondary mt-1">{option.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg">
          <p className="text-danger text-sm">{error}</p>
        </div>
      )}

      {/* ボタン */}
      <div className="flex gap-4 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-gray-700 rounded-lg
                     text-text-secondary hover:bg-gray-800 transition-colors"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-3 bg-accent text-white rounded-lg font-medium
                     hover:bg-accent/80 transition-colors disabled:opacity-50
                     disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              登録中...
            </>
          ) : (
            '登録する'
          )}
        </button>
      </div>
    </form>
  )
}
