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
              height={256}
              className="rounded-lg w-full h-auto"
              priority
            />
          </div>
        )}

        {/* ゲーム情報 */}
        <div className="flex-1">
          {/* タイトルとライブバッジ */}
          <div className="flex items-start gap-3 mb-4">
            <h1 className="text-3xl font-bold text-text-primary flex-1">
              {game.title_ja}
            </h1>
            {isLive && (
              <div className="flex items-center gap-2 px-3 py-1 bg-danger/20 border border-danger rounded-full">
                <div className="w-2 h-2 bg-danger rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-danger">LIVE</span>
              </div>
            )}
          </div>

          {/* 英語タイトル */}
          {game.title_en && (
            <p className="text-lg text-text-secondary mb-4">{game.title_en}</p>
          )}

          {/* スコアとプラットフォーム */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <ScoreBadge score={game.metascore} size="lg" />

            <div className="flex flex-wrap gap-2">
              {game.platforms?.map((platform) => (
                <span
                  key={platform}
                  className="px-3 py-1 bg-gray-700/50 rounded text-sm"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>

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
