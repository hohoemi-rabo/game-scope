import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/supabase/server-auth'
import HeroSection from './components/landing/HeroSection'
import FeaturesSection from './components/landing/FeaturesSection'
import PreviewSection from './components/landing/PreviewSection'
import CTASection from './components/landing/CTASection'
import type { Metadata } from 'next'

// メタデータの設定
export const metadata: Metadata = {
  title: 'GameScope - ゲームは、消費ではなく「資産」だ！',
  description: '遊んだ時間を「投資」に変える。あなたのゲーム体験を、価値ある資産として可視化するゲームポートフォリオ管理ツール。',
}

// 1時間ごとに再検証（ISR）
export const revalidate = 3600

/**
 * トップページ
 *
 * - 未ログイン: ランディングページを表示
 * - ログイン済み: /ranking にリダイレクト
 */
export default async function HomePage() {
  // ログイン状態を確認
  const user = await getCurrentUser()

  // ログイン済みの場合は /ranking にリダイレクト
  if (user) {
    redirect('/ranking')
  }

  // プレビュー用のゲームデータを取得
  let previewGames: Array<{
    id: string
    title_ja: string | null
    title_en: string
    metascore: number | null
    platforms: string[]
    thumbnail_url: string | null
    review_count: number | null
  }> = []

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data } = await supabase
      .from('games')
      .select('id, title_ja, title_en, metascore, platforms, thumbnail_url, review_count')
      .not('ranking', 'is', null)
      .order('ranking', { ascending: true })
      .limit(8)

    if (data) {
      previewGames = data
    }
  } catch (error) {
    console.error('Failed to fetch preview games:', error)
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Hero セクション */}
      <HeroSection />

      {/* 機能紹介セクション */}
      <FeaturesSection />

      {/* ゲームプレビューセクション */}
      <PreviewSection games={previewGames} />

      {/* 最終CTA */}
      <CTASection />
    </main>
  )
}
