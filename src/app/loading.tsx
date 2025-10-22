import Container from './components/Container'
import LoadingSpinner from './components/LoadingSpinner'

/**
 * ページ全体のローディング状態
 * Suspense の fallback として使用される
 *
 * Next.js の特別なファイル名:
 * - loading.tsx は自動的に Suspense 境界として機能
 * - ページコンポーネントの読み込み中に表示される
 */
export default function Loading() {
  return (
    <Container className="py-8">
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-text-secondary">読み込み中...</p>
      </div>
    </Container>
  )
}
