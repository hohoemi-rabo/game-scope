'use server'

import { createAuthServerClient } from '@/lib/supabase/server-auth'
import { revalidatePath } from 'next/cache'

/**
 * ポートフォリオ登録入力型
 */
interface CreatePortfolioInput {
  gameId: string
  purchasePrice: number
  playTimeMinutes: number
  isSubscription: boolean
  status: 'playing' | 'completed' | 'dropped' | 'backlog'
}

/**
 * ポートフォリオ登録結果型
 */
type CreatePortfolioResult =
  | { success: true; id: string }
  | { success: false; error: string }

/**
 * ポートフォリオにゲームを登録
 */
export async function createPortfolioEntry(
  input: CreatePortfolioInput
): Promise<CreatePortfolioResult> {
  const supabase = await createAuthServerClient()

  // ユーザー認証確認
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'ログインが必要です' }
  }

  // バリデーション
  if (!input.gameId) {
    return { success: false, error: 'ゲームが選択されていません' }
  }

  if (input.purchasePrice < 0) {
    return { success: false, error: '購入金額は0以上で入力してください' }
  }

  if (input.playTimeMinutes < 0) {
    return { success: false, error: 'プレイ時間は0以上で入力してください' }
  }

  // 既存エントリーの確認
  const { data: existing } = await supabase
    .from('user_portfolios')
    .select('id')
    .eq('user_id', user.id)
    .eq('game_id', input.gameId)
    .single()

  if (existing) {
    return { success: false, error: 'このゲームは既に登録されています' }
  }

  // ポートフォリオに追加
  const { data, error } = await supabase
    .from('user_portfolios')
    .insert({
      user_id: user.id,
      game_id: input.gameId,
      purchase_price: input.purchasePrice,
      play_time_minutes: input.playTimeMinutes,
      is_subscription: input.isSubscription,
      status: input.status,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Portfolio creation error:', error)
    return { success: false, error: '登録に失敗しました' }
  }

  // ダッシュボードのキャッシュを更新
  revalidatePath('/dashboard')

  return { success: true, id: data.id }
}
