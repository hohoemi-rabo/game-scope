'use client'

import { createBrowserClient } from '@/lib/supabase/client'

/**
 * HeroSection - LPのメインビジュアル
 * キャッチコピーとCTAボタンを表示
 */
export default function HeroSection() {
  const handleLogin = async () => {
    const supabase = createBrowserClient()

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error('Login error:', error)
    }
  }

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* 背景エフェクト */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-transparent to-transparent" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* グリッドパターン */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* メインコンテンツ */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in-up">
        {/* サブテキスト */}
        <p className="text-emerald-400 text-sm md:text-base font-medium tracking-wider mb-6 animate-fade-in-up animation-delay-200">
          GAME PORTFOLIO MANAGEMENT
        </p>

        {/* メインキャッチコピー */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-text-primary mb-6 leading-tight animate-fade-in-up animation-delay-400">
          ゲームは、消費ではなく
          <br />
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400
                         text-transparent bg-clip-text
                         animate-gradient-x">
            『資産』
          </span>
          だ！
        </h1>

        {/* サブキャッチ */}
        <p className="text-text-secondary text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-600">
          遊んだ時間を「投資」に変える。
          <br className="hidden md:block" />
          あなたのゲーム体験を、価値ある資産として可視化しよう。
        </p>

        {/* CTAボタン */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-800">
          <button
            onClick={handleLogin}
            className="group flex items-center gap-3 px-8 py-4
                       bg-gradient-to-r from-emerald-500 to-cyan-500
                       hover:from-emerald-400 hover:to-cyan-400
                       text-white font-bold text-lg rounded-xl
                       shadow-lg shadow-emerald-500/25
                       hover:shadow-xl hover:shadow-emerald-500/40
                       transform hover:scale-105
                       transition-all duration-300"
          >
            {/* Google アイコン */}
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Googleで始める</span>
            <svg
              className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          <a
            href="#features"
            className="flex items-center gap-2 px-6 py-4
                       text-text-secondary hover:text-text-primary
                       font-medium transition-colors"
          >
            <span>機能を見る</span>
            <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </div>

        {/* 統計情報 */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in-up animation-delay-1000">
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold text-emerald-400">60+</p>
            <p className="text-xs md:text-sm text-text-secondary mt-1">厳選ゲーム</p>
          </div>
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold text-cyan-400">10</p>
            <p className="text-xs md:text-sm text-text-secondary mt-1">ニュースソース</p>
          </div>
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold text-emerald-400">AI</p>
            <p className="text-xs md:text-sm text-text-secondary mt-1">要約機能</p>
          </div>
        </div>
      </div>

      {/* スクロールインジケーター */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-text-secondary/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-emerald-400 rounded-full animate-scroll-down" />
        </div>
      </div>

    </section>
  )
}
