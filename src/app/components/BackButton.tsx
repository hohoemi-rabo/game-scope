'use client'

import { useRouter } from 'next/navigation'

/**
 * 戻るボタンコンポーネント
 * Client Component としてブラウザ履歴を操作
 */
export default function BackButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 text-text-secondary hover:text-text-primary
                 transition-colors mb-6"
      aria-label="前のページに戻る"
    >
      <span>←</span>
      <span>戻る</span>
    </button>
  )
}
