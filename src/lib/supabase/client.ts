import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

/**
 * Client Component 専用 Supabase クライアント
 * ブラウザで実行され、anon キーを使用
 * RLS (Row Level Security) ポリシーが適用される
 */
export const createBrowserClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
