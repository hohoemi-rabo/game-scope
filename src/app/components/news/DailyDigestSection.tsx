'use client'

import Link from 'next/link'
import useSWR from 'swr'
import { getPlatformHexColor } from '@/lib/utils/platform-colors'

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
        {data.digests.map((digest) => {
          const hexColor = getPlatformHexColor(digest.category)
          const hasContent = digest.content && digest.content.trim().length > 0

          return (
            <Link
              key={digest.id}
              href={`/news?site=${encodeURIComponent(digest.category)}#news-filter`}
              className="block border rounded-xl p-4 transition-all duration-200
                         hover:-translate-y-0.5 cursor-pointer group"
              style={{
                backgroundColor: `${hexColor}10`,
                borderColor: '#374151',
                boxShadow: `inset 0 0 0 1px ${hexColor}20`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${hexColor}20`
                e.currentTarget.style.borderColor = hexColor
                e.currentTarget.style.boxShadow = `0 10px 25px -5px ${hexColor}30`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = `${hexColor}10`
                e.currentTarget.style.borderColor = '#374151'
                e.currentTarget.style.boxShadow = `inset 0 0 0 1px ${hexColor}20`
              }}
            >
              <h3
                className="text-lg font-medium text-text-primary mb-2 group-hover:text-white
                           transition-colors flex items-center gap-2"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: hexColor }}
                />
                {digest.category}
              </h3>
              {hasContent ? (
                <p className="text-sm text-text-secondary whitespace-pre-line leading-relaxed">
                  {digest.content}
                </p>
              ) : (
                <p className="text-sm text-text-secondary/50 italic">
                  本日の更新なし
                </p>
              )}
            </Link>
          )
        })}
      </div>

      <p className="mt-3 text-xs text-text-secondary text-right">
        ※ Gemini 2.5 Flash による自動生成
      </p>
    </section>
  )
}
