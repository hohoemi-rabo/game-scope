'use client'

import { useState } from 'react'
import GameListItem from './GameListItem'
import type { PortfolioWithGame } from '@/types/portfolio'

interface GameListProps {
  portfolios: PortfolioWithGame[]
}

/**
 * 登録ゲーム一覧
 * 編集・削除は#21で実装予定（現在はプレースホルダー）
 */
export default function GameList({ portfolios }: GameListProps) {
  const [, setEditingId] = useState<string | null>(null)
  const [, setDeletingId] = useState<string | null>(null)

  if (portfolios.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-900/30 border border-gray-800 rounded-xl">
        <span className="text-4xl mb-4 block">🎮</span>
        <p className="text-text-secondary mb-2">
          まだゲームが登録されていません
        </p>
        <p className="text-sm text-text-secondary">
          「+ ゲームを登録」ボタンから追加しましょう
        </p>
      </div>
    )
  }

  const handleEdit = (id: string) => {
    // #21で実装予定
    setEditingId(id)
    console.log('Edit:', id)
  }

  const handleDelete = (id: string) => {
    // #21で実装予定
    setDeletingId(id)
    console.log('Delete:', id)
  }

  return (
    <div className="space-y-3">
      {portfolios.map((portfolio) => (
        <GameListItem
          key={portfolio.id}
          portfolio={portfolio}
          onEdit={() => handleEdit(portfolio.id)}
          onDelete={() => handleDelete(portfolio.id)}
        />
      ))}
    </div>
  )
}
