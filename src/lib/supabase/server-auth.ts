import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

/**
 * Server Components / Route Handlers 用の認証対応 Supabase クライアント
 * Cookie ベースのセッション管理に対応
 * ユーザー認証が必要な操作に使用
 */
export const createAuthServerClient = async () => {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component からの呼び出し時は set が使えない
            // Middleware でセッション更新を行うため問題なし
          }
        },
      },
    }
  )
}

/**
 * 現在のユーザーを取得
 */
export const getCurrentUser = async () => {
  const supabase = await createAuthServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    return null
  }

  return user
}

/**
 * 現在のセッションを取得
 */
export const getSession = async () => {
  const supabase = await createAuthServerClient()
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    return null
  }

  return session
}
