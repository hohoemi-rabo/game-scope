import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/lib/supabase/types'
import { getOpenCriticNumericId } from '../src/lib/api/opencritic'

// .env.local から環境変数を読み込む
config({ path: '.env.local' })

// Supabase クライアントの作成（サービスロールキー使用）
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * 既存ゲームデータのOpenCritic数値IDを取得・更新
 */
async function updateOpenCriticNumericIds() {
  console.log('🔍 Fetching games without numeric IDs...')

  try {
    // opencritic_numeric_id が null のゲームを取得
    const { data: games, error } = await supabase
      .from('games')
      .select('id, title_en, opencritic_id, opencritic_numeric_id')
      .is('opencritic_numeric_id', null)
      .not('opencritic_id', 'is', null)

    if (error) {
      throw error
    }

    if (!games || games.length === 0) {
      console.log('✅ All games already have numeric IDs!')
      return
    }

    console.log(`📥 Found ${games.length} games to update`)

    let successCount = 0
    let failCount = 0

    // 各ゲームの数値IDを取得して更新
    for (const game of games) {
      console.log(`\n🎮 Processing: ${game.title_en}`)

      // OpenCritic APIで数値IDを取得
      const numericId = await getOpenCriticNumericId(game.title_en)

      if (numericId) {
        // データベースを更新
        const { error: updateError } = await supabase
          .from('games')
          .update({ opencritic_numeric_id: numericId })
          .eq('id', game.id)

        if (updateError) {
          console.error(`  ❌ Failed to update: ${updateError.message}`)
          failCount++
        } else {
          console.log(
            `  ✅ Updated: ${game.opencritic_id} -> ID ${numericId}`
          )
          successCount++
        }

        // API レート制限を避けるため、少し待機
        await new Promise((resolve) => setTimeout(resolve, 500))
      } else {
        console.log(`  ⚠️  Numeric ID not found`)
        failCount++
      }
    }

    console.log('\n📊 Summary:')
    console.log(`  ✅ Success: ${successCount}`)
    console.log(`  ❌ Failed: ${failCount}`)
    console.log(`  📝 Total: ${games.length}`)

    console.log('\n🎉 Update completed!')
  } catch (error) {
    console.error('❌ Error updating OpenCritic numeric IDs:', error)
    process.exit(1)
  }
}

// スクリプトの実行
updateOpenCriticNumericIds()
