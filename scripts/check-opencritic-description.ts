/**
 * OpenCritic APIで説明文が取得できるか確認
 */

const RAPIDAPI_KEY = 'c863e4a93bmsh9c5c4f43d94f6cbp1ca1e8jsn8ea0f5bc7ad5'
const RAPIDAPI_HOST = 'opencritic-api.p.rapidapi.com'

async function checkDescription() {
  console.log('🔍 OpenCritic APIで説明文フィールドを確認中...\n')

  const response = await fetch(`https://${RAPIDAPI_HOST}/game`, {
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': RAPIDAPI_HOST,
    },
  })

  const data = await response.json()
  const firstGame = data[0]

  console.log('📦 取得したゲーム:', firstGame.name)
  console.log('\n📝 利用可能なフィールド:\n')

  // 全フィールドを表示
  Object.keys(firstGame).sort().forEach((key) => {
    const value = firstGame[key]
    const type = Array.isArray(value) ? 'array' : typeof value

    // 説明っぽいフィールドを強調
    if (key.toLowerCase().includes('desc') ||
        key.toLowerCase().includes('summary') ||
        key.toLowerCase().includes('about') ||
        key.toLowerCase().includes('story')) {
      console.log(`  ✨ ${key}: ${type}`)
      if (typeof value === 'string') {
        console.log(`     → "${value.substring(0, 100)}..."`)
      }
    } else {
      console.log(`  ${key}: ${type}`)
    }
  })

  console.log('\n❓ 説明文らしきフィールド:')
  const descriptionFields = Object.keys(firstGame).filter(key =>
    key.toLowerCase().includes('desc') ||
    key.toLowerCase().includes('summary') ||
    key.toLowerCase().includes('about') ||
    key.toLowerCase().includes('story')
  )

  if (descriptionFields.length === 0) {
    console.log('  ❌ 説明文フィールドは見つかりませんでした')
  } else {
    descriptionFields.forEach(field => {
      console.log(`  ✅ ${field}`)
    })
  }
}

checkDescription()
