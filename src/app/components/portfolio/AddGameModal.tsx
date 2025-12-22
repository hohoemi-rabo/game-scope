'use client'

import { useState, useEffect, useCallback } from 'react'
import SearchGamesStep from './SearchGamesStep'
import ManualEntryStep from './ManualEntryStep'
import GameDetailsForm from './GameDetailsForm'

type Step = 'search' | 'manual' | 'details'

interface SelectedGame {
  id: string
  title: string
  thumbnail: string | null
  platforms: string[] // RAWGから取得したプラットフォーム一覧
}

interface AddGameModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * ゲーム登録モーダル
 * ステップ形式でゲームを選択し、ポートフォリオに登録
 */
export default function AddGameModal({ isOpen, onClose }: AddGameModalProps) {
  const [step, setStep] = useState<Step>('search')
  const [selectedGame, setSelectedGame] = useState<SelectedGame | null>(null)

  // モーダルを閉じる時にリセット
  const handleClose = useCallback(() => {
    setStep('search')
    setSelectedGame(null)
    onClose()
  }, [onClose])

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // スクロール禁止
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleClose])

  // ゲーム選択時
  const handleGameSelect = (game: SelectedGame) => {
    setSelectedGame(game)
    setStep('details')
  }

  // 登録成功時
  const handleSuccess = () => {
    handleClose()
  }

  // ステップタイトル
  const getStepTitle = () => {
    switch (step) {
      case 'search':
        return 'ゲームを検索'
      case 'manual':
        return '手動で登録'
      case 'details':
        return '詳細を入力'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
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
            {getStepTitle()}
          </h2>
          <button
            onClick={handleClose}
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
          {step === 'search' && (
            <SearchGamesStep
              onSelect={handleGameSelect}
              onManualEntry={() => setStep('manual')}
            />
          )}

          {step === 'manual' && (
            <ManualEntryStep
              onSelect={handleGameSelect}
              onBack={() => setStep('search')}
            />
          )}

          {step === 'details' && selectedGame && (
            <GameDetailsForm
              gameId={selectedGame.id}
              gameName={selectedGame.title}
              gameThumbnail={selectedGame.thumbnail}
              rawgPlatforms={selectedGame.platforms}
              onSuccess={handleSuccess}
              onCancel={() => {
                setSelectedGame(null)
                setStep('search')
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
