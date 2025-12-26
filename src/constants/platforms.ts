/**
 * プラットフォームマスターデータ
 * ユーザーがプレイした機種を選択するための固定リスト
 */
export const PLATFORM_MASTER = [
  { id: 'pc', name: 'PC (Steam/Epic)', icon: '💻' },
  { id: 'ps5', name: 'PlayStation 5', icon: '🎮' },
  { id: 'ps4', name: 'PlayStation 4', icon: '🎮' },
  { id: 'switch', name: 'Nintendo Switch', icon: '🔴' },
  { id: 'xbox-series', name: 'Xbox Series X/S', icon: '💚' },
  { id: 'xbox-one', name: 'Xbox One', icon: '💚' },
  { id: 'smartphone', name: 'Smartphone (iOS/Android)', icon: '📱' },
  { id: 'retro', name: '旧世代機/その他', icon: '🕹️' },
] as const

export type PlatformId = (typeof PLATFORM_MASTER)[number]['id']

/**
 * プラットフォームIDから情報を取得
 */
export function getPlatformById(id: string) {
  return PLATFORM_MASTER.find((p) => p.id === id)
}

/**
 * プラットフォームIDからアイコンを取得
 */
export function getPlatformIcon(id: string): string {
  return getPlatformById(id)?.icon ?? '🎮'
}

/**
 * プラットフォームIDから名前を取得
 */
export function getPlatformName(id: string): string {
  return getPlatformById(id)?.name ?? id
}
