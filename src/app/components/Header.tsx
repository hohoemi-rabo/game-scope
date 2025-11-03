import Link from 'next/link'
import Container from './Container'
import { getLatestSyncLog } from '@/lib/supabase/server'

/**
 * ヘッダーコンポーネント
 * サイト全体の上部に表示されるナビゲーション
 *
 * 機能:
 * - ロゴとサイト名
 * - ナビゲーションリンク
 * - 自動更新ステータス表示
 * - sticky position で常に上部に固定
 * - backdrop blur でモダンなデザイン
 */
export default async function Header() {
  // 最新の自動更新ログを取得
  const syncLog = await getLatestSyncLog()

  // ステータスに応じた表示を生成
  const getSyncStatus = () => {
    if (!syncLog || !syncLog.status || !syncLog.created_at) {
      return null
    }

    const isSuccess = syncLog.status === 'success'
    const timestamp = new Date(syncLog.created_at)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60))

    let timeText = ''
    if (diffHours < 1) {
      timeText = '最近'
    } else if (diffHours < 24) {
      timeText = `${diffHours}時間前`
    } else {
      const diffDays = Math.floor(diffHours / 24)
      timeText = `${diffDays}日前`
    }

    return {
      isSuccess,
      timeText,
      label: isSuccess ? '同期成功' : '同期失敗',
    }
  }

  const status = getSyncStatus()

  return (
    <header className="border-b border-gray-800 bg-bg-primary/80 backdrop-blur-sm sticky top-0 z-50">
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold">
              <span className="text-accent">Game</span>
              <span className="text-text-primary">Scope</span>
            </div>
          </Link>

          {/* ナビゲーション */}
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              高評価
            </Link>
            <Link
              href="/search"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              検索
            </Link>
            <Link
              href="/news"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              ニュース
            </Link>

            {/* 自動更新ステータス */}
            {status && (
              <div
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs ${
                  status.isSuccess
                    ? 'bg-success/10 text-success border border-success/20'
                    : 'bg-danger/10 text-danger border border-danger/20'
                }`}
                title={`最終同期: ${status.timeText}`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    status.isSuccess ? 'bg-success' : 'bg-danger'
                  }`}
                />
                <span className="hidden sm:inline">{status.label}</span>
                <span className="text-text-secondary">{status.timeText}</span>
              </div>
            )}
          </nav>
        </div>
      </Container>
    </header>
  )
}
