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
 * コスパランク
 */
export type CPHRank = 'god' | 'gold' | 'silver' | 'bronze' | 'luxury' | 'free' | 'unplayed'

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
 * 時間をフォーマット（例: 120時間, 1.5時間）
 */
export function formatPlayTime(minutes: number): string {
  const hours = minutes / 60
  if (hours >= 10) {
    return `${Math.round(hours)}時間`
  }
  if (hours >= 1) {
    return `${hours.toFixed(1)}時間`
  }
  return `${minutes}分`
}

/**
 * 金額をフォーマット（例: ¥9,000）
 */
export function formatPrice(price: number): string {
  return `¥${price.toLocaleString()}`
}
