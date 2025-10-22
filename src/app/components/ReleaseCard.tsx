interface ReleaseCardProps {
  title: string
  link: string
  pubDate: string
  source: string
  platform: string
  description?: string
}

/**
 * 発売予定カードコンポーネント
 * RSS フィードから取得した発売予定情報を表示
 */
export default function ReleaseCard({
  title,
  link,
  pubDate,
  source,
  platform,
  description,
}: ReleaseCardProps) {
  // 日付のフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <article className="bg-gray-800/50 rounded-lg p-6 border border-gray-700
                        hover:border-accent/50 transition-colors">
      {/* タイトル */}
      <h3 className="text-lg font-bold text-text-primary mb-2">
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-accent transition-colors"
        >
          {title}
        </a>
      </h3>

      {/* 説明 */}
      {description && (
        <p className="text-text-secondary text-sm mb-4 line-clamp-2">
          {description}
        </p>
      )}

      {/* メタ情報 */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          {/* プラットフォーム */}
          <span className="px-2 py-1 bg-gray-700/50 rounded text-xs">
            {platform}
          </span>

          {/* ソース */}
          <span className="text-text-secondary text-xs">
            {source}
          </span>
        </div>

        {/* 公開日 */}
        <time className="text-text-secondary text-xs">
          {formatDate(pubDate)}
        </time>
      </div>
    </article>
  )
}
