/**
 * OpenCritic API クライアント
 * ゲーム情報の取得と数値IDの解決
 */

// OpenCritic API via RapidAPI
const OPENCRITIC_API_BASE = 'https://opencritic-api.p.rapidapi.com/api'
const RAPIDAPI_HOST = 'opencritic-api.p.rapidapi.com'

/**
 * OpenCritic API検索結果の型定義
 */
interface OpenCriticSearchResult {
  id: number
  name: string
  dist: number
}

/**
 * ゲームタイトルで検索して数値IDを取得
 * @param gameName ゲーム名（英語推奨）
 * @returns 数値ID、見つからない場合はnull
 */
export async function getOpenCriticNumericId(
  gameName: string
): Promise<number | null> {
  try {
    const apiKey = process.env.OPENCRITIC_API_KEY

    if (!apiKey) {
      console.warn('OPENCRITIC_API_KEY is not set')
      return null
    }

    // OpenCritic API: Search endpoint
    const searchUrl = `${OPENCRITIC_API_BASE}/game/search?criteria=${encodeURIComponent(gameName)}`

    const response = await fetch(searchUrl, {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': RAPIDAPI_HOST,
      },
      next: { revalidate: 86400 }, // 24時間キャッシュ
    })

    if (!response.ok) {
      console.error(
        `OpenCritic API error: ${response.status} ${response.statusText}`
      )
      return null
    }

    const results: OpenCriticSearchResult[] = await response.json()

    if (!results || results.length === 0) {
      console.warn(`No OpenCritic results found for: ${gameName}`)
      return null
    }

    // 最も近い結果を返す（dist が最小のもの）
    const bestMatch = results.reduce((prev, current) =>
      current.dist < prev.dist ? current : prev
    )

    console.log(
      `OpenCritic match: "${gameName}" -> ID ${bestMatch.id} (${bestMatch.name}, dist: ${bestMatch.dist})`
    )

    return bestMatch.id
  } catch (error) {
    console.error('Failed to fetch OpenCritic numeric ID:', error)
    return null
  }
}

/**
 * OpenCritic URL を構築
 * @param slug OpenCritic スラッグ (例: "elden-ring")
 * @param numericId 数値ID (例: 12090)
 * @returns 完全なURL、または数値IDが不明な場合はnull
 */
export function buildOpenCriticUrl(
  slug: string,
  numericId: number | null
): string | null {
  if (!numericId) return null
  return `https://opencritic.com/game/${numericId}/${slug}`
}
