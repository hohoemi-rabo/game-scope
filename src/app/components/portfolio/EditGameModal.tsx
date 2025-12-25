'use client'

import { useState, useEffect, useRef } from 'react'
import { updatePortfolioEntry } from '@/app/actions/portfolio'
import { STATUS_INFO, type GameStatus, type PortfolioWithGame } from '@/types/portfolio'
import { PLATFORM_MASTER } from '@/constants/platforms'
import { triggerStatusChangeNotification } from '@/lib/utils/status-notification'

interface EditGameModalProps {
  portfolio: PortfolioWithGame
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  onStatusChange?: (portfolioId: string) => void
}

/**
 * ゲーム編集モーダル
 * 既存のポートフォリオエントリーを編集
 */
export default function EditGameModal({
  portfolio,
  isOpen,
  onClose,
  onSuccess,
  onStatusChange,
}: EditGameModalProps) {
  const [purchasePrice, setPurchasePrice] = useState('')
  const [playTimeHours, setPlayTimeHours] = useState('')
  const [isSubscription, setIsSubscription] = useState(false)
  const [status, setStatus] = useState<GameStatus>('backlog')
  const [platform, setPlatform] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 元のステータスを保持（変更検知用）
  const originalStatusRef = useRef<GameStatus | null>(null)

  // ポートフォリオデータでフォームを初期化
  useEffect(() => {
    if (portfolio) {
      const initialStatus = (portfolio.status as GameStatus) || 'backlog'
      setPurchasePrice((portfolio.purchase_price ?? 0).toString())
      setPlayTimeHours(((portfolio.play_time_minutes ?? 0) / 60).toString())
      setIsSubscription(portfolio.is_subscription ?? false)
      setStatus(initialStatus)
      setPlatform(portfolio.platform ?? '')
      // 元のステータスを保存
      originalStatusRef.current = initialStatus
    }
  }, [portfolio])

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

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
      const result = await updatePortfolioEntry({
        id: portfolio.id,
        purchasePrice: isSubscription ? 0 : parseInt(purchasePrice) || 0,
        playTimeMinutes: Math.round((parseFloat(playTimeHours) || 0) * 60),
        isSubscription,
        status,
        platform,
      })

      if (!result.success) {
        setError(result.error)
      } else {
        // ステータス変更検知 & 通知トリガー
        const oldStatus = originalStatusRef.current
        if (oldStatus && oldStatus !== status) {
          // 親コンポーネントにステータス変更を通知（メモ欄フォーカス用）
          const focusMemo = () => onStatusChange?.(portfolio.id)
          // システム通知を表示
          triggerStatusChangeNotification(oldStatus, status, focusMemo)
        }
        onSuccess()
        onClose()
      }
    } catch (err) {
      console.error('Update error:', err)
      setError('更新に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const game = portfolio.games

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* モーダル本体 */}
      <div
        className="relative bg-bg-primary border border-gray-800 rounded-2xl
                   w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl
                   animate-in fade-in zoom-in-95 duration-200"
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-bold text-text-primary">
            ゲーム情報を編集
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary
                       hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ゲーム情報表示 */}
            <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
              {game.thumbnail_url ? (
                <img
                  src={game.thumbnail_url}
                  alt={game.title_ja || game.title_en}
                  className="w-20 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-20 h-12 bg-gray-700 rounded flex items-center justify-center">
                  <span className="text-text-secondary text-xs">No Image</span>
                </div>
              )}
              <h3 className="font-bold text-text-primary">
                {game.title_ja || game.title_en}
              </h3>
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
            </div>

            {/* ステータス */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                ステータス
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(STATUS_INFO).map((info) => (
                  <button
                    key={info.value}
                    type="button"
                    onClick={() => setStatus(info.value)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      status === info.value
                        ? 'border-accent bg-accent/10'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <span className="text-lg">{info.emoji}</span>
                    <span className="ml-2 font-medium text-text-primary">
                      {info.label}
                    </span>
                    <p className="text-xs text-text-secondary mt-1">
                      {info.description}
                    </p>
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
                onClick={onClose}
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
                    更新中...
                  </>
                ) : (
                  '更新する'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
