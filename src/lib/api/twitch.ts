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
async function getTwitchToken(): Promise<string> {
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
 * ゲーム名からTwitch Game IDを取得
 */
export async function getTwitchGameId(gameName: string): Promise<string | null> {
  try {
    const data = await fetchTwitchAPI<{
      data: Array<{ id: string; name: string }>
    }>(`/games?name=${encodeURIComponent(gameName)}`)

    if (data.data.length === 0) {
      console.warn(`Twitch game not found: ${gameName}`)
      return null
    }

    return data.data[0].id
  } catch (error) {
    console.error('Failed to get Twitch game ID:', error)
    return null
  }
}
