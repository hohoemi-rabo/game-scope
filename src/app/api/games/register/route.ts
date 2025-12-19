import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { RegisterGameRequest, RegisterGameResponse, ApiErrorResponse } from '@/types/game-search'

/**
 * ゲームをDBに登録（upsert）
 * POST /api/games/register
 *
 * 既存のゲーム（rawg_idで判定）がある場合はそのIDを返し、
 * 新規の場合は登録して新しいIDを返す
 */
export async function POST(request: NextRequest): Promise<NextResponse<RegisterGameResponse | ApiErrorResponse>> {
  try {
    const body: RegisterGameRequest = await request.json()

    // バリデーション
    if (!body.rawg_id || !body.title_en) {
      return NextResponse.json(
        { error: 'rawg_id and title_en are required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // 既存ゲームの確認（rawg_idで検索）
    const { data: existingGame, error: selectError } = await supabase
      .from('games')
      .select('id')
      .eq('rawg_id', body.rawg_id)
      .single()

    if (selectError && selectError.code !== 'PGRST116') {
      // PGRST116: データが見つからない（正常ケース）
      throw selectError
    }

    if (existingGame) {
      // 既存ゲームがあればそのIDを返す
      return NextResponse.json({ game_id: existingGame.id, existing: true })
    }

    // 新規ゲームを登録
    const { data: newGame, error: insertError } = await supabase
      .from('games')
      .insert({
        rawg_id: body.rawg_id,
        title_en: body.title_en,
        title_ja: body.title_ja || body.title_en, // 日本語タイトルがなければ英語
        thumbnail_url: body.thumbnail_url,
        release_date: body.release_date,
        platforms: body.platforms || [],
        genres: body.genres || [],
        metascore: body.metascore,
        description_en: body.description_en,
        is_top_rated: false, // ユーザー追加ゲームはfalse
      })
      .select('id')
      .single()

    if (insertError) {
      throw insertError
    }

    return NextResponse.json({ game_id: newGame.id, existing: false })
  } catch (error) {
    console.error('Game registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register game' },
      { status: 500 }
    )
  }
}
