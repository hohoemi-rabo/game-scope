import Link from 'next/link'
import Container from './Container'
import SyncStatus from './SyncStatus'

/**
 * フッターコンポーネント
 * サイト全体の下部に表示
 *
 * 機能:
 * - コピーライト表示
 * - プライバシーポリシーへのリンク
 * - データソースのクレジット（OpenCritic）
 * - 自動更新ステータス表示（Client Component）
 * - SNSリンク（Instagram, X）
 * - レスポンシブレイアウト
 */
export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-800 bg-bg-primary mt-auto">
      <Container>
        <div className="py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-text-secondary text-sm">
            © {currentYear} GameScope. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-text-secondary">
            {/* 自動更新ステータス（Client Component） */}
            <SyncStatus />

            <Link
              href="/contact"
              className="hover:text-text-primary transition-colors"
            >
              お問い合わせ
            </Link>
            <span className="text-gray-700">|</span>
            <Link
              href="/privacy-policy"
              className="hover:text-text-primary transition-colors"
            >
              プライバシーポリシー
            </Link>
            <span className="text-gray-700">|</span>
            <a
              href="https://opencritic.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text-primary transition-colors"
            >
              Powered by OpenCritic
            </a>
          </div>
        </div>

        {/* SNSリンク（全デバイスで表示） */}
        <div className="pb-6 flex items-center justify-center gap-4">
          <a
            href="https://www.instagram.com/gamescope.jp/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 rounded-lg
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
            href="https://x.com/gamescope_jp"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 rounded-lg
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
      </Container>
    </footer>
  )
}
