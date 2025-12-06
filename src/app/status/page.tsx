import { Metadata } from 'next'
import Container from '@/app/components/Container'
import { getRecentSyncLogs } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: '更新状況 | GameScope',
  description: 'GameScopeのデータ更新状況と仕組みについて',
}

// 常に最新データを取得（動的レンダリング）
export const dynamic = 'force-dynamic'

export default async function StatusPage() {
  const logs = await getRecentSyncLogs(10)

  // 時間をフォーマットする関数
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Tokyo',
    })
  }

  // 経過時間を計算する関数
  const getElapsedTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffHours < 1) {
      return '1時間以内'
    } else if (diffHours < 24) {
      return `${diffHours}時間前`
    } else {
      const diffDays = Math.floor(diffHours / 24)
      return `${diffDays}日前`
    }
  }

  return (
    <main className="py-8 md:py-12">
      <Container>
        {/* ページヘッダー */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">
            🔄 更新状況
          </h1>
          <p className="text-text-secondary">
            GameScopeのデータがどのように更新されているかをご紹介します
          </p>
        </div>

        {/* 更新の仕組み */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <span className="text-accent">📡</span>
            データ更新の仕組み
          </h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* OpenCritic */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🎯</span>
                <h3 className="font-bold text-text-primary">OpenCritic</h3>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                世界中のゲームレビューを集約する信頼性の高いサイトから、
                <span className="text-success font-medium">メタスコア</span>と
                <span className="text-success font-medium">レビュー数</span>を取得しています。
              </p>
            </div>

            {/* RAWG */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🎮</span>
                <h3 className="font-bold text-text-primary">RAWG</h3>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                世界最大級のゲームデータベースから、
                <span className="text-[#06b6d4] font-medium">ジャンル情報</span>と
                <span className="text-[#06b6d4] font-medium">ゲーム説明文</span>を補完しています。
              </p>
            </div>

            {/* Twitch */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">📺</span>
                <h3 className="font-bold text-text-primary">Twitch</h3>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                リアルタイムで
                <span className="text-[#9146FF] font-medium">ライブ配信</span>と
                <span className="text-[#9146FF] font-medium">人気クリップ</span>を取得し、
                ゲームの雰囲気をお届けします。
              </p>
            </div>

            {/* ニュースRSS */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">📰</span>
                <h3 className="font-bold text-text-primary">ニュースRSS</h3>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                国内<span className="text-[#f59e0b] font-medium">10サイト</span>の
                ゲームニュースRSSフィードから、
                <span className="text-[#f59e0b] font-medium">最新記事</span>を取得しています。
              </p>
            </div>
          </div>
        </section>

        {/* 更新スケジュール */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <span className="text-accent">⏰</span>
            更新スケジュール
          </h2>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                <span className="text-accent font-bold">3</span>
              </div>
              <div>
                <p className="text-text-primary font-medium">毎日 午前3時（日本時間）</p>
                <p className="text-sm text-text-secondary">自動的にゲーム情報を更新</p>
              </div>
            </div>
            <p className="text-sm text-text-secondary mt-3 pl-13">
              最新の高評価ゲーム60タイトルのスコア・レビュー数・詳細情報を自動で更新しています。
              手動操作なしで常に最新の情報をお届けします。
            </p>
          </div>
        </section>

        {/* 更新履歴 */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <span className="text-accent">📋</span>
            最近の更新履歴
          </h2>

          {logs.length > 0 ? (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 bg-gray-900/50">
                      <th className="text-left py-3 px-4 text-text-secondary font-medium">ステータス</th>
                      <th className="text-left py-3 px-4 text-text-secondary font-medium">更新日時</th>
                      <th className="text-left py-3 px-4 text-text-secondary font-medium hidden md:table-cell">経過</th>
                      <th className="text-left py-3 px-4 text-text-secondary font-medium">内容</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => (
                      <tr
                        key={log.id}
                        className={`border-b border-gray-800/50 ${
                          index === 0 ? 'bg-success/5' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs ${
                              log.status === 'success'
                                ? 'bg-success/10 text-success'
                                : 'bg-danger/10 text-danger'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                log.status === 'success' ? 'bg-success' : 'bg-danger'
                              }`}
                            />
                            {log.status === 'success' ? '成功' : '失敗'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-text-primary">
                          {log.created_at ? formatTime(log.created_at) : '-'}
                        </td>
                        <td className="py-3 px-4 text-text-secondary hidden md:table-cell">
                          {log.created_at ? getElapsedTime(log.created_at) : '-'}
                        </td>
                        <td className="py-3 px-4 text-text-secondary">
                          {log.status === 'success' ? '60件のゲーム情報を更新' : '更新処理中にエラー'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center">
              <p className="text-text-secondary">更新履歴はまだありません</p>
            </div>
          )}
        </section>

        {/* 補足説明 */}
        <div className="mt-8 p-4 bg-accent/5 border border-accent/20 rounded-xl">
          <p className="text-sm text-text-secondary">
            <span className="text-accent font-medium">💡 ヒント:</span>{' '}
            フッターにも最新の更新状況が表示されています。
            「最新情報更新済」と表示されていれば、データは最新の状態です。
          </p>
        </div>
      </Container>
    </main>
  )
}
