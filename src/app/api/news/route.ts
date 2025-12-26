import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * ゲームニュース取得 API
 * Supabase newsテーブルからニュースを取得して返す
 *
 * データソース: Edge Function (sync-news) が毎日深夜に更新
 *
 * キャッシング戦略:
 * - public: CDNでキャッシュ可能
 * - s-maxage=1800: 30分キャッシュ（DBから取得なので短めに）
 * - stale-while-revalidate=3600: 1時間は古いデータでも返す
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase環境変数が設定されていません')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // newsテーブルからデータ取得（新しい順）
    const { data: newsData, error } = await supabase
      .from('news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(500) // 最大500件

    if (error) {
      throw error
    }

    // フロントエンド用の形式に変換
    const news = (newsData || []).map((item) => ({
      title: item.title,
      link: item.url,
      pubDate: item.published_at || item.created_at,
      source: item.site_name.split(' (')[0], // "4Gamer (PC)" -> "4Gamer"
      platform: item.site_name,
      description: null,
    }))

    return NextResponse.json(
      { news, count: news.length },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
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
