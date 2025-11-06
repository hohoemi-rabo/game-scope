/**
 * OpenCritic API からデータを取得してSupabaseに同期する手動スクリプト
 *
 * 実行方法:
 * npx tsx scripts/sync-opencritic-to-supabase.ts
 */

import { config } from 'dotenv'
import { join } from 'path'
import { createClient } from '@supabase/supabase-js'

// .env.local を明示的に読み込む
config({ path: join(process.cwd(), '.env.local') })

const OPENCRITIC_API_KEY = process.env.OPENCRITIC_API_KEY
const RAPIDAPI_HOST = 'opencritic-api.p.rapidapi.com'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// 環境変数チェック
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ エラー: 環境変数が設定されていません')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? '✓' : '✗')
  process.exit(1)
}

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

async function fetchOpenCriticGames(): Promise<OpenCriticGame[]> {
  if (!OPENCRITIC_API_KEY) {
    throw new Error('OPENCRITIC_API_KEY が設定されていません')
  }

  console.log('📡 OpenCritic API からデータを取得中...\n')

  const response = await fetch(`https://${RAPIDAPI_HOST}/game`, {
    headers: {
      'x-rapidapi-key': OPENCRITIC_API_KEY,
      'x-rapidapi-host': RAPIDAPI_HOST,
    },
  })

  if (!response.ok) {
    throw new Error(`OpenCritic API error: ${response.status}`)
  }

  const data = await response.json()
  console.log(`✅ ${data.length}件のゲームデータを取得しました\n`)
  return data
}

async function syncToSupabase() {
  console.log('🚀 OpenCritic → Supabase 完全置き換え同期スクリプト開始\n')
  console.log('⚠️  注意: 既存のgamesテーブルを全削除してOpenCriticトップ20に置き換えます\n')
  console.log('='.repeat(60) + '\n')

  // Supabase クライアント作成
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  try {
    // 1. OpenCritic からデータ取得
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

    // 3. OpenCriticトップ20を挿入
    let insertedCount = 0

    for (const ocGame of opencriticGames) {
      console.log(`\n🎮 挿入中: ${ocGame.name} (ID: ${ocGame.id})`)

      // OpenCriticのURLからslugを抽出
      const slug = ocGame.url ? ocGame.url.split('/').pop() || ocGame.name.toLowerCase().replace(/\s+/g, '-') : ocGame.name.toLowerCase().replace(/\s+/g, '-')

      // プラットフォームの配列を生成
      const platforms = ocGame.Platforms?.map(p => p.shortName) || []

      // 画像URLを生成
      const thumbnailUrl = ocGame.images?.box?.og
        ? `https://img.opencritic.com/${ocGame.images.box.og}`
        : null

      const insertData = {
        title_ja: ocGame.name, // 後で手動で日本語化
        title_en: ocGame.name,
        opencritic_id: slug,
        opencritic_numeric_id: ocGame.id,
        platforms: platforms,
        metascore: Math.round(ocGame.topCriticScore),
        review_count: ocGame.numReviews,
        thumbnail_url: thumbnailUrl,
        release_date: ocGame.firstReleaseDate || null,
        opencritic_stats: `Top Critic Score: ${ocGame.topCriticScore}%, ${ocGame.percentRecommended}% Recommended, Tier: ${ocGame.tier}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      console.log(`   📝 データ:`)
      console.log(`      - タイトル: ${insertData.title_en}`)
      console.log(`      - スコア: ${insertData.metascore}`)
      console.log(`      - レビュー数: ${insertData.review_count}`)
      console.log(`      - プラットフォーム: ${platforms.join(', ')}`)
      console.log(`      - 画像: ${thumbnailUrl ? '✓' : '✗'}`)

      // Supabase に挿入
      const { error: insertError } = await supabase
        .from('games')
        .insert(insertData)

      if (insertError) {
        console.log(`   ❌ 挿入エラー: ${insertError.message}`)
        continue
      }

      console.log(`   ✅ 挿入完了`)
      insertedCount++
    }

    // 4. 結果サマリー
    console.log('\n' + '='.repeat(60))
    console.log('\n📊 同期結果サマリー\n')
    console.log(`   OpenCritic取得: ${opencriticGames.length}件`)
    console.log(`   Supabase挿入: ${insertedCount}件`)
    console.log('\n✅ 同期完了！')
    console.log('\n本番ページで確認してください: http://localhost:3000\n')

  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error)
    process.exit(1)
  }
}

// スクリプト実行
syncToSupabase()
