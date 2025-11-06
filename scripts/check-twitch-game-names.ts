/**
 * Twitchでのゲーム名を確認するスクリプト
 */
import { config } from 'dotenv'
import { join } from 'path'

config({ path: join(process.cwd(), '.env.local') })

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID!
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET!

async function getTwitchToken(): Promise<string> {
  const response = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: TWITCH_CLIENT_ID,
      client_secret: TWITCH_CLIENT_SECRET,
      grant_type: 'client_credentials',
    }),
  })

  const data = await response.json()
  return data.access_token
}

async function searchTwitchGame(query: string) {
  const token = await getTwitchToken()

  const response = await fetch(
    `https://api.twitch.tv/helix/games?name=${encodeURIComponent(query)}`,
    {
      headers: {
        'Client-ID': TWITCH_CLIENT_ID,
        Authorization: `Bearer ${token}`,
      },
    }
  )

  const data = await response.json()
  return data.data
}

async function main() {
  const testGames = [
    'The Last of Us Remastered',
    'Red Dead Redemption 2',
    'Red Dead Redemption II',
    'Red Dead Redemption',
    'RDR2',
  ]

  console.log('🔍 Twitchでのゲーム名を確認中...\n')

  for (const gameName of testGames) {
    console.log(`📝 検索: "${gameName}"`)
    const results = await searchTwitchGame(gameName)

    if (results.length === 0) {
      console.log('   ❌ 見つかりませんでした\n')
    } else {
      console.log('   ✅ 見つかりました:')
      results.forEach((game: Record<string, unknown>) => {
        console.log(`      ID: ${game.id}`)
        console.log(`      名前: ${game.name}`)
      })
      console.log()
    }
  }
}

main()
