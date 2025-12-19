import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/lib/supabase/types'

/**
 * OAuth コールバック処理
 * Google OAuth 認証後、Supabase がこのエンドポイントにリダイレクトする
 * 認証コードをセッショントークンに交換する
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // リダイレクト先（指定がなければホームへ）
  const next = searchParams.get('next') ?? '/'

  if (code) {
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
              // Route Handler では Cookie の設定が可能なのでエラーは稀
            }
          },
        },
      }
    )

    // 認証コードをセッショントークンに交換
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // 認証成功: 指定されたページにリダイレクト
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // 認証失敗: エラーページにリダイレクト
  return NextResponse.redirect(`${origin}/auth/error`)
}
