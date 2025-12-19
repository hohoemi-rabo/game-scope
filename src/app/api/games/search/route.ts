import { NextRequest, NextResponse } from 'next/server'
import type { GameSearchResult, GameSearchResponse, ApiErrorResponse } from '@/types/game-search'

const RAWG_API_KEY = process.env.RAWG_API_KEY
const RAWG_BASE_URL = 'https://api.rawg.io/api'

/**
 * RAWG APIでゲームを検索
 * GET /api/games/search?q=検索クエリ
 */
export async function GET(request: NextRequest): Promise<NextResponse<GameSearchResponse | ApiErrorResponse>> {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  // クエリが短い場合は空配列を返す
  if (!query || query.length < 2) {
    return NextResponse.json({ games: [] })
  }

  if (!RAWG_API_KEY) {
    console.error('RAWG_API_KEY is not set')
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    )
  }

  try {
    const response = await fetch(
      `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(query)}&page_size=10`,
      { next: { revalidate: 3600 } } // 1時間キャッシュ
    )

    if (!response.ok) {
      throw new Error(`RAWG API error: ${response.status}`)
    }

    const data = await response.json()

    // RAWG APIレスポンスを整形
    const games: GameSearchResult[] = data.results.map((game: {
      id: number
      name: string
      background_image: string | null
      released: string | null
      platforms: { platform: { name: string } }[] | null
      genres: { name: string }[] | null
      metacritic: number | null
    }) => ({
      rawg_id: game.id,
      title_en: game.name,
      thumbnail_url: game.background_image,
      release_date: game.released,
      platforms: game.platforms?.map((p) => p.platform.name) || [],
      genres: game.genres?.map((g) => g.name) || [],
      metacritic: game.metacritic,
    }))

    return NextResponse.json({ games })
  } catch (error) {
    console.error('RAWG search error:', error)
    return NextResponse.json(
      { error: 'Failed to search games' },
      { status: 500 }
    )
  }
}
