/**
 * ポートフォリオ関連の型定義
 */

import type { Tables } from '@/lib/supabase/types'

/**
 * ゲーム情報（ポートフォリオで使用する部分）
 */
export interface PortfolioGame {
  id: string
  title_ja: string | null
  title_en: string
  thumbnail_url: string | null
  metascore: number | null
}

/**
 * ポートフォリオエントリー（ゲーム情報付き）
 */
export interface PortfolioWithGame extends Tables<'user_portfolios'> {
  games: PortfolioGame
}

/**
 * ゲームステータス
 */
export type GameStatus = 'playing' | 'completed' | 'dropped' | 'backlog'

/**
 * ステータス表示情報
 */
export interface StatusInfo {
  value: GameStatus
  emoji: string
  label: string
  description: string
}

/**
 * ステータス定義
 */
export const STATUS_INFO: Record<GameStatus, StatusInfo> = {
  playing: {
    value: 'playing',
    emoji: '🎮',
    label: 'Playing',
    description: 'プレイ中',
  },
  completed: {
    value: 'completed',
    emoji: '✅',
    label: 'Completed',
    description: 'クリア済み',
  },
  dropped: {
    value: 'dropped',
    emoji: '❌',
    label: 'Dropped',
    description: 'やめた',
  },
  backlog: {
    value: 'backlog',
    emoji: '📚',
    label: 'Backlog',
    description: '積みゲー',
  },
}
