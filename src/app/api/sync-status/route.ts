import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * 最新の同期ステータスを取得するAPI
 * フッターで使用（常に最新データを返す）
 */
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('operation_logs')
      .select('*')
      .eq('operation_type', 'auto_sync')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      // ログが存在しない場合
      if (error.code === 'PGRST116') {
        return NextResponse.json({ status: null })
      }
      throw error
    }

    return NextResponse.json({
      status: data.status,
      created_at: data.created_at,
    })
  } catch (error) {
    console.error('Failed to fetch sync status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sync status' },
      { status: 500 }
    )
  }
}
