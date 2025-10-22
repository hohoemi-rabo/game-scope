import { NextResponse } from 'next/server'
import { fetchNews } from '@/lib/api/rss'

/**
 * ゲームニュース取得 API
 * RSSフィードから全ニュースを取得して返す
 *
 * キャッシング戦略:
 * - public: CDNでキャッシュ可能
 * - s-maxage=3600: 1時間キャッシュ
 * - stale-while-revalidate=7200: 2時間は古いデータでも返す（バックグラウンドで再検証）
 */
export async function GET() {
  try {
    const news = await fetchNews()

    return NextResponse.json(
      { news, count: news.length },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    )
  } catch (error) {
    console.error('Failed to fetch news:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
}
