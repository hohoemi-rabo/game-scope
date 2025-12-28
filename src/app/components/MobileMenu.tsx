'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

interface MobileMenuProps {
  user: { email?: string; user_metadata?: { avatar_url?: string; full_name?: string } } | null
}

/**
 * モバイル用ハンバーガーメニュー
 */
export default function MobileMenu({ user }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  // クライアントサイドでのみPortalを使用するためのマウント確認
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

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

  const handleLogout = async () => {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    closeMenu()
    window.location.href = '/'
  }

  const navItems = [
    { href: '/ranking', label: '高評価', icon: '🏆' },
    { href: '/search', label: '検索', icon: '🔍' },
    { href: '/news', label: 'ニュース', icon: '📰' },
    { href: '/status', label: '更新状況', icon: '🔄' },
    { href: '/dashboard', label: 'ダッシュボード', icon: '📊', authRequired: true },
  ]

  return (
    <div className="md:hidden">
      {/* ハンバーガーボタン */}
      <button
        onClick={toggleMenu}
        className="flex items-center justify-center w-10 h-10 rounded-lg
                   text-text-secondary hover:text-text-primary
                   hover:bg-gray-800 transition-colors"
        aria-label="メニューを開く"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* メニューが開いている時のみ表示（Portalでbody直下にレンダリング） */}
      {mounted && isOpen && createPortal(
        <>
          {/* オーバーレイ */}
          <div
            className="fixed inset-0 bg-black/60 z-[100]"
            onClick={closeMenu}
          />

          {/* スライドメニュー */}
          <div
            className="fixed top-0 right-0 h-full w-72 z-[101] overflow-y-auto"
            style={{ backgroundColor: '#111111' }}
          >
            {/* メニューヘッダー */}
            <div
              className="flex items-center justify-between p-4 border-b border-gray-700"
              style={{ backgroundColor: '#1a1a1a' }}
            >
              <span className="text-lg font-bold text-text-primary">メニュー</span>
              <button
                onClick={closeMenu}
                className="flex items-center justify-center w-8 h-8 rounded-lg
                           text-text-secondary hover:text-text-primary
                           hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* ユーザー情報 */}
            {user && (
              <div
                className="p-4 border-b border-gray-700"
                style={{ backgroundColor: '#1a1a1a' }}
              >
                <div className="flex items-center gap-3">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {user.user_metadata?.full_name || 'ユーザー'}
                    </p>
                    <p className="text-xs text-text-secondary truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ナビゲーションリンク */}
            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                if (item.authRequired && !user) return null
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${isActive
                        ? 'bg-accent/20 text-accent'
                        : 'text-text-secondary hover:text-text-primary hover:bg-gray-800'
                      }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* SNSリンク */}
            <div className="p-4 border-t border-gray-700">
              <p className="text-xs text-text-secondary mb-3">SNS</p>
              <div className="flex items-center gap-3">
                <a
                  href="https://www.instagram.com/masayuki.kiwami/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-lg
                             text-text-secondary hover:text-[#E4405F]
                             hover:bg-[#E4405F]/10 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a
                  href="https://x.com/masayuki_kiwami"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-lg
                             text-text-secondary hover:text-white
                             hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* ログイン/ログアウト */}
            <div className="p-4 border-t border-gray-700">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3
                             rounded-lg text-danger hover:bg-danger/10 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>ログアウト</span>
                </button>
              ) : (
                <button
                  onClick={handleLogin}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3
                             rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors"
                >
                  {/* Google アイコン */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                  <span>ログイン</span>
                </button>
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  )
}
