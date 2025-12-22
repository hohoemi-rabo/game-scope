/**
 * CPH (Cost Per Hour) 計算ユーティリティ
 * ゲームのコストパフォーマンスを時間当たりコストで評価
 */

/**
 * CPH計算結果
 */
export interface CPHResult {
  cph: number | null
  rank: CPHRank
}

/**
 * コスパランク（計算用）
 */
export type CPHRank = 'god' | 'gold' | 'silver' | 'bronze' | 'luxury' | 'free' | 'unplayed'

/**
 * 表示用ランク（ステータスによる特例を含む）
 * - premium: Luxury + Completed の場合（極上の体験）
 * - lossCut: Luxury + Dropped の場合（損切り）
 */
export type DisplayRank = CPHRank | 'premium' | 'lossCut'

/**
 * ランク情報
 */
export interface RankInfo {
  rank: CPHRank
  label: string
  emoji: string
  color: string
  bgColor: string
  message: string
}

/**
 * ランク定義
 * - God Tier: 0〜50円/時間（実質無料レベル）
 * - Gold Tier: 51〜200円/時間（超優良）
 * - Silver Tier: 201〜500円/時間（映画館より安い）
 * - Bronze Tier: 501〜1500円/時間（適正価格）
 * - Luxury: 1501円〜/時間（贅沢品）
 * - Free: サブスク/無料
 * - Unplayed: 未プレイ
 */
export const RANK_INFO: Record<CPHRank, RankInfo> = {
  god: {
    rank: 'god',
    label: 'God Tier',
    emoji: '💎',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/10',
    message: '実質無料',
  },
  gold: {
    rank: 'gold',
    label: 'Gold Tier',
    emoji: '🥇',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    message: '超優良投資',
  },
  silver: {
    rank: 'silver',
    label: 'Silver Tier',
    emoji: '🥈',
    color: 'text-gray-300',
    bgColor: 'bg-gray-300/10',
    message: '映画館より安い',
  },
  bronze: {
    rank: 'bronze',
    label: 'Bronze Tier',
    emoji: '🥉',
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10',
    message: '適正価格',
  },
  luxury: {
    rank: 'luxury',
    label: 'Luxury',
    emoji: '💸',
    color: 'text-pink-400',
    bgColor: 'bg-pink-400/10',
    message: '贅沢な遊び',
  },
  free: {
    rank: 'free',
    label: 'Free',
    emoji: '🎁',
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    message: 'サブスク/無料',
  },
  unplayed: {
    rank: 'unplayed',
    label: 'Unplayed',
    emoji: '📚',
    color: 'text-text-secondary',
    bgColor: 'bg-gray-500/10',
    message: '未プレイ',
  },
}

/**
 * CPHを計算しランクを判定
 */
export function calculateCPH(
  purchasePrice: number,
  playTimeMinutes: number,
  isSubscription: boolean
): CPHResult {
  // サブスク/無料の場合
  if (isSubscription || purchasePrice === 0) {
    return { cph: 0, rank: 'free' }
  }

  // 未プレイの場合
  if (playTimeMinutes === 0) {
    return { cph: null, rank: 'unplayed' }
  }

  // 通常計算（円/時間）
  const playTimeHours = playTimeMinutes / 60
  const cph = Math.round(purchasePrice / playTimeHours)

  // ランク判定
  let rank: CPHRank
  if (cph <= 50) {
    rank = 'god'
  } else if (cph <= 200) {
    rank = 'gold'
  } else if (cph <= 500) {
    rank = 'silver'
  } else if (cph <= 1500) {
    rank = 'bronze'
  } else {
    rank = 'luxury'
  }

  return { cph, rank }
}

/**
 * ポートフォリオ全体の平均CPHを計算
 */
export function calculateAverageCPH(
  portfolios: Array<{
    purchase_price: number | null
    play_time_minutes: number | null
    is_subscription: boolean | null
  }>
): CPHResult {
  // 有効なエントリー（有料かつプレイ済み）のみ抽出
  const validEntries = portfolios.filter(
    (p) =>
      !p.is_subscription &&
      (p.purchase_price ?? 0) > 0 &&
      (p.play_time_minutes ?? 0) > 0
  )

  if (validEntries.length === 0) {
    // 全てサブスクまたは未プレイの場合
    const hasFreeGames = portfolios.some(
      (p) => p.is_subscription || (p.purchase_price ?? 0) === 0
    )
    if (hasFreeGames) {
      return { cph: 0, rank: 'free' }
    }
    return { cph: null, rank: 'unplayed' }
  }

  // 合計で計算
  const totalPrice = validEntries.reduce((sum, p) => sum + (p.purchase_price ?? 0), 0)
  const totalMinutes = validEntries.reduce((sum, p) => sum + (p.play_time_minutes ?? 0), 0)

  return calculateCPH(totalPrice, totalMinutes, false)
}

