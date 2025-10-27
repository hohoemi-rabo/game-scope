/**
 * Twitchフォールバック検索のテスト
 */
import { getTwitchGameId } from '../src/lib/api/twitch'
import { config } from 'dotenv'
import { join } from 'path'

config({ path: join(process.cwd(), '.env.local') })

async function main() {
  const testCases = [
    'Red Dead Redemption 2',
    'The Last of Us Remastered',
    'Persona 5',
  ]

  console.log('🧪 Twitchフォールバック検索をテスト中...\n')

  for (const gameName of testCases) {
    console.log(`📝 検索: "${gameName}"`)
    const gameId = await getTwitchGameId(gameName)

    if (gameId) {
      console.log(`   ✅ 見つかりました: ID = ${gameId}\n`)
    } else {
      console.log(`   ❌ 見つかりませんでした\n`)
    }
  }
}

main()
