import { NextResponse } from 'next/server'
import { fetchReleases } from '@/lib/api/rss'

/**
 * 発売予定情報取得 API
 * RSSフィードからデータを取得して返す
 *
 * キャッシング戦略:
 * - public: CDNでキャッシュ可能
 * - s-maxage=3600: 1時間キャッシュ
 * - stale-while-revalidate=7200: 2時間は古いデータでも返す（バックグラウンドで再検証）
 */
export async function GET() {
  try {
    const releases = await fetchReleases()

    return NextResponse.json(
      { releases, count: releases.length },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    )
  } catch (error) {
    console.error('Failed to fetch releases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch releases' },
      { status: 500 }
    )
  }
}
