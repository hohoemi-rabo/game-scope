'use client'

import { calculateAverageCPH, RANK_INFO, formatPrice, formatPlayTime } from '@/lib/utils/cph'
import type { PortfolioWithGame } from '@/types/portfolio'

interface DashboardSummaryProps {
  portfolios: PortfolioWithGame[]
}

/**
 * ダッシュボードサマリーカード
 * 総投資額、総プレイ時間、平均CPHを表示
 */
export default function DashboardSummary({ portfolios }: DashboardSummaryProps) {
  // 集計
  const totalInvestment = portfolios.reduce(
    (sum, p) => sum + (p.purchase_price ?? 0),
    0
  )
  const totalMinutes = portfolios.reduce(
    (sum, p) => sum + (p.play_time_minutes ?? 0),
    0
  )
  const gameCount = portfolios.length

  const averageCPH = calculateAverageCPH(portfolios)
  const rankInfo = RANK_INFO[averageCPH.rank]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 総投資額 */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-2 text-text-secondary mb-2">
          <span className="text-lg">💰</span>
          <span className="text-sm font-medium">総投資額</span>
        </div>
        <div className="text-3xl font-bold text-text-primary">
          {formatPrice(totalInvestment)}
        </div>
        <p className="text-sm text-text-secondary mt-2">
          {gameCount}タイトル
        </p>
      </div>

      {/* 総プレイ時間 */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-2 text-text-secondary mb-2">
          <span className="text-lg">⏱️</span>
          <span className="text-sm font-medium">総プレイ時間</span>
        </div>
        <div className="text-3xl font-bold text-text-primary">
          {formatPlayTime(totalMinutes)}
        </div>
        <p className="text-sm text-text-secondary mt-2">
          {gameCount > 0
            ? `平均 ${formatPlayTime(Math.round(totalMinutes / gameCount))}/タイトル`
            : 'データなし'
          }
        </p>
      </div>

      {/* 平均CPH */}
      <div className={`bg-gray-900/50 border border-gray-800 rounded-xl p-6 ${rankInfo.bgColor}`}>
        <div className="flex items-center gap-2 text-text-secondary mb-2">
          <span className="text-lg">📈</span>
          <span className="text-sm font-medium">平均CPH</span>
        </div>
        <div className="text-3xl font-bold text-text-primary">
          {averageCPH.cph !== null ? (
            <>{formatPrice(averageCPH.cph)}<span className="text-lg">/時間</span></>
          ) : (
            <span className="text-text-secondary">-</span>
          )}
        </div>
        <div className={`flex items-center gap-2 mt-2 ${rankInfo.color}`}>
          <span className="text-lg">{rankInfo.emoji}</span>
          <span className="font-medium">{rankInfo.label}</span>
          <span className="text-sm opacity-80">- {rankInfo.message}</span>
        </div>
      </div>
    </div>
  )
}
