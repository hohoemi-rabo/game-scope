interface GameInfoProps {
  releaseDate: string | null
  reviewCount: number | null
  titleEn: string
}

/**
 * ゲーム情報コンポーネント
 * 発売日、レビュー数、英語タイトルを表示
 */
export default function GameInfo({ releaseDate, reviewCount, titleEn }: GameInfoProps) {
  // 日付のフォーマット
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '未定'
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
      <h2 className="text-2xl font-bold mb-4">ゲーム情報</h2>

      <dl className="space-y-4">
        <div>
          <dt className="text-text-secondary text-sm mb-1">発売日</dt>
          <dd className="text-text-primary">{formatDate(releaseDate)}</dd>
        </div>

        {reviewCount !== null && (
          <div>
            <dt className="text-text-secondary text-sm mb-1">レビュー数</dt>
            <dd className="text-text-primary">{reviewCount} 件</dd>
          </div>
        )}

        <div>
          <dt className="text-text-secondary text-sm mb-1">英語タイトル</dt>
          <dd className="text-text-primary">{titleEn}</dd>
        </div>
      </dl>
    </div>
  )
}
