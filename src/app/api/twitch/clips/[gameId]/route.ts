import { NextRequest, NextResponse } from 'next/server'
import { getClips, getTwitchGameId } from '@/lib/api/twitch'

/**
 * Twitch クリップ情報を取得
 * 人気クリップを再生数順に返す
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const days = parseInt(searchParams.get('days') || '7', 10)

    // ゲームIDがTwitch IDでない場合は名前から検索
    let twitchGameId = gameId
    if (isNaN(Number(gameId))) {
      const id = await getTwitchGameId(gameId)
      if (!id) {
        return NextResponse.json(
          { error: 'Game not found on Twitch', clips: [] },
          { status: 404 }
        )
      }
      twitchGameId = id
    }

    const clips = await getClips(twitchGameId, limit, days)

    return NextResponse.json(
      { clips, count: clips.length },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    )
  } catch (error) {
    console.error('Twitch clips API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clips', clips: [] },
      { status: 500 }
    )
  }
}
