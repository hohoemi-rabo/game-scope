'use client'

import { useState } from 'react'
import AddGameModal from '@/app/components/portfolio/AddGameModal'

/**
 * ゲーム登録ボタン
 * クリックでモーダルを開く
 */
export default function AddGameButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-accent text-white
                   rounded-lg font-medium hover:bg-accent/80 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="hidden sm:inline">ゲームを登録</span>
        <span className="sm:hidden">登録</span>
      </button>

      <AddGameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
