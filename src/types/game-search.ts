/**
 * ゲーム検索関連の型定義
 * RAWGゲーム検索API用
 */

/**
 * RAWG API検索結果のゲーム情報
 */
export interface GameSearchResult {
  rawg_id: number
  title_en: string
  thumbnail_url: string | null
  release_date: string | null
  platforms: string[]
  genres: string[]
  metacritic: number | null
}

/**
 * ゲーム検索APIレスポンス
 */
export interface GameSearchResponse {
  games: GameSearchResult[]
}

/**
 * ゲーム登録リクエスト
 */
export interface RegisterGameRequest {
  rawg_id: number
  title_en: string
  title_ja?: string
  thumbnail_url?: string | null
  release_date?: string | null
  platforms?: string[]
  genres?: string[]
  metascore?: number | null
  description_en?: string | null
}

/**
 * ゲーム登録APIレスポンス
 */
export interface RegisterGameResponse {
  game_id: string
  existing: boolean
}

/**
 * APIエラーレスポンス
 */
export interface ApiErrorResponse {
  error: string
}
