/**
 * ニュースサイト別カラーユーティリティ
 * フィルターボタンとニュースカードで共通使用
 */

interface PlatformColors {
  selected: string
  default: string
  badge: string
  border: string
  hoverBorder: string
  hex: string
}

const colorMap: Record<string, PlatformColors> = {
  'All': {
    selected: 'bg-accent text-white',
    default: 'bg-accent/20 text-accent hover:bg-accent/30',
    badge: 'bg-accent/20 text-accent',
    border: 'border-l-accent',
    hoverBorder: 'hover:border-accent',
    hex: '#5865f2',
  },
  '4Gamer': {
    selected: 'bg-[#5865f2] text-white',
    default: 'bg-[#5865f2]/20 text-[#5865f2] hover:bg-[#5865f2]/30',
    badge: 'bg-[#5865f2]/20 text-[#5865f2]',
    border: 'border-l-[#5865f2]',
    hoverBorder: 'hover:border-[#5865f2]',
    hex: '#5865f2',
  },
  '4Gamer (PC)': {
    selected: 'bg-[#9b59b6] text-white',
    default: 'bg-[#9b59b6]/20 text-[#9b59b6] hover:bg-[#9b59b6]/30',
    badge: 'bg-[#9b59b6]/20 text-[#9b59b6]',
    border: 'border-l-[#9b59b6]',
    hoverBorder: 'hover:border-[#9b59b6]',
    hex: '#9b59b6',
  },
  '4Gamer (スマホ)': {
    selected: 'bg-[#e91e63] text-white',
    default: 'bg-[#e91e63]/20 text-[#e91e63] hover:bg-[#e91e63]/30',
    badge: 'bg-[#e91e63]/20 text-[#e91e63]',
    border: 'border-l-[#e91e63]',
    hoverBorder: 'hover:border-[#e91e63]',
    hex: '#e91e63',
  },
  '4Gamer (PlayStation)': {
    selected: 'bg-[#3498db] text-white',
    default: 'bg-[#3498db]/20 text-[#3498db] hover:bg-[#3498db]/30',
    badge: 'bg-[#3498db]/20 text-[#3498db]',
    border: 'border-l-[#3498db]',
    hoverBorder: 'hover:border-[#3498db]',
    hex: '#3498db',
  },
  '4Gamer (Switch)': {
    selected: 'bg-[#e74c3c] text-white',
    default: 'bg-[#e74c3c]/20 text-[#e74c3c] hover:bg-[#e74c3c]/30',
    badge: 'bg-[#e74c3c]/20 text-[#e74c3c]',
    border: 'border-l-[#e74c3c]',
    hoverBorder: 'hover:border-[#e74c3c]',
    hex: '#e74c3c',
  },
  'PlayStation Blog': {
    selected: 'bg-[#667eea] text-white',
    default: 'bg-[#667eea]/20 text-[#667eea] hover:bg-[#667eea]/30',
    badge: 'bg-[#667eea]/20 text-[#667eea]',
    border: 'border-l-[#667eea]',
    hoverBorder: 'hover:border-[#667eea]',
    hex: '#667eea',
  },
  'Nintendo': {
    selected: 'bg-[#f59e0b] text-white',
    default: 'bg-[#f59e0b]/20 text-[#f59e0b] hover:bg-[#f59e0b]/30',
    badge: 'bg-[#f59e0b]/20 text-[#f59e0b]',
    border: 'border-l-[#f59e0b]',
    hoverBorder: 'hover:border-[#f59e0b]',
    hex: '#f59e0b',
  },
  'Game*Spark': {
    selected: 'bg-[#00c896] text-white',
    default: 'bg-[#00c896]/20 text-[#00c896] hover:bg-[#00c896]/30',
    badge: 'bg-[#00c896]/20 text-[#00c896]',
    border: 'border-l-[#00c896]',
    hoverBorder: 'hover:border-[#00c896]',
    hex: '#00c896',
  },
  'GAME Watch': {
    selected: 'bg-[#06b6d4] text-white',
    default: 'bg-[#06b6d4]/20 text-[#06b6d4] hover:bg-[#06b6d4]/30',
    badge: 'bg-[#06b6d4]/20 text-[#06b6d4]',
    border: 'border-l-[#06b6d4]',
    hoverBorder: 'hover:border-[#06b6d4]',
    hex: '#06b6d4',
  },
  'GAMER': {
    selected: 'bg-[#fbbf24] text-white',
    default: 'bg-[#fbbf24]/20 text-[#fbbf24] hover:bg-[#fbbf24]/30',
    badge: 'bg-[#fbbf24]/20 text-[#fbbf24]',
    border: 'border-l-[#fbbf24]',
    hoverBorder: 'hover:border-[#fbbf24]',
    hex: '#fbbf24',
  },
}

/**
 * フィルターボタンの色を取得
 */
export const getPlatformButtonColor = (platform: string, isSelected: boolean): string => {
  const colors = colorMap[platform] || {
    selected: 'bg-accent text-white',
    default: 'bg-gray-800 text-text-secondary hover:bg-gray-700',
    badge: 'bg-gray-700/50 text-text-secondary',
    border: 'border-l-gray-700',
  }

  return isSelected ? colors.selected : colors.default
}

/**
 * ニュースカードのバッジ色を取得
 */
export const getPlatformBadgeColor = (platform: string): string => {
  const colors = colorMap[platform]
  return colors ? colors.badge : 'bg-gray-700/50 text-text-secondary'
}

/**
 * ニュースカードの左ボーダー色を取得
 */
export const getPlatformBorderColor = (platform: string): string => {
  const colors = colorMap[platform]
  return colors ? colors.border : 'border-l-gray-700'
}

/**
 * ホバー時のボーダー色を取得
 */
export const getPlatformHoverBorderColor = (platform: string): string => {
  const colors = colorMap[platform]
  return colors ? colors.hoverBorder : 'hover:border-gray-600'
}

/**
 * プラットフォームのHEXカラーを取得
 */
export const getPlatformHexColor = (platform: string): string => {
  const colors = colorMap[platform]
  return colors ? colors.hex : '#6b7280'
}
