/**
 * OpenCritic + RAWG ハイブリッド同期 Edge Function
 *
 * 実行頻度: 1日1回（午前3時 JST）
 *
 * 処理内容:
 * 1. OpenCritic APIから最新トップ60ゲームを取得（20件×3回、skipパラメータ使用）
 * 2. 各ゲームについてRAWGで検索し、説明文とジャンルを補完
 * 3. Supabaseに保存（既存データは削除して再作成）
 *
 * APIリクエスト数:
 * - OpenCritic: 3リクエスト（1日1回実行で月90リクエスト、無料枠100内）
 * - RAWG: 60リクエスト + 60リクエスト（検索+詳細）= 120リクエスト
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RAPIDAPI_HOST = 'opencritic-api.p.rapidapi.com'

/**
 * OpenCriticゲームデータ型
 */
interface OpenCriticGame {
  id: number
  name: string
  topCriticScore: number
  numReviews: number
  percentRecommended: number
  tier: string
  Platforms?: Array<{
    id: number
    name: string
    shortName: string
    releaseDate: string
  }>
  images?: {
    box?: {
      og: string
      sm: string
    }
    banner?: {
      og: string
      sm: string
    }
  }
  Genres?: Array<{
    id: number
    name: string
  }>
  firstReleaseDate?: string
  url?: string
}

/**
 * RAWG APIゲーム情報型定義
 */
interface GameRawg {
  id: number
  slug: string
  name: string
  released: string | null
  genres: { name: string }[]
  description_raw?: string
}

/**
 * OpenCritic APIからゲームを取得（skipパラメータ対応）
 */
async function fetchOpenCriticGamesBatch(
  apiKey: string,
  skip: number = 0
): Promise<OpenCriticGame[]> {
  const skipParam = skip > 0 ? `?skip=${skip}` : ''
  console.log(`📡 OpenCritic API 取得中... (skip=${skip})`)

  const response = await fetch(`https://${RAPIDAPI_HOST}/game${skipParam}`, {
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': RAPIDAPI_HOST,
    },
  })

  if (!response.ok) {
    throw new Error(`OpenCritic API error: ${response.status}`)
  }

  const data = await response.json()
  console.log(`   ✅ ${data.length}件取得しました`)
  return data
}

/**
 * OpenCritic APIから60件取得（20件×3回）
 */
async function fetchOpenCriticGames(apiKey: string): Promise<OpenCriticGame[]> {
  console.log('📡 OpenCritic APIからトップ60ゲームを取得中...\n')

  const allGames: OpenCriticGame[] = []

  // 1回目: 1-20位
  const batch1 = await fetchOpenCriticGamesBatch(apiKey, 0)
  allGames.push(...batch1)
  await new Promise((resolve) => setTimeout(resolve, 1000)) // APIレート制限対策

  // 2回目: 21-40位
  const batch2 = await fetchOpenCriticGamesBatch(apiKey, 20)
  allGames.push(...batch2)
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // 3回目: 41-60位
  const batch3 = await fetchOpenCriticGamesBatch(apiKey, 40)
  allGames.push(...batch3)

  console.log(`\n✅ 合計 ${allGames.length}件のゲームデータを取得しました\n`)
  return allGames
}

/**
 * RAWG APIを呼び出す
 */
