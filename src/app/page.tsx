import { getTopGames } from '@/lib/supabase/server'
import Container from './components/Container'
import GameGrid from './components/GameGrid'
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
 * 高評価ゲーム一覧を表示
 *
 * データフェッチング:
 * - Server Component で Supabase からゲームデータを取得
 * - React cache() でメモ化されているため、重複クエリなし
 * - ISR により1時間ごとに自動再検証
 */
export default async function HomePage() {
  try {
    // Server Component で直接データフェッチング
    const games = await getTopGames(60)

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

        <GameGrid games={games} />
      </Container>
    )
  } catch (error) {
    console.error('Failed to load games:', error)
    throw error // error.tsx でキャッチされる
  }
}
