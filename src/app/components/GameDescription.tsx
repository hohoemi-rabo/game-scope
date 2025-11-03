'use client'

import { useState } from 'react'

interface GameDescriptionProps {
  description: string
}

/**
 * ゲーム説明文コンポーネント
 * コピー機能とGoogle翻訳リンクを提供
 */
export default function GameDescription({ description }: GameDescriptionProps) {
  const [copied, setCopied] = useState(false)

  // クリップボードにコピー
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(description)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000) // 2秒後にリセット
    } catch (error) {
      console.error('コピーに失敗しました:', error)
    }
  }

  // Google翻訳リンクを生成
  const getTranslateUrl = () => {
    const encoded = encodeURIComponent(description)
    return `https://translate.google.com/?sl=en&tl=ja&text=${encoded}&op=translate`
  }

  return (
    <div className="mb-6">
      {/* ヘッダー（タイトル + ボタン） */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-text-secondary">ゲーム説明</h3>

        <div className="flex gap-2">
          {/* コピーボタン */}
          <button
            onClick={handleCopy}
            className="px-3 py-1 bg-gray-700/50 hover:bg-gray-700 rounded text-xs flex items-center gap-1 transition-colors"
            title="説明文をコピー"
          >
            {copied ? (
              <>
                <svg
                  className="w-4 h-4 text-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-success">コピー済み</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span>コピー</span>
              </>
            )}
          </button>

          {/* Google翻訳ボタン */}
          <a
            href={getTranslateUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-accent/20 hover:bg-accent/30 border border-accent/30 rounded text-xs flex items-center gap-1 transition-colors text-accent"
            title="Google翻訳で開く"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
              />
            </svg>
            <span>翻訳</span>
          </a>
        </div>
      </div>

      {/* 説明文本文 */}
      <p className="text-sm text-text-primary leading-relaxed line-clamp-6" lang="en">
        {description}
      </p>
    </div>
  )
}
