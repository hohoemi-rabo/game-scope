'use client'

import { useState } from 'react'
import { calculateAverageCPH, RANK_INFO, formatPrice, formatPlayTime } from '@/lib/utils/cph'
import type { PortfolioWithGame } from '@/types/portfolio'

interface DashboardSummaryProps {
  portfolios: PortfolioWithGame[]
}

/**
 * ランク表コンポーネント（ツールチップ）
 */
function RankLegend({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null

  const ranks = [
    { emoji: '💎', name: 'God', range: '¥0〜50', desc: '実質無料' },
    { emoji: '🥇', name: 'Gold', range: '¥51〜200', desc: '缶コーヒー級' },
    { emoji: '🥈', name: 'Silver', range: '¥201〜500', desc: 'ランチ級' },
    { emoji: '🥉', name: 'Bronze', range: '¥501〜1,500', desc: '映画館級' },
    { emoji: '💸', name: 'Luxury', range: '¥1,501〜', desc: '高級ディナー級' },
  ]

  return (
    <div className="absolute top-full left-0 right-0 mt-2 z-10">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-text-primary">ランク表</h4>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          >
            ✕
          </button>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-text-secondary border-b border-gray-700">
              <th className="text-left pb-2">ランク</th>
              <th className="text-left pb-2">時間単価</th>
              <th className="text-left pb-2">イメージ</th>
            </tr>
          </thead>
          <tbody>
            {ranks.map((r) => (
              <tr key={r.name} className="border-b border-gray-700/50 last:border-0">
                <td className="py-1.5">{r.emoji} {r.name}</td>
                <td className="py-1.5 text-text-secondary">{r.range}</td>
                <td className="py-1.5 text-text-secondary">{r.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-text-secondary mt-3 pt-2 border-t border-gray-700">
          📉 遊ぶほど時間単価が下がり、ランクアップ！
        </p>
      </div>
    </div>
  )
}

/**
 * ダッシュボードサマリーカード
 * 総投資額、総プレイ時間、平均時間単価を表示
 */
export default function DashboardSummary({ portfolios }: DashboardSummaryProps) {
  const [showRankLegend, setShowRankLegend] = useState(false)

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

      {/* 平均時間単価 */}
      <div className={`relative bg-gray-900/50 border border-gray-800 rounded-xl p-6 ${rankInfo.bgColor}`}>
        <div className="flex items-center gap-2 text-text-secondary mb-2">
          <span className="text-lg">📉</span>
          <span className="text-sm font-medium">平均時間単価</span>
          <button
            onClick={() => setShowRankLegend(!showRankLegend)}
            className="ml-auto w-5 h-5 rounded-full bg-gray-700 hover:bg-gray-600
                       text-xs text-text-secondary hover:text-text-primary
                       flex items-center justify-center transition-colors"
            title="ランク表を見る"
          >
            ?
          </button>
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

        {/* ランク表ツールチップ */}
        <RankLegend isOpen={showRankLegend} onClose={() => setShowRankLegend(false)} />
      </div>
    </div>
  )
}
