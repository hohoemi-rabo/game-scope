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

/**
 * ポートフォリオ更新入力型
 */
interface UpdatePortfolioInput {
  id: string
  purchasePrice: number
  playTimeMinutes: number
  isSubscription: boolean
  status: 'playing' | 'completed' | 'dropped' | 'backlog'
}

/**
 * ポートフォリオ更新結果型
 */
type UpdatePortfolioResult =
  | { success: true }
  | { success: false; error: string }

/**
 * ポートフォリオエントリーを更新
 */
export async function updatePortfolioEntry(
  input: UpdatePortfolioInput
): Promise<UpdatePortfolioResult> {
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
  if (!input.id) {
    return { success: false, error: 'IDが指定されていません' }
  }

  if (input.purchasePrice < 0) {
    return { success: false, error: '購入金額は0以上で入力してください' }
  }

  if (input.playTimeMinutes < 0) {
    return { success: false, error: 'プレイ時間は0以上で入力してください' }
  }

  // 所有者確認（RLSでも保護されるが、明示的にチェック）
  const { data: existing } = await supabase
    .from('user_portfolios')
    .select('id, user_id')
    .eq('id', input.id)
    .single()

  if (!existing || existing.user_id !== user.id) {
    return { success: false, error: '権限がありません' }
  }

  // 更新実行
  const { error } = await supabase
    .from('user_portfolios')
    .update({
      purchase_price: input.purchasePrice,
      play_time_minutes: input.playTimeMinutes,
      is_subscription: input.isSubscription,
      status: input.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.id)

  if (error) {
    console.error('Portfolio update error:', error)
    return { success: false, error: '更新に失敗しました' }
  }

  revalidatePath('/dashboard')

  return { success: true }
}

/**
 * ポートフォリオ削除結果型
 */
type DeletePortfolioResult =
  | { success: true }
  | { success: false; error: string }

/**
 * ポートフォリオエントリーを削除
 */
export async function deletePortfolioEntry(
  portfolioId: string
): Promise<DeletePortfolioResult> {
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
  if (!portfolioId) {
    return { success: false, error: 'IDが指定されていません' }
  }

  // 所有者確認（RLSでも保護されるが、明示的にチェック）
  const { data: existing } = await supabase
    .from('user_portfolios')
    .select('id, user_id')
    .eq('id', portfolioId)
    .single()

  if (!existing || existing.user_id !== user.id) {
    return { success: false, error: '権限がありません' }
  }

  // 削除実行
  const { error } = await supabase
    .from('user_portfolios')
    .delete()
    .eq('id', portfolioId)

  if (error) {
    console.error('Portfolio deletion error:', error)
    return { success: false, error: '削除に失敗しました' }
  }

  revalidatePath('/dashboard')

  return { success: true }
}
