'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Database } from '@/lib/supabase/types'

/**
 * Google OAuth でログイン
 * @param redirectTo ログイン後のリダイレクト先（省略時はホーム）
 */
export async function signInWithGoogle(redirectTo?: string) {
  const cookieStore = await cookies()

  const supabase = createServerClient<Database>(
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
            // Server Action では Cookie の設定が可能
          }
        },
      },
    }
  )

  // サイトURLを取得（環境変数または Vercel の自動設定を使用）
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

  const callbackUrl = `${siteUrl}/auth/callback`
  const nextPath = redirectTo || '/'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${callbackUrl}?next=${encodeURIComponent(nextPath)}`,
    },
  })

  if (error) {
    console.error('Google sign in error:', error)
    redirect('/auth/error')
  }

  if (data.url) {
    redirect(data.url)
  }
}

/**
 * ログアウト
 */
export async function signOut() {
  const cookieStore = await cookies()

  const supabase = createServerClient<Database>(
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
            // Server Action では Cookie の設定が可能
          }
        },
      },
    }
  )

  await supabase.auth.signOut()

  redirect('/')
}
