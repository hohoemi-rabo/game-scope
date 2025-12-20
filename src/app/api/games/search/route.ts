import { NextRequest, NextResponse } from 'next/server'
import * as deepl from 'deepl-node'
import type { GameSearchResult, GameSearchResponse, ApiErrorResponse } from '@/types/game-search'

const RAWG_API_KEY = process.env.RAWG_API_KEY
const RAWG_BASE_URL = 'https://api.rawg.io/api'
const DEEPL_API_KEY = process.env.DEEPL_API_KEY

// DeepL翻訳クライアント（APIキーがある場合のみ初期化）
const translator = DEEPL_API_KEY ? new deepl.Translator(DEEPL_API_KEY) : null

/**
 * 日本語が含まれているかチェック（ひらがな・カタカナ・漢字）
 */
function containsJapanese(text: string): boolean {
  return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text)
}

/**
 * 日本語を英語に翻訳（DeepL API使用）
 */
async function translateToEnglish(text: string): Promise<string> {
  if (!translator) {
    console.warn('DEEPL_API_KEY is not set, skipping translation')
    return text
  }

  try {
    const result = await translator.translateText(text, null, 'en-US')
    console.log(`Translated: "${text}" -> "${result.text}"`)
    return result.text
  } catch (error) {
    console.error('Translation failed:', error)
    // 翻訳失敗時は元のクエリをそのまま返す
    return text
  }
}

/**
 * RAWG APIでゲームを検索
 * GET /api/games/search?q=検索クエリ
 *
 * 日本語クエリは自動的に英語に翻訳してから検索（Translation Proxyパターン）
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
    // 日本語が含まれている場合は英語に翻訳
    let searchQuery = query
    if (containsJapanese(query)) {
      searchQuery = await translateToEnglish(query)
    }

    // ordering=-added: ユーザー追加数の降順（人気順）でソート
    const response = await fetch(
      `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(searchQuery)}&ordering=-added&page_size=10`,
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
