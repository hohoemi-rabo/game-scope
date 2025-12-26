import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * 今日のAI要約取得 API
 * daily_digestsテーブルから今日の要約を取得
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase環境変数が設定されていません')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // 今日の日付（JST）
    const now = new Date()
    now.setHours(now.getHours() + 9) // UTC -> JST
    const today = now.toISOString().split('T')[0]

    // 今日の要約を取得
    const { data: digests, error } = await supabase
      .from('daily_digests')
      .select('*')
      .eq('target_date', today)
      .order('category', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json(
      { digests: digests || [], date: today },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        },
      }
    )
  } catch (error) {
    console.error('Failed to fetch digests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch digests', digests: [] },
      { status: 500 }
    )
  }
}
