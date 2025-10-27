import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getGameTwitchId, hasLiveStreams } from '@/lib/api/game-twitch'
import Container from '@/app/components/Container'
import BackButton from '@/app/components/BackButton'
import GameInfo from '@/app/components/GameInfo'
import TwitchSection from '@/app/components/TwitchSection'
import LoadingSpinner from '@/app/components/LoadingSpinner'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

// 動的メタデータの生成
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = createServerClient()

  try {
    const { data: game } = await supabase
      .from('games')
      .select('*')
      .eq('id', id)
      .single()

    if (!game) {
      return {
        title: 'ゲームが見つかりません',
      }
    }

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
 * Twitch統合版
 */
export default async function GameDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = createServerClient()

  // ゲーム基本情報を取得
  const { data: game, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !game) {
    console.error(`Game ${id} not found:`, error)
    notFound()
  }

  // Twitch Game ID を取得（サーバーサイド、キャッシュ優先）
  const twitchGameId = await getGameTwitchId(id)

  // ライブ配信の有無を確認
  const isLive = twitchGameId ? await hasLiveStreams(twitchGameId) : false

  return (
    <Container className="py-8">
      {/* 戻るボタン */}
      <BackButton />

      {/* ゲーム基本情報 */}
      <GameInfo game={game} isLive={isLive} />

      {/* Twitch セクション（配信がある場合のみ） */}
      {twitchGameId && (
        <Suspense
          fallback={
            <div className="mt-8 p-8 bg-gray-800/50 rounded-lg">
              <div className="flex justify-center">
                <LoadingSpinner size="md" />
              </div>
            </div>
          }
        >
          <TwitchSection
            gameId={id}
            twitchGameId={twitchGameId}
            gameName={game.title_ja || game.title_en}
          />
        </Suspense>
      )}
    </Container>
  )
}
