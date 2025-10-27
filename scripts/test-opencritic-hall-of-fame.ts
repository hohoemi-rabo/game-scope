/**
 * OpenCritic 一覧取得エンドポイントのテスト
 * どのようなデータ構造が返ってくるか確認する
 */

import 'dotenv/config'

const OPENCRITIC_API_BASE = 'https://opencritic-api.p.rapidapi.com/api'
const RAPIDAPI_HOST = 'opencritic-api.p.rapidapi.com'

async function testEndpoint(apiKey: string, endpoint: string) {
  const url = `${OPENCRITIC_API_BASE}${endpoint}`

  console.log(`\n${'='.repeat(60)}`)
  console.log(`📡 テスト中: ${endpoint}`)
  console.log(`   URL: ${url}`)
  console.log('='.repeat(60) + '\n')

  try {
    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': RAPIDAPI_HOST,
      },
    })

    console.log(`📊 ステータスコード: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ エラー: ${errorText}\n`)
      return null
    }

    const data = await response.json()
    console.log(`✅ 成功！\n`)

    if (Array.isArray(data) && data.length > 0) {
      console.log(`📦 配列データ取得: ${data.length}件\n`)
      console.log(`🎮 1件目のデータ構造:\n`)
      console.log(JSON.stringify(data[0], null, 2))

      console.log(`\n🔑 重要フィールドの確認:`)
      console.log(`   id: ${data[0].id !== undefined ? '✓' : '✗'}`)
      console.log(`   name/title: ${data[0].name !== undefined || data[0].title !== undefined ? '✓' : '✗'}`)
      console.log(`   topCriticScore/score: ${data[0].topCriticScore !== undefined || data[0].score !== undefined ? '✓' : '✗'}`)
      console.log(`   numReviews: ${data[0].numReviews !== undefined ? '✓' : '✗'}`)
      console.log(`   percentRecommended: ${data[0].percentRecommended !== undefined ? '✓' : '✗'}`)

      return data
    } else if (typeof data === 'object') {
      console.log(`📦 オブジェクト形式:\n`)
      console.log(JSON.stringify(data, null, 2))
      return data
    }

    return null
  } catch (error) {
    console.error(`❌ エラー発生:`, error)
    return null
  }
}

async function main() {
  const apiKey = process.env.OPENCRITIC_API_KEY

  if (!apiKey) {
    console.error('❌ OPENCRITIC_API_KEY が設定されていません')
    process.exit(1)
  }

  console.log('🔍 OpenCritic 一覧取得エンドポイントをテスト中...')

  const endpoints = [
    '/game/popular',
    '/game/hall-of-fame',
    '/game/recently-released',
    '/game/upcoming',
  ]

  for (const endpoint of endpoints) {
    await testEndpoint(apiKey, endpoint)
    // レート制限対策: 各リクエストの間に2秒待機
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  console.log('\n✅ 全テスト完了！')
}

main()
