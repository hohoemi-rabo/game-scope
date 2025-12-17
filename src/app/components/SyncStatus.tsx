'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

/**
 * 同期ステータス表示コンポーネント（Client Component）
 * フッターで使用し、常に最新の同期状態を表示
 */
export default function SyncStatus() {
  const { data, error, isLoading } = useSWR('/api/sync-status', fetcher, {
    refreshInterval: 60000, // 1分ごとに自動更新
    revalidateOnFocus: true,
  })

  // ローディング中またはエラー時は何も表示しない
  if (isLoading || error || !data?.status || !data?.created_at) {
    return null
  }

  const isSuccess = data.status === 'success'
  const timestamp = new Date(data.created_at)
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

  const label = isSuccess ? '最新情報更新済' : '更新確認中'

  return (
    <>
      <div
        className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs ${
          isSuccess
            ? 'bg-success/10 text-success border border-success/20'
            : 'bg-danger/10 text-danger border border-danger/20'
        }`}
        title={`最終同期: ${timeText}`}
      >
        <div
          className={`w-1.5 h-1.5 rounded-full ${
            isSuccess ? 'bg-success' : 'bg-danger'
          }`}
        />
        <span>{label}</span>
        <span className="text-text-secondary">{timeText}</span>
      </div>
      <span className="text-gray-700">|</span>
    </>
  )
}
