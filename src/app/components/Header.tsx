import Link from 'next/link'
import Image from 'next/image'
import Container from './Container'
import LoginButton from './auth/LoginButton'
import UserMenu from './auth/UserMenu'
import MobileMenu from './MobileMenu'
import { getCurrentUser } from '@/lib/supabase/server-auth'

/**
 * ヘッダーコンポーネント
 * サイト全体の上部に表示されるナビゲーション
 *
 * 機能:
 * - ロゴとサイト名
 * - ナビゲーションリンク
 * - SNSリンク（Instagram, X）
 * - 認証状態に応じたログインボタン/ユーザーメニュー
 * - sticky position で常に上部に固定
 * - backdrop blur でモダンなデザイン
 */
export default async function Header() {
  // サーバーサイドでユーザー情報を取得
  const user = await getCurrentUser()

  return (
    <header className="border-b border-gray-800 bg-bg-primary/80 backdrop-blur-sm sticky top-0 z-50">
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <Link href="/" className="flex items-center group">
            <Image
              src="/logo.png"
              alt="GameScope"
              width={180}
              height={45}
              className="h-10 w-auto group-hover:opacity-90 transition-opacity"
              priority
            />
          </Link>

          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="/ranking"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                         text-text-secondary hover:text-text-primary
                         hover:bg-accent/10 transition-all duration-200
                         border border-transparent hover:border-accent/20"
            >
              <span className="text-lg">🏆</span>
              <span>高評価</span>
            </Link>
            <Link
              href="/search"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                         text-text-secondary hover:text-text-primary
                         hover:bg-[#06b6d4]/10 transition-all duration-200
                         border border-transparent hover:border-[#06b6d4]/20"
            >
              <span className="text-lg">🔍</span>
              <span>検索</span>
            </Link>
            <Link
              href="/news"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                         text-text-secondary hover:text-text-primary
                         hover:bg-[#f59e0b]/10 transition-all duration-200
                         border border-transparent hover:border-[#f59e0b]/20"
            >
              <span className="text-lg">📰</span>
              <span>ニュース</span>
            </Link>
            <Link
              href="/status"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                         text-text-secondary hover:text-text-primary
                         hover:bg-success/10 transition-all duration-200
                         border border-transparent hover:border-success/20"
            >
              <span className="text-lg">🔄</span>
              <span>更新状況</span>
            </Link>

            {/* セパレーター */}
            <div className="w-px h-6 bg-gray-700 mx-2" />

            {/* SNSリンク */}
            <div className="flex items-center gap-2">
              <a
                href="https://www.instagram.com/masayuki.kiwami/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-lg
                           text-text-secondary hover:text-[#E4405F]
                           hover:bg-[#E4405F]/10 transition-all duration-200
                           border border-transparent hover:border-[#E4405F]/20"
                title="Instagram"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://x.com/masayuki_kiwami"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-lg
                           text-text-secondary hover:text-white
                           hover:bg-black/20 transition-all duration-200
                           border border-transparent hover:border-gray-600"
                title="X (Twitter)"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>

            {/* セパレーター */}
            <div className="w-px h-6 bg-gray-700 mx-2" />

            {/* 認証部分 */}
            {user ? (
              <UserMenu user={user} />
            ) : (
              <LoginButton />
            )}
          </nav>

          {/* モバイルメニュー */}
          <MobileMenu user={user} />
        </div>
      </Container>
    </header>
  )
}
