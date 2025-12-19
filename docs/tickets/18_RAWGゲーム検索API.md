# チケット #18: RAWGゲーム検索API

## ステータス: [未着手]

## 概要

ユーザーがポートフォリオに登録するゲームを検索するためのAPI。RAWG APIで検索し、選択されたゲームをgamesテーブルにupsertする。

## 背景

- Top60以外のゲーム（インディーズ、マイナータイトル等）も登録できるようにする
- 既存のRAWG API連携を活用
- ゲーム選択時にDBに保存し、その後ポートフォリオに追加

## 作業内容

### 1. ゲーム検索API

- [ ] `/api/games/search` エンドポイント作成
- [ ] RAWG API検索の実装
- [ ] 検索結果のフォーマット

### 2. ゲーム登録API

- [ ] `/api/games/register` エンドポイント作成
- [ ] gamesテーブルへのupsert処理
- [ ] 既存ゲームの場合は既存レコードを返す

### 3. 既存コードの活用

- [ ] `src/lib/api/rawg.ts` の確認・拡張
- [ ] 既存の型定義の活用

## 技術仕様

### ゲーム検索API

```typescript
// src/app/api/games/search/route.ts
import { NextRequest, NextResponse } from 'next/server'

const RAWG_API_KEY = process.env.RAWG_API_KEY
const RAWG_BASE_URL = 'https://api.rawg.io/api'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query || query.length < 2) {
    return NextResponse.json({ games: [] })
  }

  try {
    const response = await fetch(
      `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(query)}&page_size=10`,
      { next: { revalidate: 3600 } } // 1時間キャッシュ
    )

    if (!response.ok) {
      throw new Error('RAWG API error')
    }

    const data = await response.json()

    const games = data.results.map((game: any) => ({
      rawg_id: game.id,
      title_en: game.name,
      thumbnail_url: game.background_image,
      release_date: game.released,
      platforms: game.platforms?.map((p: any) => p.platform.name) || [],
      genres: game.genres?.map((g: any) => g.name) || [],
      metacritic: game.metacritic,
    }))

    return NextResponse.json({ games })
  } catch (error) {
    console.error('RAWG search error:', error)
    return NextResponse.json(
      { error: 'Failed to search games' },
      { status: 500 }
    )
  }
}
```

### ゲーム登録API

```typescript
// src/app/api/games/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RegisterGameRequest {
  rawg_id: number
  title_en: string
  title_ja?: string
  thumbnail_url?: string
  release_date?: string
  platforms?: string[]
  genres?: string[]
  metascore?: number
  description_en?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterGameRequest = await request.json()

    const supabase = createClient()

    // 既存ゲームの確認（rawg_idで検索）
    const { data: existingGame } = await supabase
      .from('games')
      .select('id')
      .eq('rawg_id', body.rawg_id)
      .single()

    if (existingGame) {
      // 既存ゲームがあればそのIDを返す
      return NextResponse.json({ game_id: existingGame.id, existing: true })
    }

    // 新規ゲームを登録
    const { data: newGame, error } = await supabase
      .from('games')
      .insert({
        rawg_id: body.rawg_id,
        title_en: body.title_en,
        title_ja: body.title_ja || body.title_en, // 日本語タイトルがなければ英語
        thumbnail_url: body.thumbnail_url,
        release_date: body.release_date,
        platforms: body.platforms || [],
        genres: body.genres || [],
        metascore: body.metascore,
        description_en: body.description_en,
        is_top_rated: false, // ユーザー追加ゲームはfalse
      })
      .select('id')
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ game_id: newGame.id, existing: false })
  } catch (error) {
    console.error('Game registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register game' },
      { status: 500 }
    )
  }
}
```

### 検索結果の型定義

```typescript
// src/types/game-search.ts
export interface GameSearchResult {
  rawg_id: number
  title_en: string
  thumbnail_url: string | null
  release_date: string | null
  platforms: string[]
  genres: string[]
  metacritic: number | null
}

export interface RegisterGameResponse {
  game_id: string
  existing: boolean
}
```

### 検索フック（クライアント用）

```typescript
// src/hooks/useGameSearch.ts
'use client'

import { useState, useCallback } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import type { GameSearchResult } from '@/types/game-search'

export function useGameSearch() {
  const [results, setResults] = useState<GameSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useDebouncedCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/games/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Search failed')
      }

      setResults(data.games)
    } catch (err) {
      setError('検索に失敗しました')
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, 500) // 500ms debounce

  const registerGame = useCallback(async (game: GameSearchResult) => {
    const response = await fetch('/api/games/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(game),
    })

    if (!response.ok) {
      throw new Error('Failed to register game')
    }

    return response.json()
  }, [])

  return {
    results,
    isLoading,
    error,
    search,
    registerGame,
  }
}
```

## RAWG API制限

- 無料プラン: 20,000リクエスト/月
- 検索時の500ms debounceで過剰なリクエストを防止
- 検索結果は1時間キャッシュ

## 依存関係

- なし（既存のRAWG API設定を使用）

## 受け入れ条件

- [ ] `/api/games/search?q=xxx` でゲーム検索ができる
- [ ] 検索結果にタイトル、サムネイル、発売日、プラットフォームが含まれる
- [ ] `/api/games/register` でゲームをDBに登録できる
- [ ] 既存ゲームの場合は重複登録されない
- [ ] 500ms debounceが機能している
- [ ] エラーハンドリングが適切

## テスト項目

1. 「Elden Ring」で検索して結果が返る
2. 短いクエリ（1文字）では検索されない
3. 同じゲームを2回登録しても1レコードのみ
4. 存在しないゲームでも適切なエラーが返る

## 関連チケット

- #19 ポートフォリオ登録機能
