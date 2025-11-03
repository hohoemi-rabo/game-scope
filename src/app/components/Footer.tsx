import Link from 'next/link'
import Container from './Container'

/**
 * フッターコンポーネント
 * サイト全体の下部に表示
 *
 * 機能:
 * - コピーライト表示
 * - プライバシーポリシーへのリンク
 * - データソースのクレジット（OpenCritic）
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
      </Container>
    </footer>
  )
}