/**
 * 時間をフォーマット（例: 120時間, 1.5時間, 1時間）
 */
export function formatPlayTime(minutes: number): string {
  const hours = minutes / 60
  if (hours >= 10) {
    return `${Math.round(hours)}時間`
  }
  if (hours >= 1) {
    // 小数部分が0なら整数表示（1.0時間 → 1時間）
    const formatted = hours % 1 === 0 ? Math.floor(hours).toString() : hours.toFixed(1)
    return `${formatted}時間`
  }
  return `${minutes}分`
}

/**
 * 金額をフォーマット（例: ¥9,000）
 */
export function formatPrice(price: number): string {
  return `¥${price.toLocaleString()}`
}

/**
 * 目標CPH（デフォルト: ¥100/時間 = Gold Tierの半分）
 */
export const TARGET_CPH = 100

/**
 * 償却進捗を計算
 * 目標CPHに到達するまでの進捗率を返す
 */
export interface RecoveryProgress {
  /** 進捗率（0-100、100以上は達成済み） */
  percent: number
  /** 目標達成までの残り時間（分） */
  remainingMinutes: number
  /** 目標達成済みかどうか */
  achieved: boolean
}

export function calculateRecoveryProgress(
  purchasePrice: number,
  playTimeMinutes: number,
  isSubscription: boolean,
  targetCPH: number = TARGET_CPH
): RecoveryProgress {
  // サブスク/無料の場合は100%達成
  if (isSubscription || purchasePrice === 0) {
    return { percent: 100, remainingMinutes: 0, achieved: true }
  }

  // 目標達成に必要な時間（分）
  const targetMinutes = (purchasePrice / targetCPH) * 60

  // 進捗率
  const percent = Math.min((playTimeMinutes / targetMinutes) * 100, 100)

  // 残り時間
  const remainingMinutes = Math.max(targetMinutes - playTimeMinutes, 0)

  return {
    percent,
    remainingMinutes,
    achieved: playTimeMinutes >= targetMinutes,
  }
}

/**
 * ステータスに基づいて表示用ランクを決定
 * Luxury + Completed → Premium（極上の体験）
 * Luxury + Dropped → LossCut（損切り）
 */
export function getDisplayRank(rank: CPHRank, status: string | null): DisplayRank {
  if (rank === 'luxury') {
    if (status === 'completed') {
      return 'premium'
    }
    if (status === 'dropped') {
      return 'lossCut'
    }
  }
  return rank
}

/**
 * 株式風のカラークラス（CPHの良し悪しで色分け）
 * 低CPH = 緑（良い）、高CPH = 赤（悪い）
 * icon: 📉 = 遊ぶほど下がる（ポジティブ）
 */
export function getStockColor(rank: DisplayRank): {
  textColor: string
  bgColor: string
  borderColor: string
  barColor: string
  icon: string
} {
  switch (rank) {
    case 'god':
      return {
        textColor: 'text-emerald-400',
        bgColor: 'bg-emerald-900/30',
        borderColor: 'border-emerald-500/30',
        barColor: 'bg-emerald-500',
        icon: '🏆', // 達成！
      }
    case 'gold':
      return {
        textColor: 'text-emerald-400',
        bgColor: 'bg-emerald-900/30',
        borderColor: 'border-emerald-500/30',
        barColor: 'bg-emerald-500',
        icon: '📉', // 順調に下降中
      }
    case 'silver':
      return {
        textColor: 'text-yellow-400',
        bgColor: 'bg-yellow-900/30',
        borderColor: 'border-yellow-500/30',
        barColor: 'bg-yellow-500',
        icon: '📉', // まだ下がる
      }
    case 'bronze':
      return {
        textColor: 'text-orange-400',
        bgColor: 'bg-orange-900/30',
        borderColor: 'border-orange-500/30',
        barColor: 'bg-orange-500',
        icon: '📉', // もっと遊ぼう
      }
    case 'luxury':
      return {
        textColor: 'text-rose-500',
        bgColor: 'bg-rose-900/30',
        borderColor: 'border-rose-500/30',
        barColor: 'bg-rose-500',
        icon: '📉', // 遊んで下げよう
      }
    case 'premium':
      // Luxury + Completed: 紫（極上の体験）
      return {
        textColor: 'text-purple-400',
        bgColor: 'bg-purple-900/30',
        borderColor: 'border-purple-500/30',
        barColor: 'bg-purple-500',
        icon: '✨', // 完走！
      }
    case 'lossCut':
      // Luxury + Dropped: 暗い赤（損切り）
      return {
        textColor: 'text-rose-300',
        bgColor: 'bg-rose-950/30',
        borderColor: 'border-rose-800/30',
        barColor: 'bg-rose-800',
        icon: '📉', // 損切り
      }
    case 'free':
      return {
        textColor: 'text-cyan-400',
        bgColor: 'bg-cyan-900/30',
        borderColor: 'border-cyan-500/30',
        barColor: 'bg-cyan-500',
        icon: '🎁', // 無料！
      }
    case 'unplayed':
      return {
        textColor: 'text-gray-500',
        bgColor: 'bg-gray-800/50',
        borderColor: 'border-gray-600/30',
        barColor: 'bg-gray-600',
        icon: '📦', // 未開封
      }
  }
}

