import { cache } from 'react'
import { createServerClient } from './server'
import 'server-only'

interface SearchParams {
  query?: string
  platforms?: string[]
  minScore?: number
  maxScore?: number
  limit?: number
}

/**
 * ゲーム検索関数
 * タイトル、プラットフォーム、スコアでフィルタリング
 * React の cache() でメモ化されるため、同一リクエスト内で重複実行されない
 */
export const searchGames = cache(async ({
  query = '',
  platforms = [],
  minScore = 0,
  maxScore = 100,
  limit = 100,
}: SearchParams) => {
  const supabase = createServerClient()

  let dbQuery = supabase
    .from('games')
    .select('*')
    .gte('metascore', minScore)
    .lte('metascore', maxScore)

  // タイトル検索（日本語/英語の両方で検索）
  if (query) {
    dbQuery = dbQuery.or(`title_ja.ilike.%${query}%,title_en.ilike.%${query}%`)
  }

  // プラットフォームフィルター
  if (platforms.length > 0) {
    dbQuery = dbQuery.overlaps('platforms', platforms)
  }

  // ソートと制限
  dbQuery = dbQuery
    .order('metascore', { ascending: false })
    .limit(limit)

  const { data, error } = await dbQuery

  if (error) {
    console.error('Search error:', error)
    throw error
  }

  return data
})
