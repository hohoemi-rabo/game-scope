'use client'

import { calculateCPH, RANK_INFO, formatPrice, formatPlayTime } from '@/lib/utils/cph'
import { STATUS_INFO, type GameStatus, type PortfolioWithGame } from '@/types/portfolio'

interface GameListItemProps {
  portfolio: PortfolioWithGame
  onEdit: () => void
  onDelete: () => void
}

/**
 * ゲームリストの1行アイテム
 */
export default function GameListItem({
  portfolio,
  onEdit,
  onDelete,
}: GameListItemProps) {
  const game = portfolio.games
  const { cph, rank } = calculateCPH(
    portfolio.purchase_price ?? 0,
    portfolio.play_time_minutes ?? 0,
    portfolio.is_subscription ?? false
  )
  const rankInfo = RANK_INFO[rank]
  const statusInfo = STATUS_INFO[(portfolio.status as GameStatus) || 'backlog']

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-900/50 border border-gray-800 rounded-xl
                    hover:border-gray-700 transition-colors">
      {/* サムネイル */}
      {game.thumbnail_url ? (
        <img
          src={game.thumbnail_url}
          alt={game.title_ja || game.title_en}
          className="w-20 h-12 object-cover rounded flex-shrink-0"
        />
      ) : (
        <div className="w-20 h-12 bg-gray-800 rounded flex-shrink-0 flex items-center justify-center">
          <span className="text-text-secondary text-xs">No Image</span>
        </div>
      )}

      {/* ゲーム情報 */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-text-primary truncate">
          {game.title_ja || game.title_en}
        </h3>
        <div className="flex flex-wrap items-center gap-3 text-sm mt-1">
          {/* CPH + ランク */}
          <span className={`flex items-center gap-1 ${rankInfo.color}`}>
            <span>{rankInfo.emoji}</span>
            {cph !== null ? (
              <span>{formatPrice(cph)}/時間</span>
            ) : (
              <span>{rankInfo.message}</span>
            )}
          </span>

          {/* プレイ時間 */}
          <span className="text-text-secondary">
            ⏱️ {formatPlayTime(portfolio.play_time_minutes ?? 0)}
          </span>

          {/* 購入金額 */}
          <span className="text-text-secondary">
            💰 {portfolio.is_subscription
              ? 'サブスク'
              : formatPrice(portfolio.purchase_price ?? 0)
            }
          </span>
        </div>
      </div>

      {/* ステータス */}
      <div className="hidden sm:flex items-center gap-1 text-sm text-text-secondary
                      bg-gray-800/50 px-3 py-1.5 rounded-lg">
        <span>{statusInfo.emoji}</span>
        <span>{statusInfo.label}</span>
      </div>

      {/* アクションボタン */}
      <div className="flex items-center gap-1">
        <button
          onClick={onEdit}
          className="p-2 text-text-secondary hover:text-text-primary
                     hover:bg-gray-800 rounded-lg transition-colors"
          title="編集"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-text-secondary hover:text-danger
                     hover:bg-danger/10 rounded-lg transition-colors"
          title="削除"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}
