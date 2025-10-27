/**
 * OpenCritic のゲーム関連エンドポイントを探索
 */

const RAPIDAPI_KEY = 'c863e4a93bmsh9c5c4f43d94f6cbp1ca1e8jsn8ea0f5bc7ad5'
const RAPIDAPI_HOST = 'opencritic-api.p.rapidapi.com'

async function testEndpoint(path: string) {
  const url = `https://${RAPIDAPI_HOST}${path}`

  console.log(`\n${'='.repeat(60)}`)
  console.log(`📡 テスト: ${path}`)
  console.log('='.repeat(60))

  try {
    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST,
      },
    })

    console.log(`📊 ステータス: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      const text = await response.text()
      console.log(`❌ エラー: ${text.substring(0, 200)}`)
      return
    }

    const data = await response.json()

    if (Array.isArray(data)) {
      console.log(`✅ 成功！配列: ${data.length}件`)
      if (data.length > 0) {
        console.log(`\n📦 1件目のデータ:`)
        console.log(JSON.stringify(data[0], null, 2).substring(0, 500))

        // ゲームデータか確認
        const hasGameFields = data[0].name && (data[0].topCriticScore !== undefined || data[0].tier !== undefined)
        console.log(`\n${hasGameFields ? '✅ ゲームデータっぽい' : '⚠️ ゲームデータではなさそう'}`)
      }
    } else if (typeof data === 'object') {
      console.log(`✅ 成功！オブジェクト`)
      console.log(JSON.stringify(data, null, 2).substring(0, 500))
    }

  } catch (error) {
    console.log(`❌ エラー: ${error}`)
  }
}

async function main() {
  console.log('🔍 OpenCritic エンドポイント探索...\n')

  const endpoints = [
    '/game',                    // 一般的なゲーム一覧
    '/games',                   // 複数形
    '/game/list',              // リスト形式
    '/game/all',               // 全ゲーム
    '/game/top',               // トップゲーム
    '/game/latest',            // 最新ゲーム
    '/review',                 // レビュー
    '/api/game',               // APIプレフィックス付き
    '/api/game/hall-of-fame',  // APIプレフィックス付き
  ]

  for (const endpoint of endpoints) {
    await testEndpoint(endpoint)
    await new Promise(r => setTimeout(r, 1000)) // 1秒待機
  }

  console.log('\n✅ 探索完了')
}

main()
