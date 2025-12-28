'use client'

import { createBrowserClient } from '@/lib/supabase/client'

/**
 * CTASection - 最終コールトゥアクション
 */
export default function CTASection() {
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
    <section className="py-24 px-4 relative overflow-hidden">
      {/* 背景グラデーション */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/30 via-emerald-950/10 to-transparent" />
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-6">
          今すぐ始めよう
        </h2>
        <p className="text-text-secondary text-lg mb-10 max-w-xl mx-auto">
          ゲームを「消費」から「資産」へ。
          <br />
          あなたのゲーム体験を、数字で可視化しよう。
        </p>

        <button
          onClick={handleLogin}
          className="group inline-flex items-center gap-3 px-10 py-5
                     bg-gradient-to-r from-emerald-500 to-cyan-500
                     hover:from-emerald-400 hover:to-cyan-400
                     text-white font-bold text-xl rounded-2xl
                     shadow-lg shadow-emerald-500/25
                     hover:shadow-xl hover:shadow-emerald-500/40
                     transform hover:scale-105
                     transition-all duration-300"
        >
          <svg className="w-7 h-7" viewBox="0 0 24 24">
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
            className="w-6 h-6 transform group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>

        <p className="mt-6 text-sm text-text-secondary">
          無料でスタート・クレジットカード不要
        </p>
      </div>
    </section>
  )
}
