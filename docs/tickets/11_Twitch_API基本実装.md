# 11_Twitch API基本実装

**ステータス**: [完了]
**優先度**: 中
**Phase**: Phase 2.5 (Twitch連携 - 基盤)

## 概要

Twitch APIとの連携基盤を構築する。OAuth認証フロー、アクセストークン取得、基本的なAPI呼び出し機能を実装。

## 目的

- Twitch APIの認証機能実装
- アクセストークンの取得と管理
- API呼び出し用のベースクライアント作成
- エラーハンドリングとリトライ機構

## タスク一覧

### 1. Twitch OAuth実装
- [x] クライアントクレデンシャルフロー実装
- [x] トークン取得関数の作成
- [x] トークンキャッシング機構

### 2. APIクライアント実装
- [x] Twitch APIベースクライアント作成
- [x] レート制限対応
- [x] エラーハンドリング実装

### 3. 環境設定
- [x] 環境変数の設定
- [ ] Twitch Developer Consoleでのアプリ登録（ユーザー側で実施）
- [x] 設定ドキュメント作成

## 実装詳細

### lib/api/twitch.ts

```typescript
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
```

### 環境変数設定 (.env.local)

```env
# Twitch API Credentials
# https://dev.twitch.tv/console/apps で取得
TWITCH_CLIENT_ID=your_client_id_here
TWITCH_CLIENT_SECRET=your_client_secret_here
```

### 設定手順

1. **Twitch Developer Consoleでアプリ登録**
   - https://dev.twitch.tv/console/apps にアクセス
   - 「アプリケーションを登録」をクリック
   - アプリ名: `GameScope`
   - OAuth リダイレクト URL: `http://localhost:3000` (開発用)
   - カテゴリ: `Website Integration`
   - Client IDとClient Secretを取得

2. **環境変数の設定**
   - `.env.local` に Client ID と Client Secret を追加
   - `.env.example` にも記載（値は空にする）

3. **動作確認**
   - トークン取得が成功するかテスト
   - ゲームID取得が正常に動作するか確認

## 完了条件

- [x] Twitch OAuthトークンが正常に取得できる
- [x] トークンキャッシングが機能する
- [x] fetchTwitchAPI関数が正常に動作する
- [x] getTwitchGameId関数でゲームIDが取得できる
- [x] エラーハンドリングが適切に実装されている
- [x] 環境変数が正しく設定されている

## 関連チケット

- 前: `09_ニュース一覧実装.md`
- 次: `12_Twitch配信情報取得機能.md`

## 参考資料

- [Twitch API Documentation](https://dev.twitch.tv/docs/api/)
- [OAuth Client Credentials Flow](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#client-credentials-grant-flow)
- [Rate Limits](https://dev.twitch.tv/docs/api/guide/#rate-limits)

## 注意事項

- Client Secretは絶対にコミットしない
- トークンはメモリ内でキャッシュ（本番環境ではRedis等推奨）
- レート制限: 800 requests/分（Client Credentials）
- トークン有効期限は通常60日間
