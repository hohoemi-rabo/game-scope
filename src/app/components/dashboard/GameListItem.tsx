'use client'

import {
  calculateCPH,
  getStockColor,
  getCPHMetaphor,
  getNextRankInfo,
  getRankProgress,
  formatPrice,
  formatPlayTime,
} from '@/lib/utils/cph'
import { STATUS_INFO, type GameStatus, type PortfolioWithGame } from '@/types/portfolio'
import { getPlatformIcon, getPlatformName } from '@/constants/platforms'

interface GameListItemProps {
  portfolio: PortfolioWithGame
  onEdit: () => void
  onDelete: () => void
}

/**
 * ゲームリストの1行アイテム（ネット証券風UI）
 */
export default function GameListItem({
  portfolio,
  onEdit,
  onDelete,
}: GameListItemProps) {
  const game = portfolio.games
  const purchasePrice = portfolio.purchase_price ?? 0
  const playTimeMinutes = portfolio.play_time_minutes ?? 0
  const isSubscription = portfolio.is_subscription ?? false
  const platform = portfolio.platform

  const { cph, rank } = calculateCPH(purchasePrice, playTimeMinutes, isSubscription)
  const stockColor = getStockColor(rank)
  const metaphor = getCPHMetaphor(rank)
  const nextRank = getNextRankInfo(rank, purchasePrice, playTimeMinutes)
  const statusInfo = STATUS_INFO[(portfolio.status as GameStatus) || 'backlog']

  // RPG経験値バー風の進捗（現在のランク内での進捗）
  const progressPercent = getRankProgress(rank, purchasePrice, playTimeMinutes)

  return (
    <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl
                    hover:border-gray-700 transition-colors">
      {/* ヘッダー: タイトル + ステータス + アクション */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* サムネイル */}
          {game.thumbnail_url ? (
            <img
              src={game.thumbnail_url}
              alt={game.title_ja || game.title_en}
              className="w-16 h-10 object-cover rounded flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-10 bg-gray-800 rounded flex-shrink-0 flex items-center justify-center">
              <span className="text-text-secondary text-xs">No Img</span>
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-bold text-text-primary truncate text-sm sm:text-base">
              {game.title_ja || game.title_en}
            </h3>
            <div className="flex items-center gap-2 text-xs text-text-secondary mt-0.5 flex-wrap">
              {platform && (
                <>
                  <span>{getPlatformIcon(platform)} {getPlatformName(platform)}</span>
                  <span className="text-gray-600">|</span>
                </>
              )}
              <span>{statusInfo.emoji} {statusInfo.label}</span>
              <span className="text-gray-600">|</span>
              <span>取得額: {isSubscription ? 'Free' : formatPrice(purchasePrice)}</span>
              <span className="text-gray-600">|</span>
              <span>運用: {formatPlayTime(playTimeMinutes)}</span>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 text-text-secondary hover:text-text-primary
                       hover:bg-gray-800 rounded-lg transition-colors"
            title="編集"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-text-secondary hover:text-danger
                       hover:bg-danger/10 rounded-lg transition-colors"
            title="削除"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* メイン: CPH（大きく目立たせる + メタファーを横に） */}
      <div className="flex items-baseline gap-2 mb-3 flex-wrap">
        <span className={`text-2xl sm:text-3xl font-bold font-mono ${stockColor.textColor}`}>
          {cph !== null ? `¥${cph.toLocaleString()}` : '--'}
        </span>
        <span className={`text-lg font-medium ${stockColor.textColor}`}>/h</span>
        <span className="text-sm">{stockColor.icon}</span>
        <span className={`text-xs px-2.5 py-1 rounded-full border ${stockColor.bgColor} ${stockColor.borderColor} ${stockColor.textColor}`}>
          {metaphor.emoji} {metaphor.label}
        </span>
      </div>

      {/* プログレスバー + ランクアップ情報（有料ゲームのみ） */}
      {!isSubscription && purchasePrice > 0 && (
        <div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-1.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${stockColor.barColor}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-xs">
            {rank === 'god' ? (
              <span className="text-emerald-400 font-medium">
                🏆 最高ランク達成！このまま遊び尽くそう
              </span>
            ) : nextRank ? (
              <span className={stockColor.textColor}>
                次のランク「{nextRank.nextEmoji} {nextRank.nextLabel}」まで、
                <span className="font-medium">あと {formatPlayTime(nextRank.minutesNeeded)} プレイ！</span>
              </span>
            ) : (
              <span className={stockColor.textColor}>
                さらにプレイしてランクアップを目指そう
              </span>
            )}
          </div>
        </div>
      )}

      {/* サブスク/無料の場合 */}
      {(isSubscription || purchasePrice === 0) && (
        <div className="text-xs text-cyan-400 bg-cyan-900/30 border border-cyan-500/30 px-3 py-1.5 rounded-lg inline-block">
          🎁 無料で {formatPlayTime(playTimeMinutes)} 楽しんでいます！最高のコスパ！
        </div>
      )}
    </div>
  )
}
