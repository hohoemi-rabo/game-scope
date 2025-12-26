import { redirect } from 'next/navigation'
import { createAuthServerClient } from '@/lib/supabase/server-auth'
import Container from '@/app/components/Container'
import DashboardSummary from '@/app/components/dashboard/DashboardSummary'
import MarketInsight from '@/app/components/dashboard/MarketInsight'
import GameList from '@/app/components/dashboard/GameList'
import AddGameButton from '@/app/components/dashboard/AddGameButton'
import type { PortfolioWithGame } from '@/types/portfolio'

export const metadata = {
  title: 'マイダッシュボード | GameScope',
  description: 'あなたのゲームポートフォリオを管理',
}

/**
 * ダッシュボードページ
 * ユーザーのゲームポートフォリオを表示
 */
export default async function DashboardPage() {
  const supabase = await createAuthServerClient()

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // ポートフォリオデータ取得（ゲーム情報を結合）
  const { data: portfolios, error } = await supabase
    .from('user_portfolios')
    .select(`
      *,
      games (
        id,
        title_ja,
        title_en,
        thumbnail_url,
        metascore
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch portfolios:', error)
  }

  // 型アサーション（Supabaseの戻り値を適切な型に）
  const typedPortfolios = (portfolios || []) as PortfolioWithGame[]

  return (
    <Container className="py-8">
      {/* ヘッダー */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary flex items-center gap-2">
            <span>📊</span>
            マイダッシュボード
          </h1>
          <p className="text-text-secondary mt-1">
            遊べば遊ぶほど安くなる。目指せ「💎 実質無料」！
          </p>
        </div>
        <AddGameButton gameCount={typedPortfolios.length} />
      </header>

      {/* サマリーカード */}
      <DashboardSummary portfolios={typedPortfolios} />

      {/* もしも換算（含み益） */}
      <MarketInsight portfolios={typedPortfolios} />

      {/* ゲームリスト */}
      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-primary">
            登録ゲーム一覧
          </h2>
          <span className="text-sm text-text-secondary">
            {typedPortfolios.length}タイトル
          </span>
        </div>
        <GameList portfolios={typedPortfolios} />
      </section>
    </Container>
  )
}
