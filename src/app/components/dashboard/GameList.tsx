'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import GameListItem from './GameListItem'
import EditGameModal from '@/app/components/portfolio/EditGameModal'
import DeleteConfirmDialog from '@/app/components/portfolio/DeleteConfirmDialog'
import { PLATFORM_MASTER } from '@/constants/platforms'
import type { PortfolioWithGame } from '@/types/portfolio'

// ソートオプション
type SortOption = 'date' | 'platform' | 'status'

// ステータスの優先順位（アクティブ優先）
const STATUS_ORDER: Record<string, number> = {
  playing: 0,
  backlog: 1,
  completed: 2,
  dropped: 3,
}

// プラットフォームの優先順位（マスター順）
const PLATFORM_ORDER: Record<string, number> = Object.fromEntries(
  PLATFORM_MASTER.map((p, index) => [p.id, index])
)

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
  // メモ欄フォーカス対象のポートフォリオID
  const [focusMemoId, setFocusMemoId] = useState<string | null>(null)
  // ソートオプション
  const [sortBy, setSortBy] = useState<SortOption>('date')

  // ステータス変更時のメモ欄フォーカス（Hookは条件分岐前に定義）
  const handleStatusChange = useCallback((portfolioId: string) => {
    // メモ欄をフォーカス対象に設定
    setFocusMemoId(portfolioId)
    // 少し遅延させてDOMが更新された後にフォーカスをリセット
    setTimeout(() => setFocusMemoId(null), 100)
  }, [])

  // ソート済みポートフォリオ
  const sortedPortfolios = useMemo(() => {
    const sorted = [...portfolios]

    switch (sortBy) {
      case 'date':
        // 登録日（新しい順）
        sorted.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        break
      case 'platform':
        // プラットフォーム（マスター順）
        sorted.sort((a, b) => {
          const orderA = PLATFORM_ORDER[a.platform || ''] ?? 999
          const orderB = PLATFORM_ORDER[b.platform || ''] ?? 999
          if (orderA !== orderB) return orderA - orderB
          // 同じプラットフォーム内は登録日順
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
        break
      case 'status':
        // ステータス（アクティブ優先）
        sorted.sort((a, b) => {
          const orderA = STATUS_ORDER[a.status || ''] ?? 999
          const orderB = STATUS_ORDER[b.status || ''] ?? 999
          if (orderA !== orderB) return orderA - orderB
          // 同じステータス内は登録日順
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
        break
    }

    return sorted
  }, [portfolios, sortBy])

  // 空の場合のUI
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

  // ソートタブの設定
  const sortTabs: { key: SortOption; label: string; icon: string }[] = [
    { key: 'date', label: '登録日', icon: '📅' },
    { key: 'platform', label: 'プラットフォーム', icon: '🎮' },
    { key: 'status', label: 'ステータス', icon: '📊' },
  ]

  return (
    <>
      {/* ソートタブ */}
      <div className="flex gap-2 mb-4">
        {sortTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSortBy(tab.key)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
              transition-colors
              ${sortBy === tab.key
                ? 'bg-accent text-white'
                : 'bg-gray-800 text-text-secondary hover:bg-gray-700 hover:text-text-primary'
              }
            `}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {sortedPortfolios.map((portfolio) => (
          <GameListItem
            key={portfolio.id}
            portfolio={portfolio}
            onEdit={() => handleEdit(portfolio)}
            onDelete={() => handleDelete(portfolio)}
            shouldFocusMemo={focusMemoId === portfolio.id}
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
          onStatusChange={handleStatusChange}
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
