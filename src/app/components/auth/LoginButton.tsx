'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

/**
 * 開発環境かどうかを判定
 */
function isDevelopment(): boolean {
  if (typeof window === 'undefined') return false
  const hostname = window.location.hostname
  return hostname === 'localhost' || hostname === '127.0.0.1'
}

/**
 * Googleログインボタン
 * クリックでGoogle OAuth認証画面へリダイレクト
 * 本番環境では「開発中」メッセージを表示
 */
export default function LoginButton() {
  const [showDevMessage, setShowDevMessage] = useState(false)

  const handleLogin = async () => {
    // 本番環境では開発中メッセージを表示
    if (!isDevelopment()) {
      setShowDevMessage(true)
      return
    }

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
    <>
      <button
        onClick={handleLogin}
        className="flex items-center gap-2 px-3 py-2 rounded-lg
                   bg-accent text-white hover:bg-accent/80
                   transition-colors font-medium text-sm"
      >
        {/* Google アイコン */}
        <svg className="w-4 h-4" viewBox="0 0 24 24">
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
        <span className="hidden md:inline">ログイン</span>
      </button>

      {/* 開発中メッセージモーダル */}
      {showDevMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* オーバーレイ */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowDevMessage(false)}
          />

          {/* メッセージ本体 */}
          <div className="relative bg-bg-primary border border-gray-800 rounded-2xl
                          w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center">
              <span className="text-5xl mb-4 block">🚧</span>
              <h3 className="text-xl font-bold text-text-primary mb-2">
                現在開発中です
              </h3>
              <p className="text-text-secondary mb-4">
                ログイン機能は現在準備中です。
              </p>
              <p className="text-sm text-text-secondary mb-6">
                サービス公開までしばらくお待ちください。
                <br />
                <span className="text-xs text-accent">Coming Soon...</span>
              </p>
              <button
                onClick={() => setShowDevMessage(false)}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-text-primary
                           rounded-lg font-medium transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
