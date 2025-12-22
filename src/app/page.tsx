import { createClient } from '@supabase/supabase-js'
import Container from './components/Container'
import InfiniteGameGrid from './components/InfiniteGameGrid'
import type { Metadata } from 'next'

// メタデータの設定
export const metadata: Metadata = {
  title: 'GameScope - 日本語で話題のゲームがわかる',
  description: '海外ゲームの評価を日本語でわかりやすく。高評価ゲーム、発売予定、配信情報を一目で確認。',
}

// 1時間ごとに再検証（ISR）
export const revalidate = 3600

/**
 * トップページ
 * 高評価ゲーム一覧を表示（無限スクロール対応）
 *
 * データフェッチング:
 * - 初期20件をサーバー側で取得
 * - スクロールで追加データを動的読み込み
 * - パフォーマンス改善のため段階的読み込み
 */
export default async function HomePage() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 初期データ取得（20件）
    // ranking IS NOT NULL でTop60のみ、rankingでソート
    const { data: initialGames, error } = await supabase
      .from('games')
      .select('*')
      .not('ranking', 'is', null)
      .order('ranking', { ascending: true })
      .limit(20)

    if (error) {
      throw error
    }

    // 総件数取得（Top60のみカウント）
    const { count } = await supabase
      .from('games')
      .select('*', { count: 'exact', head: true })
      .not('ranking', 'is', null)

    const hasMore = count ? 20 < count : false

    return (
      <Container className="py-8">
        <header className="mb-10">
          <div className="bg-gradient-to-r from-accent/10 via-[#9b59b6]/10 to-[#e91e63]/10
                          border border-accent/20 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">🏆</span>
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
                高評価ゲーム
              </h1>
            </div>
            <p className="text-text-secondary text-base md:text-lg leading-relaxed">
              世界中のレビューサイト
              <span className="inline-flex items-center mx-1.5 px-2 py-0.5
                             bg-success/20 text-success font-bold rounded-md text-sm">
                メタスコア
              </span>
              で高評価を獲得したゲームをランキング形式で紹介
            </p>
          </div>
        </header>

        <InfiniteGameGrid
          initialGames={initialGames || []}
          initialHasMore={hasMore}
        />
      </Container>
    )
  } catch (error) {
    console.error('Failed to load games:', error)
    throw error // error.tsx でキャッチされる
  }
}
