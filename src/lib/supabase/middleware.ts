import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware でセッションを更新する
 * 期限切れのセッションをリフレッシュし、Cookie を同期する
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // セッションを更新（期限切れの場合はリフレッシュ）
  // 注意: createServerClient と getUser の間にロジックを入れないこと
  await supabase.auth.getUser()

  // 重要: supabaseResponse をそのまま返す必要がある
  // Cookie の同期が正しく行われないと、ユーザーが意図せずログアウトされる可能性がある
  return supabaseResponse
}
