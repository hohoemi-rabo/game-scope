import Container from '@/app/components/Container'
import Link from 'next/link'

/**
 * ゲームが見つからない場合の404ページ
 * notFound() が呼ばれた時に表示される
 */
export default function NotFound() {
  return (
    <Container className="py-8">
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h1 className="text-4xl font-bold mb-4">ゲームが見つかりません</h1>
        <p className="text-text-secondary mb-8">
          指定されたゲームは存在しないか、削除された可能性があります。
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-accent hover:bg-accent/80
                     text-white rounded-lg transition-colors"
        >
          トップページに戻る
        </Link>
      </div>
    </Container>
  )
}
