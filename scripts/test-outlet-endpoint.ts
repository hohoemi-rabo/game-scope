/**
 * OpenCritic /outlet エンドポイントのテスト
 */

const OPENCRITIC_API_BASE = 'https://opencritic-api.p.rapidapi.com'
const RAPIDAPI_HOST = 'opencritic-api.p.rapidapi.com'

async function testOutletEndpoint() {
  const apiKey = 'c863e4a93bmsh9c5c4f43d94f6cbp1ca1e8jsn8ea0f5bc7ad5'

  console.log('🔍 /outlet エンドポイントをテスト中...\n')

  const url = `${OPENCRITIC_API_BASE}/outlet`

  console.log(`📡 リクエスト: ${url}\n`)

  try {
    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': RAPIDAPI_HOST,
      },
    })

    console.log(`📊 ステータスコード: ${response.status} ${response.statusText}`)
    console.log(`📋 Content-Type: ${response.headers.get('content-type')}\n`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ エラー: ${errorText}`)
      return
    }

    const data = await response.json()
    console.log(`✅ 成功！\n`)
    console.log(`📦 データ構造:\n`)
    console.log(JSON.stringify(data, null, 2))

    // データの種類を確認
    if (Array.isArray(data)) {
      console.log(`\n📊 配列形式: ${data.length}件`)
      if (data.length > 0) {
        console.log(`\n🔑 1件目のフィールド:`)
        Object.keys(data[0]).forEach(key => {
          console.log(`   - ${key}: ${typeof data[0][key]}`)
        })
      }
    } else if (typeof data === 'object') {
      console.log(`\n📊 オブジェクト形式`)
      console.log(`\n🔑 フィールド一覧:`)
      Object.keys(data).forEach(key => {
        console.log(`   - ${key}: ${typeof data[key]}`)
      })
    }

  } catch (error) {
    console.error(`❌ エラー発生:`, error)
  }
}

testOutletEndpoint()
