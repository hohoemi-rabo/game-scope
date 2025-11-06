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
    // ソート順を安定させるため、metascoreとidの2つでソート
    const { data: initialGames, error } = await supabase
      .from('games')
      .select('*')
      .order('metascore', { ascending: false, nullsFirst: false })
      .order('id', { ascending: true })
      .limit(20)

    if (error) {
      throw error
    }

    // 総件数取得（さらにデータがあるか判定）
    const { count } = await supabase
      .from('games')
      .select('*', { count: 'exact', head: true })

    const hasMore = count ? 20 < count : false

    return (
      <Container className="py-8">
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            高評価ゲーム
          </h1>
          <p className="text-text-secondary text-lg">
            メタスコア順に並んでいます
          </p>
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
