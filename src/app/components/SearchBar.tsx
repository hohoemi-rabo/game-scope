'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

interface SearchBarProps {
  placeholder?: string
  initialQuery?: string
}

/**
 * 検索バーコンポーネント
 * リアルタイム検索とURL同期を実装
 */
export default function SearchBar({ placeholder = 'ゲームを検索...', initialQuery = '' }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(initialQuery)

  // URLパラメータから検索クエリを復元
  useEffect(() => {
    const urlQuery = searchParams.get('q') || ''
    setQuery(urlQuery)
  }, [searchParams])

  // デバウンス付き検索実行（500ms 待機）
  const handleSearch = useDebouncedCallback((searchQuery: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (searchQuery) {
      params.set('q', searchQuery)
    } else {
      params.delete('q')
    }

    // URLを更新（ページ遷移なし）
    router.push(`/search?${params.toString()}`, { scroll: false })
  }, 500)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)
    handleSearch(newQuery)
  }

  const handleClear = () => {
    setQuery('')
    handleSearch('')
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 pl-12 pr-12 bg-gray-800 border border-gray-700
                   rounded-lg text-text-primary placeholder-text-secondary
                   focus:outline-none focus:border-accent transition-colors"
      />

      {/* 検索アイコン */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
        🔍
      </div>

      {/* クリアボタン */}
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2
                     text-text-secondary hover:text-text-primary transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  )
}
