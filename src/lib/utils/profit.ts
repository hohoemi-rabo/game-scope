/**
 * 「もしも換算」ユーティリティ
 * ゲーマーの「実質無料」理論を可視化する
 */

/** 基準単価（一般的な娯楽コスト: 映画、カラオケ、飲み会の平均） */
export const STANDARD_ENTERTAINMENT_RATE = 1000 // ¥1,000/時間

/** 換算アイテムの型定義 */
export interface ConversionItem {
  name: string
  icon: string
  price: number
}

/** 換算アイテムのリスト */
export const CONVERSION_ITEMS: ConversionItem[] = [
  { name: 'ラーメン', icon: '🍜', price: 900 },
  { name: 'スタバのフラペチーノ', icon: '🥤', price: 700 },
  { name: '10連ガチャ', icon: '💎', price: 3000 },
  { name: '生ビール', icon: '🍺', price: 500 },
  { name: '映画鑑賞', icon: '🎬', price: 1900 },
  { name: 'うまい棒', icon: '🥢', price: 12 },
  { name: 'コンビニコーヒー', icon: '☕', price: 150 },
  { name: 'Netflix 1ヶ月', icon: '📺', price: 990 },
]

/** Market Insight の結果 */
export interface MarketInsightResult {
  /** 含み益（浮いたお金） */
  profit: number
  /** 換算アイテム */
  item: ConversionItem
  /** 換算数量 */
  count: number
  /** 表示用メッセージ */
  message: string
}

/**
 * シード値から疑似乱数を生成（日付ベースで毎日変わる）
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

/**
 * 今日の日付から安定したインデックスを取得
 */
function getTodaysSeed(): number {
  const today = new Date()
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
}

/** 投資状態（勝ち/先行投資中） */
export type InvestmentStatus = 'profit' | 'investing'

/** Market Insight の拡張結果（投資中も含む） */
export interface MarketInsightExtended {
  /** 投資状態 */
  status: InvestmentStatus
  /** 含み益（マイナスの場合は含み損） */
  profit: number
  /** 一般娯楽の仮想コスト */
  potentialCost: number
  /** 換算アイテム（利益がある場合のみ） */
  item?: ConversionItem
  /** 換算数量 */
  count?: number
  /** 表示用メッセージ */
  message?: string
  /** 元が取れるまでの残り時間（投資中の場合） */
  hoursToBreakEven?: number
}

/**
 * 含み益と換算アイテムを計算（投資中も対応）
 * @param totalSpend 総支出額（円）
 * @param totalHours 総プレイ時間（時間）
 * @returns MarketInsightExtended または null（プレイ時間がない場合）
 */
export function calculateMarketInsight(
  totalSpend: number,
  totalHours: number
): MarketInsightExtended | null {
  // プレイ時間がない場合は計算しない
  if (totalHours <= 0) {
    return null
  }

  // 1. 本来かかっていたコスト（一般的な娯楽の場合）
  const potentialCost = Math.round(totalHours * STANDARD_ENTERTAINMENT_RATE)

  // 2. 含み益（浮いたお金）
  const profit = Math.round(potentialCost - totalSpend)

  // 3. 勝ち負け判定
  const isProfit = profit >= 0

  // 負けている場合（先行投資中）
  if (!isProfit) {
    // 元が取れるまでの残り時間 = 損失額 ÷ 時間単価
    const hoursToBreakEven = Math.abs(profit) / STANDARD_ENTERTAINMENT_RATE

    return {
      status: 'investing',
      profit,
      potentialCost,
      hoursToBreakEven,
    }
  }

  // 勝っている場合
  // 日付ベースでアイテムを選択（毎日変わるが、同じ日は同じアイテム）
  const seed = getTodaysSeed()
  const randomValue = seededRandom(seed)
  const itemIndex = Math.floor(randomValue * CONVERSION_ITEMS.length)
  const item = CONVERSION_ITEMS[itemIndex]

  // 換算数量を計算
  let finalItem = item
  let count = Math.floor(profit / item.price)

  // 数量が0の場合は最も安いアイテムで計算
  if (count === 0) {
    const cheapestItem = CONVERSION_ITEMS.reduce((min, item) =>
      item.price < min.price ? item : min
    )
    count = Math.floor(profit / cheapestItem.price)
    finalItem = cheapestItem
  }

  return {
    status: 'profit',
    profit,
    potentialCost,
    item: finalItem,
    count,
    message: count > 0
      ? `${finalItem.icon} ${finalItem.name} ${count.toLocaleString()}${getCountSuffix(finalItem.name)}`
      : undefined,
  }
}

/**
 * アイテム名に応じた数量の助数詞を返す
 */
function getCountSuffix(itemName: string): string {
  if (itemName.includes('ガチャ')) return '回分'
  if (itemName.includes('Netflix') || itemName.includes('映画')) return '回分'
  if (itemName.includes('うまい棒')) return '本分'
  if (itemName.includes('ビール') || itemName.includes('コーヒー') || itemName.includes('フラペチーノ')) return '杯分'
  return '杯分'
}

/**
 * 複数のアイテムで換算した結果を取得（SNSシェア用など）
 */
export function getMultipleConversions(profit: number, maxItems: number = 3): Array<{
  item: ConversionItem
  count: number
}> {
  if (profit <= 0) return []

  return CONVERSION_ITEMS
    .map((item) => ({
      item,
      count: Math.floor(profit / item.price),
    }))
    .filter((result) => result.count > 0)
    .sort((a, b) => b.count - a.count) // 数量が多い順
    .slice(0, maxItems)
}
