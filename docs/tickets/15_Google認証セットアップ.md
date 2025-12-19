# チケット #15: Google認証セットアップ

## ステータス: [完了]

## 概要

Gaming ROI機能の基盤となるGoogle OAuth認証をSupabase Auth経由で実装する。

## 背景

- ユーザーがゲームポートフォリオを管理するには認証が必要
- 既存機能（トップ、検索、ニュース、更新状況）はログインなしで利用可能を維持
- Google OAuthを選択（ゲーマーの多くがGoogleアカウントを持っている）

## 作業内容

### 1. GCP Console設定

- [x] GCPプロジェクト作成（または既存プロジェクト使用）
- [x] OAuth同意画面の設定
  - アプリ名: GameScope
  - ユーザーサポートメール設定
  - スコープ: email, profile
- [x] OAuth 2.0クライアントID作成
  - アプリケーションの種類: ウェブアプリケーション
  - 承認済みJavaScriptオリジン:
    - `http://localhost:3000`（開発用）
    - `https://game-scope.vercel.app`（本番用）
  - 承認済みリダイレクトURI:
    - `https://<project-ref>.supabase.co/auth/v1/callback`

### 2. Supabase設定

- [x] Supabase Dashboard > Authentication > Providers > Google
  - Client IDを設定
  - Client Secretを設定
  - Enabledをオンに
- [x] Redirect URLsの確認
- [x] Site URLの設定（本番URL）

### 3. 環境変数設定

```env
# .env.local に追加
NEXT_PUBLIC_SUPABASE_URL=（既存）
NEXT_PUBLIC_SUPABASE_ANON_KEY=（既存）

# GCP OAuth（Supabase側で設定するため、Next.js側では不要）
```

### 4. Supabaseクライアント拡張

- [x] `src/lib/supabase/client.ts` - ブラウザ用クライアント（@supabase/ssr対応）
- [x] `src/lib/supabase/server-auth.ts` - Server Components用認証クライアント
- [x] `src/lib/supabase/middleware.ts` - Middlewareヘルパー
- [x] `src/middleware.ts` - セッション更新Middleware
- [x] `src/app/auth/callback/route.ts` - OAuthコールバック
- [x] `src/app/auth/error/page.tsx` - 認証エラーページ
- [x] `src/lib/auth/actions.ts` - 認証ヘルパー関数
  - `signInWithGoogle()` - Googleログイン
  - `signOut()` - ログアウト
- [x] `src/lib/supabase/server-auth.ts` に追加
  - `getCurrentUser()` - ユーザー情報取得
  - `getSession()` - セッション取得

## 技術仕様

### 認証フロー

```
1. ユーザーが「Googleでログイン」をクリック
2. Supabase Auth → Google OAuth画面へリダイレクト
3. ユーザーがGoogleアカウントで承認
4. Supabase callback URLへリダイレクト
5. Supabaseがセッションを作成
6. アプリにリダイレクト（ログイン完了）
```

### Supabase Auth クライアント（ブラウザ用）

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 認証ヘルパー

```typescript
// src/lib/auth/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signInWithGoogle() {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (data.url) {
    redirect(data.url)
  }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/')
}
```

## 依存関係

- `@supabase/ssr` パッケージのインストール（必要に応じて）

## 受け入れ条件

- [x] GCPでOAuth同意画面とクライアントIDが設定されている
- [x] Supabase DashboardでGoogle Providerが有効化されている
- [x] 開発環境でGoogleログイン/ログアウトが動作する
- [ ] 本番環境のURLが承認済みオリジンに追加されている
- [x] ログインなしで既存機能が引き続き利用可能

## 参考資料

- [Supabase Auth with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [GCP OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Supabase SSR](https://supabase.com/docs/guides/auth/server-side)

## 関連チケット

- #16 DBマイグレーション（user_portfoliosテーブル）
- #17 認証UI実装
