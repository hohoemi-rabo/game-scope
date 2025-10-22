import { notFound } from 'next/navigation'
import { getGame } from '@/lib/supabase/server'
import Container from '@/app/components/Container'
import BackButton from '@/app/components/BackButton'
import GameDetailHeader from '@/app/components/GameDetailHeader'
import GameInfo from '@/app/components/GameInfo'
import ExternalLinks from '@/app/components/ExternalLinks'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

// 動的メタデータの生成
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params

  try {
    const game = await getGame(id)
    const title = game.title_ja || game.title_en

    return {
      title: title,
      description: `${title}のメタスコアやレビュー情報をチェック。${game.platforms?.join(', ')}で発売。`,
    }
  } catch {
    return {
      title: 'ゲームが見つかりません',
    }
  }
}

/**
 * ゲーム詳細ページ
 * 動的ルーティングでゲームIDに基づいて情報を表示
 *
 * 機能:
 * - ゲーム詳細情報の表示
 * - スコアバッジの表示
 * - 外部リンク (OpenCritic, Steam)
 * - 動的メタデータ生成
 */
export default async function GameDetailPage({ params }: PageProps) {
  const { id } = await params

  // ゲーム情報を取得
  let game
  try {
    game = await getGame(id)
  } catch (error) {
    console.error(`Game ${id} not found:`, error)
    notFound() // 404ページに遷移
  }

  const displayTitle = game.title_ja || game.title_en

  return (
    <Container className="py-8">
      {/* 戻るボタン */}
      <BackButton />

      {/* ヘッダー（タイトル、スコア） */}
      <GameDetailHeader
        title={displayTitle}
        metascore={game.metascore}
        platforms={game.platforms || []}
        thumbnailUrl={game.thumbnail_url}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* メイン情報 */}
        <div className="lg:col-span-2">
          <GameInfo
            releaseDate={game.release_date}
            reviewCount={game.review_count}
            titleEn={game.title_en}
          />

          {/* Twitch 情報（Phase 1では静的表示） */}
          {game.twitch_links && game.twitch_links.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">配信情報</h2>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <p className="text-text-secondary">
                  Twitch での配信情報は Phase 2 で実装予定
                </p>
              </div>
            </div>
          )}
        </div>

        {/* サイドバー */}
        <div className="lg:col-span-1">
          <ExternalLinks
            opencriticId={game.opencritic_id}
            titleEn={game.title_en}
          />
        </div>
      </div>
    </Container>
  )
}
