import { getPlatformBadgeColor, getPlatformBorderColor } from '@/lib/utils/platform-colors'

interface NewsCardProps {
  title: string
  link: string
  pubDate: string
  platform: string
  description?: string
}

/**
 * ニュースカードコンポーネント
 * RSS フィードから取得したゲームニュースを表示
 */
export default function NewsCard({
  title,
  link,
  pubDate,
  platform,
  description,
}: NewsCardProps) {
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
    <article className={`bg-gray-800/50 rounded-lg p-6 border border-gray-700
                        hover:border-accent/50 transition-colors
                        border-l-4 ${getPlatformBorderColor(platform)}`}>
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
        {/* プラットフォーム */}
        <span className={`px-2 py-1 rounded text-xs font-medium ${getPlatformBadgeColor(platform)}`}>
          {platform}
        </span>

        {/* 公開日 */}
        <time className="text-text-secondary text-xs">
          {formatDate(pubDate)}
        </time>
      </div>
    </article>
  )
}
