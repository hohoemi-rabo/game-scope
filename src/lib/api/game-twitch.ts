import { createServerClient } from '@/lib/supabase/server'
import { getTwitchGameId } from './twitch'
import type { Database } from '@/lib/supabase/types'

type GameTwitchData = Pick<
  Database['public']['Tables']['games']['Row'],
  'twitch_game_id' | 'twitch_last_checked_at' | 'title_en'
>

/**
 * ゲームのTwitch Game IDを取得（キャッシュ優先）
 * 1. データベースからキャッシュを確認
 * 2. なければTwitch APIから取得してキャッシュ
 */
export async function getGameTwitchId(gameId: string): Promise<string | null> {
  const supabase = createServerClient()

  // データベースからキャッシュを確認
  const { data: game } = (await supabase
    .from('games')
    .select('twitch_game_id, twitch_last_checked_at, title_en')
    .eq('id', gameId)
    .single()) as { data: GameTwitchData | null }

  if (!game) return null

  // キャッシュが1週間以内なら再利用
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  if (
    game.twitch_game_id &&
    game.twitch_last_checked_at &&
    new Date(game.twitch_last_checked_at) > oneWeekAgo
  ) {
    return game.twitch_game_id
  }

  // Twitch APIから取得
  const twitchGameId = await getTwitchGameId(game.title_en)

  // データベースに保存
  if (twitchGameId) {
    await supabase
      .from('games')
      .update({
        twitch_game_id: twitchGameId,
        twitch_last_checked_at: new Date().toISOString(),
      } as never)
      .eq('id', gameId)
  }

  return twitchGameId
}

/**
 * ゲームにライブ配信があるか確認
 */
export async function hasLiveStreams(gameId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/twitch/streams/${gameId}?limit=1`,
      { next: { revalidate: 300 } } // 5分キャッシュ
    )

    if (!response.ok) return false

    const data = await response.json()
    return data.count > 0
  } catch {
    return false
  }
}
