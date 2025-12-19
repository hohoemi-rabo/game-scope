import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

/**
 * Client Component 専用 Supabase クライアント
 * ブラウザで実行され、anon キーを使用
 * RLS (Row Level Security) ポリシーが適用される
 * Cookie ベースのセッション管理に対応
 */
export const createBrowserClient = () => {
  return createSupabaseBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
