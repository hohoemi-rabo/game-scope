/**
 * RAWG API動作確認スクリプト
 */
import { config } from 'dotenv'
import { join } from 'path'

// 環境変数を最初に読み込む（インポート前）
config({ path: join(process.cwd(), '.env.local') })

import { getTopRatedGames, searchRAWGGame, getRAWGGameDetails, getGameScreenshots } from '../src/lib/api/rawg'

async function main() {
  console.log('🔍 RAWG APIテスト開始\n')
  console.log('='.repeat(60) + '\n')

  // 1. トップ評価ゲームを取得
  console.log('📊 1. トップ評価ゲーム取得（上位5件）\n')
  try {
    const topGames = await getTopRatedGames(5)
    console.log(`✅ ${topGames.length}件取得しました\n`)

    topGames.forEach((game, index) => {
      console.log(`${index + 1}. ${game.name}`)
      console.log(`   Metacritic: ${game.metacritic || 'N/A'}`)
      console.log(`   Playtime: ${game.playtime || 0}時間`)
      console.log(`   Genres: ${game.genres.map(g => g.name).join(', ')}`)
      console.log(`   Platforms: ${game.platforms.slice(0, 3).map(p => p.platform.name).join(', ')}`)
      console.log(`   ESRB: ${game.esrb_rating?.name || 'N/A'}`)
      console.log()
    })
  } catch (error) {
    console.error('❌ エラー:', error)
  }

  console.log('='.repeat(60) + '\n')

  // 2. 特定のゲームを検索
  console.log('🔍 2. ゲーム検索テスト: "Elden Ring"\n')
  try {
    const game = await searchRAWGGame('Elden Ring')
    if (game) {
      console.log('✅ 見つかりました')
      console.log(`   ID: ${game.id}`)
      console.log(`   名前: ${game.name}`)
      console.log(`   Metacritic: ${game.metacritic || 'N/A'}`)
      console.log()
    } else {
      console.log('❌ 見つかりませんでした\n')
    }
  } catch (error) {
    console.error('❌ エラー:', error)
  }

  console.log('='.repeat(60) + '\n')

  // 3. ゲーム詳細情報取得
  console.log('📝 3. ゲーム詳細情報取得\n')
  try {
    const game = await searchRAWGGame('The Witcher 3')
    if (game) {
      const details = await getRAWGGameDetails(game.id)
      if (details?.description_raw) {
        console.log('✅ 説明文を取得しました')
        console.log(`   長さ: ${details.description_raw.length}文字`)
        console.log(`   プレビュー: ${details.description_raw.substring(0, 150)}...\n`)
      } else {
        console.log('⚠️  説明文がありません\n')
      }
    }
  } catch (error) {
    console.error('❌ エラー:', error)
  }

  console.log('='.repeat(60) + '\n')

  // 4. スクリーンショット取得
  console.log('🖼️  4. スクリーンショット取得テスト\n')
  try {
    const game = await searchRAWGGame('Portal 2')
    if (game) {
      const screenshots = await getGameScreenshots(game.id)
      console.log(`✅ ${screenshots.length}件のスクリーンショットを取得しました`)
      screenshots.slice(0, 3).forEach((url, index) => {
        console.log(`   ${index + 1}. ${url}`)
      })
      console.log()
    }
  } catch (error) {
    console.error('❌ エラー:', error)
  }

  console.log('='.repeat(60))
  console.log('\n✅ テスト完了')
}

main()
