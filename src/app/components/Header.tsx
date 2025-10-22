import Link from 'next/link'
import Container from './Container'

/**
 * ヘッダーコンポーネント
 * サイト全体の上部に表示されるナビゲーション
 *
 * 機能:
 * - ロゴとサイト名
 * - ナビゲーションリンク
 * - sticky position で常に上部に固定
 * - backdrop blur でモダンなデザイン
 */
export default function Header() {
  return (
    <header className="border-b border-gray-800 bg-bg-primary/80 backdrop-blur-sm sticky top-0 z-50">
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold">
              <span className="text-accent">Game</span>
              <span className="text-text-primary">Scope</span>
            </div>
          </Link>

          {/* ナビゲーション */}
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              高評価
            </Link>
            <Link
              href="/search"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              検索
            </Link>
            <Link
              href="/news"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              ニュース
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  )
}
