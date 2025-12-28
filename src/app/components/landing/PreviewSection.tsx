'use client'

import { useEffect, useRef, useState } from 'react'
import GameCard from '../GameCard'

interface Game {
  id: string
  title_ja: string | null
  title_en: string
  metascore: number | null
  platforms: string[]
  thumbnail_url: string | null
  review_count: number | null
}

interface PreviewSectionProps {
  games: Game[]
}

/**
 * PreviewSection - ゲームカードプレビュー
 * 実際のゲームデータを表示してアプリの雰囲気を伝える
 */
export default function PreviewSection({ games }: PreviewSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  if (games.length === 0) return null

  return (
    <section
      ref={sectionRef}
      className="py-24 px-4 relative overflow-hidden"
    >
      {/* 背景 */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/10 via-transparent to-transparent" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* セクションヘッダー */}
        <div className={`text-center mb-12 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <p className="text-emerald-400 text-sm font-medium tracking-wider mb-4">
            PREVIEW
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            話題のゲームをチェック
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            世界中で高評価を獲得したゲームを厳選。クリックして詳細をチェックできます。
          </p>
        </div>

        {/* ゲームカードグリッド */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 transition-all duration-1000 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          {games.slice(0, 8).map((game, index) => (
            <div
              key={game.id}
              className="transition-all duration-500"
              style={{ transitionDelay: `${(index + 1) * 100}ms` }}
            >
              <GameCard
                id={game.id}
                titleJa={game.title_ja}
                titleEn={game.title_en}
                metascore={game.metascore}
                platforms={game.platforms || []}
                thumbnailUrl={game.thumbnail_url}
                reviewCount={game.review_count}
              />
            </div>
          ))}
        </div>

        {/* もっと見るボタン */}
        <div className={`mt-12 text-center transition-all duration-1000 delay-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <a
            href="/ranking"
            className="inline-flex items-center gap-2 px-6 py-3
                       border border-emerald-500/50 hover:border-emerald-500
                       text-emerald-400 hover:text-emerald-300
                       rounded-xl font-medium
                       hover:bg-emerald-500/10
                       transition-all duration-300"
          >
            <span>すべてのゲームを見る</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
