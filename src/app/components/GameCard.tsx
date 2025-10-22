import Image from 'next/image'
import Link from 'next/link'
import ScoreBadge from './ScoreBadge'

interface GameCardProps {
  id: string
  titleJa: string | null
  titleEn: string
  metascore: number | null
  platforms: string[]
  thumbnailUrl: string | null
  reviewCount?: number | null
}

/**
 * ゲームカードコンポーネント
 * トップページとゲーム一覧で使用
 *
 * 機能:
 * - サムネイル画像の表示（Next.js Image で最適化）
 * - スコアバッジの表示
 * - プラットフォーム情報の表示（最大3つ + カウント）
 * - ホバー時のアニメーション
 * - クリックでゲーム詳細ページに遷移
 */
export default function GameCard({
  id,
  titleJa,
  titleEn,
  metascore,
  platforms,
  thumbnailUrl,
  reviewCount,
}: GameCardProps) {
  // 表示するタイトルを決定（日本語優先）
  const displayTitle = titleJa || titleEn

  return (
    <Link href={`/game/${id}`}>
      <article className="group relative bg-gray-800/50 rounded-lg overflow-hidden
                          border border-gray-700/50 hover:border-accent/50
                          transition-all duration-300 hover:scale-[1.02]
                          hover:shadow-lg hover:shadow-accent/20">
        {/* サムネイル画像 */}
        <div className="relative aspect-video w-full overflow-hidden bg-gray-900">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={displayTitle}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-secondary">
              <span>No Image</span>
            </div>
          )}

          {/* スコアバッジ（画像の上に重ねて表示） */}
          <div className="absolute top-2 right-2">
            <ScoreBadge score={metascore} size="sm" />
          </div>
        </div>

        {/* ゲーム情報 */}
        <div className="p-4">
          {/* タイトル */}
          <h3 className="text-lg font-bold text-text-primary mb-2 line-clamp-2
                         group-hover:text-accent transition-colors">
            {displayTitle}
          </h3>

          {/* プラットフォームとレビュー数 */}
          <div className="flex items-center justify-between text-sm text-text-secondary">
            {/* プラットフォーム */}
            <div className="flex flex-wrap gap-1">
              {platforms.slice(0, 3).map((platform) => (
                <span
                  key={platform}
                  className="px-2 py-0.5 bg-gray-700/50 rounded text-xs"
                >
                  {platform}
                </span>
              ))}
              {platforms.length > 3 && (
                <span className="px-2 py-0.5 bg-gray-700/50 rounded text-xs">
                  +{platforms.length - 3}
                </span>
              )}
            </div>

            {/* レビュー数 */}
            {reviewCount !== null && reviewCount !== undefined && (
              <span className="text-xs">{reviewCount} reviews</span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
