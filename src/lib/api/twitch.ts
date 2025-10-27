/**
 * Twitch API クライアント
 * OAuth認証とAPI呼び出しを管理
 */

// トークンキャッシュ（メモリ内）
let cachedToken: {
  access_token: string
  expires_at: number
} | null = null

/**
 * Twitch OAuth トークンを取得
 * クライアントクレデンシャルフローを使用
 */
export async function getTwitchToken(): Promise<string> {
  // キャッシュが有効な場合は再利用
  if (cachedToken && cachedToken.expires_at > Date.now()) {
    return cachedToken.access_token
  }

  const clientId = process.env.TWITCH_CLIENT_ID
  const clientSecret = process.env.TWITCH_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Twitch API credentials not configured')
  }

  try {
    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
      }),
    })

    if (!response.ok) {
      throw new Error(`Twitch OAuth failed: ${response.status}`)
    }

    const data = await response.json()

    // トークンをキャッシュ（有効期限の90%まで）
    cachedToken = {
      access_token: data.access_token,
      expires_at: Date.now() + data.expires_in * 1000 * 0.9,
    }

    return data.access_token
  } catch (error) {
    console.error('Failed to get Twitch token:', error)
    throw error
  }
}

/**
 * Twitch API を呼び出す
 * 認証ヘッダーを自動的に追加
 */
export async function fetchTwitchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getTwitchToken()
  const clientId = process.env.TWITCH_CLIENT_ID!

  const url = `https://api.twitch.tv/helix${endpoint}`

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Client-ID': clientId,
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`Twitch API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Twitch API call failed [${endpoint}]:`, error)
    throw error
  }
}

/**
 * Twitchでゲーム名を検索するヘルパー関数
 */
async function searchTwitchGame(gameName: string): Promise<string | null> {
  try {
    const data = await fetchTwitchAPI<{
      data: Array<{ id: string; name: string }>
    }>(`/games?name=${encodeURIComponent(gameName)}`)

    if (data.data.length > 0) {
      return data.data[0].id
    }
    return null
  } catch {
    return null
  }
}

/**
 * ゲーム名からTwitchのGame IDを取得
 * 表記ゆれに対応するため、複数のパターンで検索を試みる
 */
export async function getTwitchGameId(gameName: string): Promise<string | null> {
  // 1. 元のタイトルで検索
  let result = await searchTwitchGame(gameName)
  if (result) return result

  // 2. 数字の前のスペースを削除して検索（例: "Game 2" → "Game2"）
  const noSpaceBeforeNumber = gameName.replace(/\s+(\d+)$/, '$1')
  if (noSpaceBeforeNumber !== gameName) {
    result = await searchTwitchGame(noSpaceBeforeNumber)
    if (result) return result
  }

  // 3. 末尾の数字をローマ数字に変換して検索（例: "Game 2" → "Game II"）
  const romanNumerals: { [key: string]: string } = {
    ' 2': ' II',
    ' 3': ' III',
    ' 4': ' IV',
    ' 5': ' V',
  }
  for (const [arabic, roman] of Object.entries(romanNumerals)) {
    if (gameName.endsWith(arabic)) {
      const romanVersion = gameName.slice(0, -arabic.length) + roman
      result = await searchTwitchGame(romanVersion)
      if (result) return result
    }
  }

  // 4. "Remastered" を削除して検索
  if (gameName.includes(' Remastered')) {
    const withoutRemastered = gameName.replace(' Remastered', '')
    result = await searchTwitchGame(withoutRemastered)
    if (result) return result
  }

  console.warn(`Twitch game not found after fallback attempts: ${gameName}`)
  return null
}

/**
 * ゲームIDからライブ配信情報を取得
 * 視聴者数が多い順に返す
 */
export async function getStreams(
  gameId: string,
  limit: number = 10
): Promise<TwitchStream[]> {
  try {
    const data = await fetchTwitchAPI<{
      data: TwitchStream[]
      pagination?: { cursor?: string }
    }>(`/streams?game_id=${gameId}&first=${limit}`)

    return data.data
  } catch (error) {
    console.error('Failed to get Twitch streams:', error)
    return []
  }
}

/**
 * ゲームIDから人気クリップを取得
 * デフォルトは過去7日間、再生数順
 */
export async function getClips(
  gameId: string,
  limit: number = 10,
  days: number = 7
): Promise<TwitchClip[]> {
  const startedAt = new Date()
  startedAt.setDate(startedAt.getDate() - days)

  try {
    const data = await fetchTwitchAPI<{
      data: TwitchClip[]
      pagination?: { cursor?: string }
    }>(
      `/clips?game_id=${gameId}&first=${limit}&started_at=${startedAt.toISOString()}`
    )

    return data.data
  } catch (error) {
    console.error('Failed to get Twitch clips:', error)
    return []
  }
}

/**
 * 複数のゲーム名からTwitch情報を一括取得
 * 英語タイトルがTwitchに存在するか確認
 */
export async function getGameInfo(
  gameTitles: string[]
): Promise<Map<string, string | null>> {
  const gameIdMap = new Map<string, string | null>()

  for (const title of gameTitles) {
    const gameId = await getTwitchGameId(title)
    gameIdMap.set(title, gameId)
  }

  return gameIdMap
}

// 型定義
export interface TwitchStream {
  id: string
  user_id: string
  user_login: string
  user_name: string
  game_id: string
  game_name: string
  type: 'live'
  title: string
  viewer_count: number
  started_at: string
  language: string
  thumbnail_url: string
  tag_ids: string[]
}

export interface TwitchClip {
  id: string
  url: string
  embed_url: string
  broadcaster_id: string
  broadcaster_name: string
  creator_id: string
  creator_name: string
  video_id: string
  game_id: string
  language: string
  title: string
  view_count: number
  created_at: string
  thumbnail_url: string
  duration: number
}
