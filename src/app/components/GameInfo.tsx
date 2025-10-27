import Image from 'next/image'
import ScoreBadge from './ScoreBadge'
import type { Database } from '@/lib/supabase/types'

type Game = Database['public']['Tables']['games']['Row']

interface GameInfoProps {
  game: Game
  isLive?: boolean
}

/**
 * ゲーム基本情報コンポーネント
 * スコア、プラットフォーム、配信状況などを表示
 */
export default function GameInfo({ game, isLive = false }: GameInfoProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
      <div className="flex flex-col md:flex-row gap-6">
        {/* ゲーム画像 */}
        {game.thumbnail_url && (
          <div className="w-full md:w-64 flex-shrink-0">
            <Image
              src={game.thumbnail_url}
              alt={game.title_ja || game.title_en}
              width={256}
              height={384}
              className="rounded-lg w-full h-auto object-cover"
              priority
            />
          </div>
        )}

        {/* ゲーム情報 */}
        <div className="flex-1">
          {/* タイトルとライブバッジ */}
          <div className="flex items-start gap-3 mb-4">
            <h1 className="text-3xl font-bold text-text-primary flex-1">
              {game.title_ja || game.title_en}
            </h1>
            {isLive && (
              <div className="flex items-center gap-2 px-3 py-1 bg-danger/20 border border-danger rounded-full">
                <div className="w-2 h-2 bg-danger rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-danger">LIVE</span>
              </div>
            )}
          </div>

          {/* 英語タイトル */}
          {game.title_en && game.title_ja && (
            <p className="text-lg text-text-secondary mb-4">{game.title_en}</p>
          )}

          {/* スコア、プラットフォーム、ジャンル */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {game.metascore && <ScoreBadge score={game.metascore} size="lg" />}

            {/* プラットフォーム */}
            {game.platforms && game.platforms.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {game.platforms.slice(0, 4).map((platform) => (
                  <span
                    key={platform}
                    className="px-3 py-1 bg-gray-700/50 rounded text-sm"
                  >
                    {platform}
                  </span>
                ))}
                {game.platforms.length > 4 && (
                  <span className="px-3 py-1 bg-gray-700/50 rounded text-sm text-text-secondary">
                    +{game.platforms.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ジャンル */}
          {game.genres && game.genres.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-text-secondary mb-2">ジャンル</p>
              <div className="flex flex-wrap gap-2">
                {game.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-2 py-1 bg-accent/20 border border-accent/30 rounded text-sm text-accent"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 統計情報グリッド */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            {/* メタスコア */}
            {game.metascore && (
              <div className="bg-gray-700/30 rounded-lg p-3">
                <p className="text-xs text-text-secondary mb-1">メタスコア</p>
                <p className="text-2xl font-bold text-accent">{game.metascore}</p>
              </div>
            )}

            {/* レビュー数 */}
            {game.review_count && (
              <div className="bg-gray-700/30 rounded-lg p-3">
                <p className="text-xs text-text-secondary mb-1">レビュー数</p>
                <p className="text-2xl font-bold text-text-primary">{game.review_count}</p>
              </div>
            )}
          </div>

          {/* 説明文 */}
          {game.description_en && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-text-secondary mb-2">ゲーム説明</h3>
              <p className="text-sm text-text-primary leading-relaxed line-clamp-6">
                {game.description_en}
              </p>
            </div>
          )}

          {/* リンク */}
          {game.opencritic_id && game.opencritic_numeric_id && (
            <div className="mt-6">
              <a
                href={`https://opencritic.com/game/${game.opencritic_numeric_id}/${game.opencritic_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                OpenCritic で詳細を見る →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
