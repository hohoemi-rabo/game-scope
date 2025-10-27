/**
 * OpenCritic Search エンドポイントのテスト
 * 実際に機能するエンドポイントを確認する
 */

const OPENCRITIC_API_BASE = 'https://opencritic-api.p.rapidapi.com/api'
const RAPIDAPI_HOST = 'opencritic-api.p.rapidapi.com'

async function testSearch() {
  const apiKey = process.env.OPENCRITIC_API_KEY || 'c863e4a93bmsh9c5c4f43d94f6cbp1ca1e8jsn8ea0f5bc7ad5'

  console.log('🔍 OpenCritic Search エンドポイントをテスト中...\n')

  // 検索エンドポイント（前回成功したもの）
  const searchTerm = 'Elden Ring'
  const url = `${OPENCRITIC_API_BASE}/game/search?criteria=${encodeURIComponent(searchTerm)}`

  console.log(`📡 リクエスト: ${url}\n`)

  try {
    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': RAPIDAPI_HOST,
      },
    })

    console.log(`📊 ステータスコード: ${response.status} ${response.statusText}\n`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ エラー: ${errorText}`)
      return
    }

    const data = await response.json()
    console.log(`✅ 検索成功！\n`)
    console.log(`📦 検索結果:\n`)
    console.log(JSON.stringify(data, null, 2))

    if (Array.isArray(data) && data.length > 0) {
      console.log(`\n🔑 返ってくるフィールド:`)
      console.log(`   id: ${data[0].id !== undefined ? '✓ ' + data[0].id : '✗'}`)
      console.log(`   name: ${data[0].name !== undefined ? '✓ ' + data[0].name : '✗'}`)
      console.log(`   dist: ${data[0].dist !== undefined ? '✓ ' + data[0].dist : '✗'}`)

      // これが重要：詳細情報（スコアなど）が含まれるか？
      console.log(`\n⚠️ 詳細情報の確認:`)
      console.log(`   topCriticScore: ${data[0].topCriticScore !== undefined ? '✓ ' + data[0].topCriticScore : '✗ 含まれない'}`)
      console.log(`   numReviews: ${data[0].numReviews !== undefined ? '✓ ' + data[0].numReviews : '✗ 含まれない'}`)
      console.log(`   percentRecommended: ${data[0].percentRecommended !== undefined ? '✓ ' + data[0].percentRecommended : '✗ 含まれない'}`)

      if (!data[0].topCriticScore) {
        console.log(`\n💡 結論: 検索結果には基本情報（id, name）のみ含まれる`)
        console.log(`   → 詳細情報を取得するには /game/{id} エンドポイントを別途呼ぶ必要がある`)
      }
    }
  } catch (error) {
    console.error(`❌ エラー発生:`, error)
  }
}

testSearch()
