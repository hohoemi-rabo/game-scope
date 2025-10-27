/**
 * /game エンドポイントのデータ構造を詳細確認
 */

const RAPIDAPI_KEY = 'c863e4a93bmsh9c5c4f43d94f6cbp1ca1e8jsn8ea0f5bc7ad5'
const RAPIDAPI_HOST = 'opencritic-api.p.rapidapi.com'

async function checkGameData() {
  const url = `https://${RAPIDAPI_HOST}/game`

  console.log('🔍 /game エンドポイントのデータ構造を確認...\n')

  try {
    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST,
      },
    })

    if (!response.ok) {
      console.error(`❌ エラー: ${response.status}`)
      return
    }

    const data = await response.json()

    console.log(`✅ ${data.length}件のゲームデータを取得\n`)

    // 1件目のデータを完全に表示
    console.log('📦 1件目の完全なデータ:\n')
    console.log(JSON.stringify(data[0], null, 2))

    console.log('\n' + '='.repeat(60))
    console.log('🔑 重要フィールドの確認')
    console.log('='.repeat(60) + '\n')

    // 詳細ページ表示に必要なフィールド
    const game = data[0]
    console.log('✓ 詳細ページ表示に必要なフィールド:')
    console.log(`  id (数値ID): ${game.id !== undefined ? '✅ ' + game.id : '❌ なし'}`)
    console.log(`  name (タイトル): ${game.name !== undefined ? '✅ ' + game.name : '❌ なし'}`)
    console.log(`  topCriticScore (スコア): ${game.topCriticScore !== undefined ? '✅ ' + game.topCriticScore : '❌ なし'}`)
    console.log(`  numReviews (レビュー数): ${game.numReviews !== undefined ? '✅ ' + game.numReviews : '❌ なし'}`)
    console.log(`  percentRecommended: ${game.percentRecommended !== undefined ? '✅ ' + game.percentRecommended : '❌ なし'}`)
    console.log(`  tier (ランク): ${game.tier !== undefined ? '✅ ' + game.tier : '❌ なし'}`)
    console.log(`  Platforms: ${game.Platforms !== undefined ? '✅ 配列' : '❌ なし'}`)
    console.log(`  images: ${game.images !== undefined ? '✅ あり' : '❌ なし'}`)

    console.log('\n✓ OpenCriticリンク構築用:')
    if (game.id) {
      // OpenCriticのURL形式を確認
      // 実際のOpenCriticサイトでは /game/{numeric_id}/{slug} という形式
      // slugはゲーム名から生成されることが多い
      const slug = game.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const opencriticUrl = `https://opencritic.com/game/${game.id}/${slug}`
      console.log(`  構築可能なURL: ${opencriticUrl}`)
    } else {
      console.log(`  ❌ IDがないため、OpenCriticリンクを構築できません`)
    }

    console.log('\n✓ その他のフィールド:')
    Object.keys(game).forEach(key => {
      if (!['id', 'name', 'topCriticScore', 'numReviews', 'percentRecommended', 'tier', 'Platforms', 'images'].includes(key)) {
        const value = game[key]
        const type = Array.isArray(value) ? 'array' : typeof value
        console.log(`  ${key}: ${type}`)
      }
    })

    // 複数ゲームで確認
    console.log('\n' + '='.repeat(60))
    console.log('📊 全ゲームのID確認')
    console.log('='.repeat(60) + '\n')

    data.slice(0, 5).forEach((game: any, index: number) => {
      console.log(`${index + 1}. ${game.name || 'Unknown'}`)
      console.log(`   ID: ${game.id || '❌ なし'}`)
      console.log(`   Score: ${game.topCriticScore || 'N/A'}`)
      console.log(`   Reviews: ${game.numReviews || 'N/A'}`)
    })

    console.log('\n✅ データ構造確認完了')

  } catch (error) {
    console.error('❌ エラー:', error)
  }
}

checkGameData()
