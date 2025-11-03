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

/**
 * 最新の自動更新ログを取得
 */
export const getLatestSyncLog = cache(async () => {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('operation_logs')
    .select('*')
    .eq('operation_type', 'auto_sync')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    // ログが存在しない場合はnullを返す
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Failed to fetch latest sync log:', error)
    return null
  }

  return data
})
