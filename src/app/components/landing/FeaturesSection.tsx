'use client'

import { useEffect, useRef, useState } from 'react'

interface Feature {
  icon: string
  title: string
  description: string
  color: string
}

const features: Feature[] = [
  {
    icon: '📊',
    title: 'ROI計算',
    description: 'ゲームごとの「時間単価」を自動計算。遊べば遊ぶほど安くなる、投資としてのゲーム体験を可視化します。',
    color: 'emerald',
  },
  {
    icon: '🤖',
    title: 'AIニュース要約',
    description: '10サイト以上のゲームニュースをAIが毎日3行で要約。効率的に最新情報をキャッチアップ。',
    color: 'cyan',
  },
  {
    icon: '🎮',
    title: '資産管理',
    description: '購入したゲームをポートフォリオとして管理。積みゲーの可視化で計画的なプレイをサポート。',
    color: 'violet',
  },
]

/**
 * FeaturesSection - 機能紹介セクション
 * スクロールで各カードがアニメーション表示
 */
export default function FeaturesSection() {
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
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; shadow: string }> = {
      emerald: {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30 hover:border-emerald-500/60',
        text: 'text-emerald-400',
        shadow: 'hover:shadow-emerald-500/20',
      },
      cyan: {
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/30 hover:border-cyan-500/60',
        text: 'text-cyan-400',
        shadow: 'hover:shadow-cyan-500/20',
      },
      violet: {
        bg: 'bg-violet-500/10',
        border: 'border-violet-500/30 hover:border-violet-500/60',
        text: 'text-violet-400',
        shadow: 'hover:shadow-violet-500/20',
      },
    }
    return colors[color] || colors.emerald
  }

  return (
    <section
      id="features"
      ref={sectionRef}
      className="py-24 px-4 relative overflow-hidden"
    >
      {/* 背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/10 to-transparent" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* セクションヘッダー */}
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <p className="text-emerald-400 text-sm font-medium tracking-wider mb-4">
            FEATURES
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            ゲーム体験を、価値に変える
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            GameScopeは、あなたのゲームライフをサポートする3つの機能を提供します
          </p>
        </div>

        {/* 機能カード */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const colors = getColorClasses(feature.color)
            return (
              <div
                key={feature.title}
                className={`group p-8 rounded-2xl border ${colors.border} ${colors.bg}
                           backdrop-blur-sm transition-all duration-500
                           hover:shadow-xl ${colors.shadow}
                           ${isVisible
                             ? 'opacity-100 translate-y-0'
                             : 'opacity-0 translate-y-10'
                           }`}
                style={{ transitionDelay: `${(index + 1) * 200}ms` }}
              >
                {/* アイコン */}
                <div className={`w-16 h-16 rounded-xl ${colors.bg} flex items-center justify-center
                                text-4xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>

                {/* タイトル */}
                <h3 className={`text-xl font-bold ${colors.text} mb-3`}>
                  {feature.title}
                </h3>

                {/* 説明 */}
                <p className="text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* 追加のアピールポイント */}
        <div className={`mt-16 text-center transition-all duration-1000 delay-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                          bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
            <span>🎯</span>
            <span>目指せ「💎 実質無料」— 遊べば遊ぶほど、時間単価は下がっていく</span>
          </div>
        </div>
      </div>
    </section>
  )
}
