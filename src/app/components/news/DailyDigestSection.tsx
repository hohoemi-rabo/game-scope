'use client'

import { useState } from 'react'
import useSWR from 'swr'

interface DailyDigest {
  id: string
  target_date: string
  category: string
  content: string
  created_at: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

/**
 * 今日のAI要約セクション
 * サイト別のニューストレンド3行まとめを表示
 */
export default function DailyDigestSection() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const { data, error, isLoading } = useSWR<{ digests: DailyDigest[] }>(
    '/api/news/digests',
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  // データがない場合は何も表示しない
  if (isLoading || error || !data?.digests?.length) {
    return null
  }

  const digests = data.digests

  const toggleExpand = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category)
  }

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🤖</span>
        <h2 className="text-xl font-bold text-text-primary">
          今日のトレンド要約
        </h2>
        <span className="text-xs text-text-secondary bg-emerald-500/20 px-2 py-0.5 rounded">
          AI生成
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {digests.map((digest) => (
          <div
            key={digest.id}
            className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden
                       hover:border-emerald-500/50 transition-colors"
          >
            {/* ヘッダー（クリックで展開） */}
            <button
              onClick={() => toggleExpand(digest.category)}
              className="w-full px-4 py-3 flex items-center justify-between
                         hover:bg-gray-800/50 transition-colors"
            >
              <span className="font-medium text-text-primary">
                {digest.category}
              </span>
              <svg
                className={`w-5 h-5 text-text-secondary transition-transform
                  ${expandedCategory === digest.category ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* コンテンツ（展開時のみ表示） */}
            {expandedCategory === digest.category && (
              <div className="px-4 pb-4 border-t border-gray-800">
                <div className="pt-3 text-sm text-text-secondary whitespace-pre-line leading-relaxed">
                  {digest.content}
                </div>
              </div>
            )}

            {/* プレビュー（未展開時） */}
            {expandedCategory !== digest.category && (
              <div className="px-4 pb-3">
                <p className="text-xs text-text-secondary line-clamp-2">
                  {digest.content.split('\n')[0]}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-text-secondary text-right">
        ※ Gemini 2.5 Flash による自動生成
      </p>
    </section>
  )
}
