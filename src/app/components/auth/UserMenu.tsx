'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface UserMenuProps {
  user: User
}

/**
 * ユーザーメニュー（ドロップダウン）
 * ログイン済みユーザー向けのアイコン＋メニュー
 */
export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // 外部クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  // ユーザー名の取得（Googleのフルネームまたはメールのプレフィックス）
  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'User'

  return (
    <div className="relative" ref={menuRef}>
      {/* ユーザーアイコンボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg
                   text-text-secondary hover:text-text-primary
                   hover:bg-gray-800 transition-colors"
      >
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt={displayName}
            className="w-8 h-8 rounded-full border border-gray-700"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center
                          border border-accent/50">
            <span className="text-white text-sm font-medium">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700
                        rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* ユーザー情報 */}
          <div className="px-4 py-2 border-b border-gray-700">
            <p className="text-sm font-medium text-text-primary truncate">
              {displayName}
            </p>
            <p className="text-xs text-text-secondary truncate">
              {user.email}
            </p>
          </div>

          {/* メニューアイテム */}
          <div className="py-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-2.5 text-text-secondary
                         hover:text-text-primary hover:bg-gray-800 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <span className="text-lg">📊</span>
              <span>ダッシュボード</span>
            </Link>
          </div>

          {/* ログアウト */}
          <div className="border-t border-gray-700 pt-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-text-secondary
                         hover:text-danger hover:bg-danger/10 transition-colors"
            >
              <span className="text-lg">🚪</span>
              <span>ログアウト</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
