'use client'

import { useState } from 'react'
import AddGameModal from '@/app/components/portfolio/AddGameModal'

/** 無料プランの登録上限 */
const FREE_TIER_LIMIT = 3

interface AddGameButtonProps {
  gameCount: number
}

/**
 * ゲーム登録ボタン
 * クリックでモーダルを開く（上限に達している場合は制限メッセージを表示）
 */
export default function AddGameButton({ gameCount }: AddGameButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showLimitMessage, setShowLimitMessage] = useState(false)

  const isLimitReached = gameCount >= FREE_TIER_LIMIT

  const handleClick = () => {
    if (isLimitReached) {
      setShowLimitMessage(true)
    } else {
      setIsModalOpen(true)
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center gap-2 px-4 py-2 bg-accent text-white
                   rounded-lg font-medium hover:bg-accent/80 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="hidden sm:inline">ゲームを登録</span>
        <span className="sm:hidden">登録</span>
      </button>

      {/* 登録モーダル */}
      <AddGameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* 上限メッセージモーダル */}
      {showLimitMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* オーバーレイ */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowLimitMessage(false)}
          />

          {/* メッセージ本体 */}
          <div className="relative bg-bg-primary border border-gray-800 rounded-2xl
                          w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center">
              <span className="text-5xl mb-4 block">🔒</span>
              <h3 className="text-xl font-bold text-text-primary mb-2">
                無料プランの上限に達しました
              </h3>
              <p className="text-text-secondary mb-4">
                現在、無料プランでは<span className="font-bold text-accent">{FREE_TIER_LIMIT}タイトル</span>まで登録できます。
              </p>
              <p className="text-sm text-text-secondary mb-6">
                より多くのゲームを管理したい場合は、有料プランへのアップグレードをご検討ください。
                <br />
                <span className="text-xs">（有料プランは準備中です）</span>
              </p>
              <button
                onClick={() => setShowLimitMessage(false)}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-text-primary
                           rounded-lg font-medium transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
