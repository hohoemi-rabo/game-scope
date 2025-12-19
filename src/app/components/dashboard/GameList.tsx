'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import GameListItem from './GameListItem'
import EditGameModal from '@/app/components/portfolio/EditGameModal'
import DeleteConfirmDialog from '@/app/components/portfolio/DeleteConfirmDialog'
import type { PortfolioWithGame } from '@/types/portfolio'

interface GameListProps {
  portfolios: PortfolioWithGame[]
}

/**
 * 登録ゲーム一覧
 * 編集モーダル・削除ダイアログを統合
 */
export default function GameList({ portfolios }: GameListProps) {
  const router = useRouter()
  const [editingPortfolio, setEditingPortfolio] = useState<PortfolioWithGame | null>(null)
  const [deletingPortfolio, setDeletingPortfolio] = useState<PortfolioWithGame | null>(null)

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

  const handleEdit = (portfolio: PortfolioWithGame) => {
    setEditingPortfolio(portfolio)
  }

  const handleDelete = (portfolio: PortfolioWithGame) => {
    setDeletingPortfolio(portfolio)
  }

  const handleEditSuccess = () => {
    // サーバーコンポーネントのデータを再取得
    router.refresh()
  }

  const handleDeleteSuccess = () => {
    // サーバーコンポーネントのデータを再取得
    router.refresh()
  }

  return (
    <>
      <div className="space-y-3">
        {portfolios.map((portfolio) => (
          <GameListItem
            key={portfolio.id}
            portfolio={portfolio}
            onEdit={() => handleEdit(portfolio)}
            onDelete={() => handleDelete(portfolio)}
          />
        ))}
      </div>

      {/* 編集モーダル */}
      {editingPortfolio && (
        <EditGameModal
          portfolio={editingPortfolio}
          isOpen={true}
          onClose={() => setEditingPortfolio(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* 削除確認ダイアログ */}
      {deletingPortfolio && (
        <DeleteConfirmDialog
          portfolioId={deletingPortfolio.id}
          gameName={deletingPortfolio.games.title_ja || deletingPortfolio.games.title_en}
          isOpen={true}
          onClose={() => setDeletingPortfolio(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  )
}
