# 02_Supabaseクライアント設定

**ステータス**: [完了]
**優先度**: 高
**Phase**: Phase 1 (MVP)

## 概要

Next.js アプリケーションから Supabase にアクセスするためのクライアント設定を実装する。Server Components と Client Components の両方に対応。

## 目的

- Server Components 用 Supabase クライアントの設定
- Client Components 用 Supabase クライアントの設定
- TypeScript 型定義の生成と設定
- データベースアクセス関数の実装

## タスク一覧

### 1. ディレクトリ構造の作成
- [x] `src/lib/supabase/` ディレクトリ作成
- [x] `src/lib/api/` ディレクトリ作成

### 2. Server Components 用クライアント
- [x] `src/lib/supabase/server.ts` 作成
- [x] サーバー専用クライアント関数の実装
- [x] `server-only` パッケージでのクライアント保護

### 3. Client Components 用クライアント
- [x] `src/lib/supabase/client.ts` 作成
- [x] ブラウザ用クライアント関数の実装

### 4. TypeScript 型定義
- [x] Supabase CLI で型定義を自動生成
- [x] `src/lib/supabase/types.ts` に型定義を配置
- [x] 型定義の自動更新スクリプト追加

### 5. データアクセス関数の実装
- [x] ゲーム情報取得関数（`getGames`, `getGame`）
- [x] Twitch 情報取得関数
- [x] React の `cache()` でメモ化

## 実装詳細

### src/lib/supabase/server.ts

```typescript
import { createClient } from '@supabase/supabase-js'
import { cache } from 'react'
import 'server-only'
import type { Database } from './types'

/**
 * Server Component 専用 Supabase クライアント
 * 環境変数から認証情報を取得
 */
export const createServerClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // サーバー専用キー
    {
      auth: {
        persistSession: false, // サーバーではセッション不要
      },
    }
  )
}

/**
 * 高評価ゲーム一覧を取得（メタスコア順）
 * React の cache() でメモ化されるため、同一リクエスト内で重複実行されない
 */
export const getTopGames = cache(async (limit: number = 20) => {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('games')
    .select('*')
    .order('metascore', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to fetch top games:', error)
    throw error
  }

  return data
})

/**
 * ゲーム詳細情報を取得
 */
export const getGame = cache(async (id: string) => {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('games')
    .select(`
      *,
      twitch_links (*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error(`Failed to fetch game ${id}:`, error)
    throw error
  }

  return data
})

/**
 * OpenCritic ID でゲームを検索
 */
export const getGameByOpencriticId = cache(async (opencriticId: string) => {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('opencritic_id', opencriticId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // データが見つからない場合
      return null
    }
    console.error(`Failed to fetch game by OpenCritic ID ${opencriticId}:`, error)
    throw error
  }

  return data
})
```

### src/lib/supabase/client.ts

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

/**
 * Client Component 用 Supabase クライアント
 * ブラウザで実行されるため、匿名キーを使用
 */
export const createBrowserClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // 匿名キー（公開可能）
  )
}
```

### package.json にスクリプト追加

```json
{
  "scripts": {
    "supabase:types": "supabase gen types typescript --project-id your-project-id > src/lib/supabase/types.ts"
  }
}
```

### 型定義の生成

```bash
# Supabase プロジェクトから型定義を生成
npx supabase gen types typescript --project-id your-project-id > src/lib/supabase/types.ts
```

## 完了条件

- [x] Server Components 用クライアントが正しく動作する
- [x] Client Components 用クライアントが正しく動作する
- [x] TypeScript 型定義が生成され、型安全にアクセスできる
- [x] データアクセス関数がエラーハンドリングを含む
- [x] `cache()` によるメモ化が機能している

## 関連チケット

- 前: `01_データベーススキーマ作成.md`
- 次: `03_デザインシステム実装.md`

## 参考資料

- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [React cache()](https://react.dev/reference/react/cache)
