import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { RegisterGameRequest, RegisterGameResponse, ApiErrorResponse } from '@/types/game-search'

// 手動登録リクエストの型
interface ManualRegisterRequest {
  title_en: string
  title_ja?: string
  is_manual: true
}

/**
 * ゲームをDBに登録（upsert）
 * POST /api/games/register
 *
 * - RAWGゲーム: rawg_idで既存チェック → 既存ならID返却、なければINSERT
 * - 手動登録: is_manual=true でタイトルのみで登録
 */
export async function POST(request: NextRequest): Promise<NextResponse<RegisterGameResponse | ApiErrorResponse>> {
  try {
    const body = await request.json()

    const supabase = createServerClient()

    // 手動登録の場合
    if (body.is_manual) {
      const manualBody = body as ManualRegisterRequest

      if (!manualBody.title_en) {
        return NextResponse.json(
          { error: 'title_en is required for manual registration' },
          { status: 400 }
        )
      }

      // 手動登録ゲームを作成
      const { data: newGame, error: insertError } = await supabase
        .from('games')
        .insert({
          title_en: manualBody.title_en,
          title_ja: manualBody.title_ja || manualBody.title_en,
          platforms: [],
          genres: [],
          is_top_rated: false,
        })
        .select('id')
        .single()

      if (insertError) {
        throw insertError
      }

      return NextResponse.json({ game_id: newGame.id, existing: false })
    }

    // RAWGゲームの場合
    const rawgBody = body as RegisterGameRequest

    // バリデーション
    if (!rawgBody.rawg_id || !rawgBody.title_en) {
      return NextResponse.json(
        { error: 'rawg_id and title_en are required' },
        { status: 400 }
      )
    }

    // 既存ゲームの確認（rawg_idで検索）
    const { data: existingGame, error: selectError } = await supabase
      .from('games')
      .select('id')
      .eq('rawg_id', rawgBody.rawg_id)
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
        rawg_id: rawgBody.rawg_id,
        title_en: rawgBody.title_en,
        title_ja: rawgBody.title_ja || rawgBody.title_en,
        thumbnail_url: rawgBody.thumbnail_url,
        release_date: rawgBody.release_date,
        platforms: rawgBody.platforms || [],
        genres: rawgBody.genres || [],
        metascore: rawgBody.metascore,
        description_en: rawgBody.description_en,
        is_top_rated: false,
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
