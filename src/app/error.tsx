'use client'

import { useEffect } from 'react'
import Container from './components/Container'

/**
 * エラー境界コンポーネント
 * ページレベルのエラーをキャッチ
 *
 * Next.js の特別なファイル名:
 * - error.tsx は自動的にエラー境界として機能
 * - 'use client' ディレクティブが必須
 * - reset() 関数でエラーからの復帰を試みることができる
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Page error:', error)
  }, [error])

  return (
    <Container className="py-8">
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h2 className="text-2xl font-bold text-danger mb-4">
          エラーが発生しました
        </h2>
        <p className="text-text-secondary mb-6">
          ページの読み込みに失敗しました。
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-accent hover:bg-accent/80
                     text-white rounded-lg transition-colors"
        >
          再試行
        </button>
      </div>
    </Container>
  )
}
