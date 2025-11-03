/**
 * RAWG API クライアント
 * ゲームデータベースから詳細情報を取得
 *
 * ドキュメント: https://api.rawg.io/docs/
 * APIキー取得: https://rawg.io/apidocs
 */

/**
 * RAWG APIのゲーム情報型定義
 */
export interface GameRawg {
  id: number
  slug: string
  name: string
  released: string | null
  background_image: string | null
  rating: number | null
  ratings_count: number | null
  metacritic: number | null
  playtime: number | null
  platforms: { platform: { name: string } }[]
  genres: { name: string }[]
  stores: { store: { name: string; domain: string } }[]
  esrb_rating?: { id: number; name: string; slug: string } | null
  description_raw?: string
  short_screenshots?: { id: number; image: string }[]
}

/**
 * RAWG APIリストレスポンス
 */
interface RAWGListResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

/**
 * RAWG APIを呼び出す
 */
async function fetchRAWG(endpoint: string, params: Record<string, string> = {}): Promise<unknown> {
  const apiKey = process.env.RAWG_API_KEY

  if (!apiKey) {
    throw new Error('RAWG_API_KEY is not set in environment variables')
  }

  const url = new URL(`https://api.rawg.io/api/${endpoint}`)
  url.searchParams.set('key', apiKey)

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error(`RAWG API error: ${response.status}`)
  }

  return await response.json()
}

/**
 * RAWGのトップ評価ゲームを取得
 * メタスコアが高い順に取得
 */
export async function getTopRatedGames(limit: number = 20): Promise<GameRawg[]> {
  try {
    const data = await fetchRAWG('games', {
      ordering: '-metacritic', // メタスコア降順
      page_size: limit.toString(),
      metacritic: '80,100', // スコア80以上に限定
    }) as RAWGListResponse<GameRawg>

    return data.results
  } catch (error) {
    console.error('Failed to get top rated games:', error)
    throw error
  }
}

/**
 * ゲーム名でRAWGデータベースを検索
 */
export async function searchRAWGGame(gameName: string): Promise<GameRawg | null> {
  try {
    const data = await fetchRAWG('games', {
      search: gameName,
      page_size: '1',
    }) as RAWGListResponse<GameRawg>

    if (!data.results || data.results.length === 0) {
      console.warn(`RAWG: Game not found: ${gameName}`)
      return null
    }

    // 最も関連性の高い結果を返す
    return data.results[0]
  } catch (error) {
    console.error('Failed to search RAWG game:', error)
    return null
  }
}

/**
 * ゲームIDから詳細情報を取得
 * 説明文（description_raw）を含む完全な情報を取得
 */
export async function getRAWGGameDetails(gameId: number): Promise<GameRawg | null> {
  try {
    const data = await fetchRAWG(`games/${gameId}`) as GameRawg
    return data
  } catch (error) {
    console.error('Failed to get RAWG game details:', error)
    return null
  }
}

/**
 * ゲームのスクリーンショットを取得
 */
export async function getGameScreenshots(gameId: number): Promise<string[]> {
  try {
    const data = await fetchRAWG(`games/${gameId}/screenshots`) as RAWGListResponse<{ id: number; image: string }>

    if (!data.results || data.results.length === 0) {
      return []
    }

    return data.results.map((screenshot) => screenshot.image)
  } catch (error) {
    console.error('Failed to get game screenshots:', error)
    return []
  }
}