/**
 * CPHランクに対応するメタファー（アイコン付き）
 */
export function getCPHMetaphor(rank: DisplayRank): { emoji: string; label: string } {
  switch (rank) {
    case 'god':
      return { emoji: '💎', label: '実質無料' }
    case 'gold':
      return { emoji: '☕', label: '缶コーヒー級' }
    case 'silver':
      return { emoji: '🍜', label: 'ランチ級' }
    case 'bronze':
      return { emoji: '🎬', label: '映画館級' }
    case 'luxury':
      return { emoji: '💸', label: '元が取れていません' }
    case 'premium':
      return { emoji: '🍷', label: '極上の体験' }
    case 'lossCut':
      return { emoji: '📉', label: '損切り' }
    case 'free':
      return { emoji: '🎁', label: '完全無料' }
    case 'unplayed':
      return { emoji: '📦', label: '未開封' }
  }
}

/**
 * 次のランクへの昇格情報を取得
 */
export function getNextRankInfo(
  currentRank: CPHRank,
  purchasePrice: number,
  playTimeMinutes: number
): { nextRank: CPHRank; nextEmoji: string; nextLabel: string; minutesNeeded: number } | null {
  // 既に最高ランクまたは特殊ケース
  if (currentRank === 'god' || currentRank === 'free' || currentRank === 'unplayed') {
    return null
  }

  // 次のランクのCPH閾値（低いほど良い）
  const rankThresholds: { rank: CPHRank; maxCPH: number }[] = [
    { rank: 'god', maxCPH: 50 },
    { rank: 'gold', maxCPH: 200 },
    { rank: 'silver', maxCPH: 500 },
    { rank: 'bronze', maxCPH: 1500 },
    { rank: 'luxury', maxCPH: 99999 }, // luxuryの次はbronze
  ]

  // 現在のランクのインデックスを見つける
  const currentIndex = rankThresholds.findIndex((t) => t.rank === currentRank)
  if (currentIndex <= 0) return null // god(0)の場合は次がない

  // 次のランク（1つ上）
  const nextRankInfo = rankThresholds[currentIndex - 1]
  const nextMeta = getCPHMetaphor(nextRankInfo.rank)

  // 次のランクに到達するのに必要な時間（分）
  // CPH = price / hours → hours = price / CPH
  const hoursNeeded = purchasePrice / nextRankInfo.maxCPH
  const minutesNeeded = Math.max(0, hoursNeeded * 60 - playTimeMinutes)

  return {
    nextRank: nextRankInfo.rank,
    nextEmoji: nextMeta.emoji,
    nextLabel: nextMeta.label,
    minutesNeeded: Math.round(minutesNeeded),
  }
}

/**
 * 現在のランク内での進捗率を計算（RPG経験値バー風）
 * 例: Bronze (501-1500) で CPH=800 なら約70%
 */
export function getRankProgress(
  currentRank: CPHRank,
  purchasePrice: number,
  playTimeMinutes: number
): number {
  // 特殊ケース: 最高ランク、無料、未プレイ
  if (currentRank === 'god' || currentRank === 'free') return 100
  if (currentRank === 'unplayed' || playTimeMinutes === 0) return 0

  // ランクごとのCPH範囲（上限、下限）
  // 下限 = 次のランクの閾値、上限 = 現在のランクの閾値
  const rankBoundaries: Record<string, { min: number; max: number }> = {
    luxury: { min: 1501, max: 10000 }, // 1501円以上（上限は仮に10000）
    bronze: { min: 501, max: 1500 },   // 501-1500円
    silver: { min: 201, max: 500 },    // 201-500円
    gold: { min: 51, max: 200 },       // 51-200円
  }

  const boundaries = rankBoundaries[currentRank]
  if (!boundaries) return 0

  // 現在のCPHを計算
  const playTimeHours = playTimeMinutes / 60
  const currentCPH = purchasePrice / playTimeHours

  // 進捗計算: 高いCPH（悪い）から低いCPH（良い）への進捗
  // 100% = 次のランクに到達寸前（CPH = min）
  // 0% = 現在のランクに入ったばかり（CPH = max）
  const progress = ((boundaries.max - currentCPH) / (boundaries.max - boundaries.min)) * 100

  return Math.min(Math.max(progress, 0), 100)
}
