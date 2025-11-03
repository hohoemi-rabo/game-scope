/**
 * OpenCritic API /game エンドポイントのページネーション確認
 *
 * テスト内容:
 * 1. パラメータなしで叩く（デフォルト）
 * 2. limit パラメータを試す
 * 3. offset/skip パラメータを試す
 * 4. page パラメータを試す
 */

import { config } from 'dotenv'
import { join } from 'path'

config({ path: join(process.cwd(), '.env.local') })

const OPENCRITIC_API_KEY = process.env.OPENCRITIC_API_KEY
const RAPIDAPI_HOST = 'opencritic-api.p.rapidapi.com'

async function testEndpoint(params: string = '') {
  const url = `https://${RAPIDAPI_HOST}/game${params}`
  console.log(`\n📡 テスト: ${url}`)

  try {
    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key': OPENCRITIC_API_KEY!,
        'x-rapidapi-host': RAPIDAPI_HOST,
      },
    })

    console.log(`   ステータス: ${response.status}`)

    if (response.ok) {
      const data = await response.json()

      if (Array.isArray(data)) {
        console.log(`   ✅ 取得件数: ${data.length}件`)
        console.log(`   最初のゲーム: ${data[0]?.name || 'N/A'} (ID: ${data[0]?.id})`)
        console.log(`   最後のゲーム: ${data[data.length - 1]?.name || 'N/A'} (ID: ${data[data.length - 1]?.id})`)
      } else {
        console.log(`   ⚠️  配列ではない: ${typeof data}`)
      }
    } else {
      const text = await response.text()
      console.log(`   ❌ エラー: ${text.substring(0, 100)}`)
    }
  } catch (error) {
    console.log(`   ❌ 例外: ${error}`)
  }
}

async function main() {
  console.log('🧪 OpenCritic API /game エンドポイント パラメータテスト\n')
  console.log('='.repeat(60))

  // 1. デフォルト（パラメータなし）
  await testEndpoint()
  await new Promise(resolve => setTimeout(resolve, 1000))

  // 2. limit パラメータ
  await testEndpoint('?limit=10')
  await new Promise(resolve => setTimeout(resolve, 1000))

  await testEndpoint('?limit=40')
  await new Promise(resolve => setTimeout(resolve, 1000))

  // 3. offset パラメータ
  await testEndpoint('?offset=20')
  await new Promise(resolve => setTimeout(resolve, 1000))

  await testEndpoint('?limit=20&offset=20')
  await new Promise(resolve => setTimeout(resolve, 1000))

  // 4. skip パラメータ
  await testEndpoint('?skip=20')
  await new Promise(resolve => setTimeout(resolve, 1000))

  // 5. page パラメータ
  await testEndpoint('?page=2')
  await new Promise(resolve => setTimeout(resolve, 1000))

  // 6. sort パラメータ
  await testEndpoint('?sort=-date')
  await new Promise(resolve => setTimeout(resolve, 1000))

  console.log('\n' + '='.repeat(60))
  console.log('\n✅ テスト完了')
}

main()