async function fetchRAWG(
  apiKey: string,
  endpoint: string,
  params: Record<string, string> = {}
): Promise<any> {
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
 * ゲーム名でRAWGデータベースを検索
 */
async function searchRAWGGame(apiKey: string, gameName: string): Promise<GameRawg | null> {
  try {
    const data = await fetchRAWG(apiKey, 'games', {
      search: gameName,
      page_size: '1',
    })

    if (!data.results || data.results.length === 0) {
      console.warn(`RAWG: Game not found: ${gameName}`)
      return null
    }

    return data.results[0]
  } catch (error) {
    console.error('Failed to search RAWG game:', error)
    return null
  }
}

/**
 * ゲームIDから詳細情報を取得
 */
async function getRAWGGameDetails(apiKey: string, gameId: number): Promise<GameRawg | null> {
  try {
    const data = await fetchRAWG(apiKey, `games/${gameId}`)
    return data
  } catch (error) {
    console.error('Failed to get RAWG game details:', error)
    return null
  }
}

/**
 * RAWGから説明文とジャンルを取得
 */
async function fetchRAWGDetails(
  apiKey: string,
  gameName: string
): Promise<{
  description_en: string | null
  genres: string[]
}> {
  try {
    console.log(`   🔍 RAWGで検索: "${gameName}"`)

    const rawgGame = await searchRAWGGame(apiKey, gameName)

    if (!rawgGame) {
      console.log(`   ⚠️  RAWGで見つかりませんでした`)
      return { description_en: null, genres: [] }
    }

    console.log(`   ✅ RAWG ID: ${rawgGame.id}`)

    // 詳細情報を取得（説明文）
    const details = await getRAWGGameDetails(apiKey, rawgGame.id)
    const description = details?.description_raw || null
    const genres = rawgGame.genres?.map((g) => g.name) || []

    console.log(`   📝 説明文: ${description ? description.length + '文字' : 'なし'}`)
    console.log(`   🏷️  ジャンル: ${genres.length > 0 ? genres.join(', ') : 'なし'}`)

    return { description_en: description, genres }
  } catch (error) {
    console.log(`   ❌ RAWGエラー: ${error}`)
    return { description_en: null, genres: [] }
  }
}

/**
 * メイン同期処理
 */
serve(async (req) => {
  try {
    // 環境変数取得
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const opencriticApiKey = Deno.env.get('OPENCRITIC_API_KEY')
    const rawgApiKey = Deno.env.get('RAWG_API_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase環境変数が設定されていません')
    }

    if (!opencriticApiKey) {
      throw new Error('OPENCRITIC_API_KEY が設定されていません')
    }

    if (!rawgApiKey) {
      throw new Error('RAWG_API_KEY が設定されていません')
    }

    console.log('🚀 OpenCritic + RAWG ハイブリッド同期開始\n')
    console.log('⚠️  注意: 既存のgamesテーブルを全削除してハイブリッドデータに置き換えます\n')
    console.log('='.repeat(60) + '\n')

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. OpenCritic APIからトップ60ゲームを取得
    const opencriticGames = await fetchOpenCriticGames(opencriticApiKey)

    // 2. 既存データを全削除
    console.log('🗑️  既存のgamesテーブルを全削除中...\n')
    const { error: deleteError } = await supabase
      .from('games')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // 全削除（ダミー条件）

    if (deleteError) {
      throw new Error(`削除エラー: ${deleteError.message}`)
    }

    console.log('✅ 既存データを削除しました\n')
    console.log('='.repeat(60) + '\n')

    // 3. 各ゲームを処理
    let insertedCount = 0
    let errorCount = 0

    for (const ocGame of opencriticGames) {
      console.log(`\n🎮 処理中: ${ocGame.name} (OpenCritic ID: ${ocGame.id})`)

      try {
        // OpenCriticのURLからslugを抽出
        const slug = ocGame.url
          ? ocGame.url.split('/').pop() || ocGame.name.toLowerCase().replace(/\s+/g, '-')
          : ocGame.name.toLowerCase().replace(/\s+/g, '-')

        // プラットフォームの配列を生成
        const platforms = ocGame.Platforms?.map((p) => p.shortName) || []

        // 画像URLを生成
        const thumbnailUrl = ocGame.images?.box?.og
          ? `https://img.opencritic.com/${ocGame.images.box.og}`
          : null

        // RAWGから説明文とジャンルを取得
        const rawgData = await fetchRAWGDetails(rawgApiKey, ocGame.name)

        // APIレート制限対策（少し待機）
        await new Promise((resolve) => setTimeout(resolve, 300))

        // Supabase形式に変換
        const gameData = {
          title_ja: null, // 後で手動で日本語化
          title_en: ocGame.name,
          opencritic_id: slug,
          opencritic_numeric_id: ocGame.id,
          platforms: platforms,
          metascore: Math.round(ocGame.topCriticScore),
          review_count: ocGame.numReviews,
          thumbnail_url: thumbnailUrl,
          release_date: ocGame.firstReleaseDate || null,
          description_en: rawgData.description_en,
          genres: rawgData.genres.length > 0 ? rawgData.genres : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        console.log(`   📊 データサマリー:`)
        console.log(`      - タイトル: ${gameData.title_en}`)
        console.log(`      - スコア: ${gameData.metascore}`)
        console.log(`      - レビュー数: ${gameData.review_count}`)
        console.log(`      - プラットフォーム: ${platforms.slice(0, 3).join(', ')}`)
        console.log(`      - OpenCriticリンク: ✓`)
        console.log(`      - 説明文: ${rawgData.description_en ? '✓' : '✗'}`)
        console.log(`      - ジャンル: ${rawgData.genres.length > 0 ? '✓' : '✗'}`)
        console.log(`      - サムネイル: ${thumbnailUrl ? '✓' : '✗'}`)

        // Supabaseに挿入
        const { error: insertError } = await supabase.from('games').insert(gameData)

        if (insertError) {
          console.log(`   ❌ 挿入エラー: ${insertError.message}`)
          errorCount++
          continue
        }

        console.log(`   ✅ 挿入完了`)
        insertedCount++
      } catch (error) {
        console.log(`   ❌ エラー: ${error}`)
        errorCount++
      }
    }

    // 4. 結果サマリー
    const summary = {
      timestamp: new Date().toISOString(),
      opencritic_fetched: opencriticGames.length,
      supabase_inserted: insertedCount,
      errors: errorCount,
    }

    console.log('\n' + '='.repeat(60))
    console.log('\n📊 同期結果サマリー\n')
    console.log(`   OpenCritic取得: ${opencriticGames.length}件`)
    console.log(`   Supabase挿入: ${insertedCount}件`)
    console.log(`   エラー: ${errorCount}件`)
    console.log('\n✅ 同期完了！')

    // operation_logsに記録
    await supabase.from('operation_logs').insert({
      operation_type: 'auto_sync',
      status: 'success',
      message: `${insertedCount}件のゲームを同期しました`,
      details: summary,
    })

    return new Response(JSON.stringify(summary), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error)

    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorResponse = {
      error: errorMessage,
      timestamp: new Date().toISOString(),
    }

    // エラーログを記録
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey)
        await supabase.from('operation_logs').insert({
          operation_type: 'auto_sync',
          status: 'error',
          message: `同期に失敗しました: ${errorMessage}`,
          details: errorResponse,
        })
      }
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }

    return new Response(JSON.stringify(errorResponse), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
