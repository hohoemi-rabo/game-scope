'use client'

import {
  calculateMarketInsight,
  STANDARD_ENTERTAINMENT_RATE,
} from '@/lib/utils/profit'
import type { PortfolioWithGame } from '@/types/portfolio'

interface MarketInsightProps {
  portfolios: PortfolioWithGame[]
}

/**
 * 「もしも換算」ウィジェット（VS構造 - 天国と地獄ver）
 * ゲーマーの「実質無料」理論を可視化する
 * 勝ち: グリーン / 先行投資中: ブルー
 */
export default function MarketInsight({ portfolios }: MarketInsightProps) {
  // 集計
  const totalSpend = portfolios.reduce(
    (sum, p) => sum + (p.purchase_price ?? 0),
    0
  )
  const totalMinutes = portfolios.reduce(
    (sum, p) => sum + (p.play_time_minutes ?? 0),
    0
  )
  const totalHours = totalMinutes / 60

  // 含み益を計算
  const insight = calculateMarketInsight(totalSpend, totalHours)

  // プレイ時間がない場合は表示しない
  if (!insight) return null

  const isProfit = insight.status === 'profit'

  // テーマカラー（勝ち: Emerald / 先行投資中: Blue）
  const theme = isProfit
    ? {
        border: 'border-emerald-500/20',
        bgRight: 'from-emerald-800 to-emerald-950',
        textRight: 'text-emerald-300',
        glowColor: 'bg-emerald-500/20',
      }
    : {
        border: 'border-blue-500/20',
        bgRight: 'from-blue-800 to-blue-950',
        textRight: 'text-blue-300',
        glowColor: 'bg-blue-500/20',
      }

  return (
    <div className={`mt-6 rounded-xl overflow-hidden shadow-xl border ${theme.border}`}>

      {/* VS エリア */}
      <div className="flex flex-col sm:flex-row relative min-h-[140px]">

        {/* ■ 左側：世間の娯楽 (常にグレー) */}
        <div className="flex-1 bg-gray-900/80 p-6 flex flex-col items-center justify-center
                        border-b sm:border-b-0 sm:border-r border-gray-800">
          <div className="text-center opacity-70">
            <span className="block text-xs text-gray-400 font-bold tracking-wider mb-2">
              一般的な娯楽{' '}
              <span className="text-gray-500 font-normal">
                (@¥{STANDARD_ENTERTAINMENT_RATE.toLocaleString()}/h)
              </span>
            </span>

            <div className="relative inline-block">
              {/* 太い赤線で否定 */}
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500/60 -rotate-6" />
              <span className="text-3xl sm:text-4xl font-bold text-gray-500">
                ¥{insight.potentialCost.toLocaleString()}
              </span>
            </div>

            <p className="text-[10px] text-gray-600 mt-2">
              {Math.round(totalHours)}時間 遊んだ場合のコスト
            </p>
          </div>
        </div>

        {/* VS バッジ (中央配置) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20
                        hidden sm:block">
          <div className="w-10 h-10 rounded-full bg-gray-950 border-4 border-gray-900
                          flex items-center justify-center shadow-lg">
            <span className="text-xs font-black text-gray-600 italic">VS</span>
          </div>
        </div>

        {/* ■ 右側：GameScope (勝ち負けで色が変わる) */}
        <div className={`flex-1 bg-gradient-to-br ${theme.bgRight} p-6
                        flex flex-col items-center justify-center relative overflow-hidden`}>
          {/* 輝きエフェクト */}
          <div className={`absolute -top-10 -right-10 w-40 h-40 ${theme.glowColor} blur-3xl rounded-full`} />
          <div className={`absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t ${isProfit ? 'from-emerald-950/50' : 'from-blue-950/50'} to-transparent`} />

          <div className="flex flex-col items-center gap-4 z-10">
            <span className={`text-xs font-bold tracking-wider drop-shadow ${theme.textRight}`}>
              {isProfit ? 'GameScope (あなた)' : '投資回収中 (INVESTING)'}
            </span>

            <span className="text-3xl sm:text-4xl font-black text-white drop-shadow-lg">
              ¥{totalSpend.toLocaleString()}
            </span>

            {/* 差額バッジ */}
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm
                            px-4 py-1.5 rounded-full border border-white/20 shadow-lg">
              {isProfit ? (
                <>
                  <span className="text-lg">💰</span>
                  <span className="text-sm font-bold text-white">
                    <span className="text-yellow-300">+¥{insight.profit.toLocaleString()}</span> お得
                  </span>
                </>
              ) : (
                <>
                  <span className="text-lg">⏱️</span>
                  <span className="text-sm font-bold text-white">
                    差額: <span className="text-blue-200">-¥{Math.abs(insight.profit).toLocaleString()}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ■ フッター：メッセージ切り替え */}
      <div className="bg-gray-950 p-3 text-center border-t border-gray-800/50">
        <p className="text-sm text-gray-400">
          {isProfit ? (
            <>
              浮いたお金で...
              <span className="ml-2 font-bold text-yellow-400 underline decoration-yellow-400/30 underline-offset-4">
                {insight.message}
              </span>
            </>
          ) : (
            <>
              あと
              <span className="mx-1 font-bold text-white text-lg">
                {insight.hoursToBreakEven?.toFixed(1)}時間
              </span>
              遊べば、元が取れます（市場平均に勝利）！🔥
            </>
          )}
        </p>
      </div>
    </div>
  )
}
