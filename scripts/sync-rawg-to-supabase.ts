/**
 * RAWG API からデータを取得してSupabaseに同期するスクリプト
 *
 * 実行方法:
 * npx tsx scripts/sync-rawg-to-supabase.ts
 *
 * 処理内容:
 * 1. RAWG APIからトップ評価ゲーム（Metacritic 80+）を取得
 * 2. 各ゲームの詳細情報（説明文、スクリーンショット）を取得
 * 3. Supabaseに保存（既存データは削除して再作成）
 */

import { config } from 'dotenv'
import { join } from 'path'

// 環境変数を最初に読み込む
config({ path: join(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'
import { getTopRatedGames, getRAWGGameDetails } from '../src/lib/api/rawg'
import type { GameRawg } from '../src/lib/api/rawg'
import type { Database } from '../src/lib/supabase/types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// 環境変数チェック
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ エラー: Supabase環境変数が設定されていません')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? '✓' : '✗')
  process.exit(1)
}

if (!process.env.RAWG_API_KEY) {
  console.error('❌ エラー: RAWG_API_KEY が設定されていません')
  process.exit(1)
}

/**
 * RAWGゲームをSupabase形式に変換
 */
function convertToSupabaseFormat(
  rawgGame: GameRawg,
  detailedInfo: GameRawg | null
): Database['public']['Tables']['games']['Insert'] {
  // プラットフォーム名の配列を作成
  const platforms = rawgGame.platforms.map((p) => p.platform.name)

  // ジャンル名の配列を作成
  const genres = rawgGame.genres.map((g) => g.name)

  // ストアURLを取得（最初のストアを使用）
  const storeUrl = rawgGame.stores && rawgGame.stores.length > 0
    ? `https://${rawgGame.stores[0].store.domain}`
    : null

  // ESRB評価を取得
  const esrbRating = rawgGame.esrb_rating?.name || null
  const esrbSlug = rawgGame.esrb_rating?.slug || null

  // 説明文を取得（詳細情報がある場合）
  const descriptionEn = detailedInfo?.description_raw || null

  return {
    rawg_id: rawgGame.id.toString(),
    title_ja: null, // 日本語タイトルは後で手動で追加
    title_en: rawgGame.name,
    platforms,
    metascore: rawgGame.metacritic,
    playtime: rawgGame.playtime,
    genres,
    store_url: storeUrl,
    esrb_rating: esrbRating,
    esrb_slug: esrbSlug,
    description_en: descriptionEn,
    release_date: rawgGame.released,
    thumbnail_url: rawgGame.background_image,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

/**
 * メイン同期処理
 */
async function syncToSupabase() {
  console.log('🚀 RAWG → Supabase 同期スクリプト開始\n')
  console.log('⚠️  注意: 既存のgamesテーブルを全削除してRAWGトップ評価ゲームに置き換えます\n')
  console.log('='.repeat(60) + '\n')

  // Supabase クライアント作成
  const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  try {
    // 1. RAWG APIからトップ評価ゲームを取得（50件）
    console.log('📡 RAWG APIからトップ評価ゲームを取得中...\n')
    const rawgGames = await getTopRatedGames(50)
    console.log(`✅ ${rawgGames.length}件のゲームデータを取得しました\n`)

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

    // 3. 各ゲームの詳細情報を取得してSupabaseに挿入
    let insertedCount = 0
    let errorCount = 0

    for (const rawgGame of rawgGames) {
      console.log(`\n🎮 処理中: ${rawgGame.name} (RAWG ID: ${rawgGame.id})`)

      try {
        // 詳細情報を取得（説明文含む）
        console.log(`   📝 詳細情報を取得中...`)
        const detailedInfo = await getRAWGGameDetails(rawgGame.id)

        // Supabase形式に変換
        const gameData = convertToSupabaseFormat(rawgGame, detailedInfo)

        console.log(`   📊 データ:`)
        console.log(`      - タイトル: ${gameData.title_en}`)
        console.log(`      - スコア: ${gameData.metascore || 'N/A'}`)
        console.log(`      - プレイ時間: ${gameData.playtime || 0}時間`)
        console.log(`      - ジャンル: ${gameData.genres?.join(', ') || 'N/A'}`)
        console.log(`      - プラットフォーム: ${gameData.platforms?.slice(0, 3).join(', ') || 'N/A'}`)
        console.log(`      - ESRB: ${gameData.esrb_rating || 'N/A'}`)
        console.log(`      - 説明文: ${gameData.description_en ? '✓ (' + gameData.description_en.length + '文字)' : '✗'}`)
        console.log(`      - サムネイル: ${gameData.thumbnail_url ? '✓' : '✗'}`)

        // Supabaseに挿入
        const { error: insertError } = await supabase
          .from('games')
          .insert(gameData)

        if (insertError) {
          console.log(`   ❌ 挿入エラー: ${insertError.message}`)
          errorCount++
          continue
        }

        console.log(`   ✅ 挿入完了`)
        insertedCount++

        // APIレート制限対策（少し待機）
        await new Promise((resolve) => setTimeout(resolve, 300))
      } catch (error) {
        console.log(`   ❌ エラー: ${error}`)
        errorCount++
      }
    }

    // 4. 結果サマリー
    console.log('\n' + '='.repeat(60))
    console.log('\n📊 同期結果サマリー\n')
    console.log(`   RAWG取得: ${rawgGames.length}件`)
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
