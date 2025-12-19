'use client'

import { useState, useEffect } from 'react'
import { deletePortfolioEntry } from '@/app/actions/portfolio'

interface DeleteConfirmDialogProps {
  portfolioId: string
  gameName: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

/**
 * 削除確認ダイアログ
 */
export default function DeleteConfirmDialog({
  portfolioId,
  gameName,
  isOpen,
  onClose,
  onSuccess,
}: DeleteConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ESCキーでダイアログを閉じる
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

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      const result = await deletePortfolioEntry(portfolioId)

      if (!result.success) {
        setError(result.error)
      } else {
        onSuccess()
        onClose()
      }
    } catch (err) {
      console.error('Delete error:', err)
      setError('削除に失敗しました')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* ダイアログ本体 */}
      <div
        className="relative bg-bg-primary border border-gray-800 rounded-2xl
                   w-full max-w-sm shadow-2xl
                   animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="p-6">
          {/* アイコン */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-danger"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
          </div>

          {/* タイトル */}
          <h2 className="text-xl font-bold text-text-primary text-center mb-2">
            ゲームを削除しますか？
          </h2>

          {/* 説明 */}
          <p className="text-text-secondary text-center mb-6">
            「<span className="text-text-primary font-medium">{gameName}</span>」
            をポートフォリオから削除します。
            <br />
            <span className="text-sm">この操作は取り消せません。</span>
          </p>

          {/* エラー表示 */}
          {error && (
            <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg mb-4">
              <p className="text-danger text-sm text-center">{error}</p>
            </div>
          )}

          {/* ボタン */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 border border-gray-700 rounded-lg
                         text-text-secondary hover:bg-gray-800 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 bg-danger text-white rounded-lg font-medium
                         hover:bg-danger/80 transition-colors disabled:opacity-50
                         disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  削除中...
                </>
              ) : (
                '削除する'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
