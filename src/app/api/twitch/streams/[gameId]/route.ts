import { NextRequest, NextResponse } from 'next/server'
import { getStreams, getTwitchGameId } from '@/lib/api/twitch'

/**
 * Twitch ライブ配信情報を取得
 * ゲームIDまたはゲーム名から配信情報を取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    // ゲームIDがTwitch IDでない場合は名前から検索
    let twitchGameId = gameId
    if (isNaN(Number(gameId))) {
      const id = await getTwitchGameId(gameId)
      if (!id) {
        return NextResponse.json(
          { error: 'Game not found on Twitch', streams: [] },
          { status: 404 }
        )
      }
      twitchGameId = id
    }

    const streams = await getStreams(twitchGameId, limit)

    return NextResponse.json(
      { streams, count: streams.length },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (error) {
    console.error('Twitch streams API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch streams', streams: [] },
      { status: 500 }
    )
  }
}
