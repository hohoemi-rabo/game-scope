import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * ゲーム一覧取得API（ページネーション対応）
 *
 * クエリパラメータ:
 * - offset: スキップする件数（デフォルト: 0）
 * - limit: 取得件数（デフォルト: 20）
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    // パラメータバリデーション
    if (offset < 0 || limit < 1 || limit > 60) {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // ゲームデータ取得
    // ソート順を安定させるため、metascoreとidの2つでソート
    const { data: games, error } = await supabase
      .from('games')
      .select('*')
      .order('metascore', { ascending: false, nullsFirst: false })
      .order('id', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch games' },
        { status: 500 }
      )
    }

    // さらにデータがあるかチェック
    const { count } = await supabase
      .from('games')
      .select('*', { count: 'exact', head: true })

    // 実際に取得した件数で判断（取得件数がlimitと同じなら次がある可能性）
    const hasMore = count ? offset + (games?.length || 0) < count : false

    return NextResponse.json(
      {
        games,
        hasMore,
        total: count,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    )
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
