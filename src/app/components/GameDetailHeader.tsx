import Image from 'next/image'
import ScoreBadge from './ScoreBadge'

interface GameDetailHeaderProps {
  title: string
  metascore: number | null
  platforms: string[]
  thumbnailUrl: string | null
}

/**
 * ゲーム詳細ページのヘッダーコンポーネント
 * タイトル、スコア、プラットフォーム、サムネイルを表示
 */
export default function GameDetailHeader({
  title,
  metascore,
  platforms,
  thumbnailUrl,
}: GameDetailHeaderProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {/* サムネイル */}
        <div className="md:col-span-1">
          <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-900">
            {thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt={title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-secondary">
                No Image
              </div>
            )}
          </div>
        </div>

        {/* タイトルとスコア */}
        <div className="md:col-span-2 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>

            {/* プラットフォーム */}
            <div className="flex flex-wrap gap-2 mb-4">
              {platforms.map((platform) => (
                <span
                  key={platform}
                  className="px-3 py-1 bg-gray-700/50 rounded-lg text-sm"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>

          {/* スコア */}
          <div className="flex items-center gap-4">
            <div>
              <div className="text-sm text-text-secondary mb-1">メタスコア</div>
              <ScoreBadge score={metascore} size="lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
