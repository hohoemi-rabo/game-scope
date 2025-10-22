import type { Database } from '@/lib/supabase/types'
import GameCard from './GameCard'

type Game = Database['public']['Tables']['games']['Row']

interface GameGridProps {
  games: Game[]
}

/**
 * ゲーム一覧グリッドコンポーネント
 * GameCard を配置するグリッドレイアウト
 *
 * レスポンシブ対応:
 * - モバイル: 1列
 * - タブレット (sm): 2列
 * - デスクトップ (lg): 3列
 * - 大画面 (xl): 4列
 */
export default function GameGrid({ games }: GameGridProps) {
  if (games.length === 0) {
    return (
      <div className="text-center py-12 text-text-secondary">
        <p>ゲームが見つかりませんでした</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
                    gap-4 md:gap-6">
      {games.map((game) => (
        <GameCard
          key={game.id}
          id={game.id}
          titleJa={game.title_ja}
          titleEn={game.title_en}
          metascore={game.metascore}
          platforms={game.platforms || []}
          thumbnailUrl={game.thumbnail_url}
          reviewCount={game.review_count}
        />
      ))}
    </div>
  )
}
