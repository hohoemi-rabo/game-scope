/**
 * OpenCritic + RAWG ハイブリッド同期スクリプト
 *
 * 実行方法:
 * npx tsx scripts/sync-hybrid-to-supabase.ts
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

import { config } from 'dotenv'
import { join } from 'path'

// 環境変数を最初に読み込む
config({ path: join(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'
import { searchRAWGGame, getRAWGGameDetails } from '../src/lib/api/rawg'
import type { Database } from '../src/lib/supabase/types'

const OPENCRITIC_API_KEY = process.env.OPENCRITIC_API_KEY
const RAPIDAPI_HOST = 'opencritic-api.p.rapidapi.com'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// 環境変数チェック
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ エラー: Supabase環境変数が設定されていません')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? '✓' : '✗')
  process.exit(1)
}

if (!OPENCRITIC_API_KEY) {
  console.error('❌ エラー: OPENCRITIC_API_KEY が設定されていません')
  process.exit(1)
}

if (!process.env.RAWG_API_KEY) {
  console.error('❌ エラー: RAWG_API_KEY が設定されていません')
  process.exit(1)
}

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
 * OpenCritic APIからゲームを取得（skipパラメータ対応）
 */
async function fetchOpenCriticGamesBatch(skip: number = 0): Promise<OpenCriticGame[]> {
  const skipParam = skip > 0 ? `?skip=${skip}` : ''
  console.log(`📡 OpenCritic API 取得中... (skip=${skip})`)

  const response = await fetch(`https://${RAPIDAPI_HOST}/game${skipParam}`, {
    headers: {
      'x-rapidapi-key': OPENCRITIC_API_KEY!,
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
async function fetchOpenCriticGames(): Promise<OpenCriticGame[]> {
  console.log('📡 OpenCritic APIからトップ60ゲームを取得中...\n')

  const allGames: OpenCriticGame[] = []

  // 1回目: 1-20位
  const batch1 = await fetchOpenCriticGamesBatch(0)
  allGames.push(...batch1)
  await new Promise((resolve) => setTimeout(resolve, 1000)) // APIレート制限対策

  // 2回目: 21-40位
  const batch2 = await fetchOpenCriticGamesBatch(20)
  allGames.push(...batch2)
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // 3回目: 41-60位
  const batch3 = await fetchOpenCriticGamesBatch(40)
  allGames.push(...batch3)

  console.log(`\n✅ 合計 ${allGames.length}件のゲームデータを取得しました\n`)
  return allGames
}

/**
 * RAWGから説明文とジャンルを取得
 */
async function fetchRAWGDetails(gameName: string): Promise<{
  description_en: string | null
  genres: string[]
}> {
  try {
    console.log(`   🔍 RAWGで検索: "${gameName}"`)

    const rawgGame = await searchRAWGGame(gameName)

    if (!rawgGame) {
      console.log(`   ⚠️  RAWGで見つかりませんでした`)
      return { description_en: null, genres: [] }
    }

    console.log(`   ✅ RAWG ID: ${rawgGame.id}`)

    // 詳細情報を取得（説明文）
    const details = await getRAWGGameDetails(rawgGame.id)
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
async function syncToSupabase() {
  console.log('🚀 OpenCritic + RAWG ハイブリッド同期開始\n')
  console.log('⚠️  注意: 既存のgamesテーブルを全削除してハイブリッドデータに置き換えます\n')
  console.log('='.repeat(60) + '\n')

  // Supabase クライアント作成
  const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  try {
    // 1. OpenCritic APIからトップ60ゲームを取得（20件×3回）
    const opencriticGames = await fetchOpenCriticGames()

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
        const rawgData = await fetchRAWGDetails(ocGame.name)

        // APIレート制限対策（少し待機）
        await new Promise((resolve) => setTimeout(resolve, 300))

        // Supabase形式に変換
        const gameData: Database['public']['Tables']['games']['Insert'] = {
          title_ja: null, // 後で手動で日本語化
          title_en: ocGame.name,
          opencritic_id: slug,
          opencritic_numeric_id: ocGame.id,
          platforms: platforms,
          metascore: Math.round(ocGame.topCriticScore),
          review_count: ocGame.numReviews,
          thumbnail_url: thumbnailUrl,
          release_date: ocGame.firstReleaseDate || null,
          description_en: rawgData.description_en, // RAWGから取得
          genres: rawgData.genres.length > 0 ? rawgData.genres : null, // RAWGから取得
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
    console.log('\n' + '='.repeat(60))
    console.log('\n📊 同期結果サマリー\n')
    console.log(`   OpenCritic取得: ${opencriticGames.length}件`)
    console.log(`   Supabase挿入: ${insertedCount}件`)
    console.log(`   エラー: ${errorCount}件`)
    console.log('\n✅ 同期完了！')
    console.log('\n📝 注意事項:')
    console.log('   - title_ja（日本語タイトル）は手動で追加してください')
    console.log('   - 本番ページで確認: http://localhost:3000\n')
  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error)
    process.exit(1)
  }
}

// スクリプト実行
syncToSupabase()
