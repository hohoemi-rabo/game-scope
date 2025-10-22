'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

const PLATFORMS = ['PC', 'PlayStation 5', 'Xbox Series X', 'Nintendo Switch']
const SCORE_RANGES = [
  { label: '全て', min: 0, max: 100 },
  { label: '80点以上', min: 80, max: 100 },
  { label: '60-79点', min: 60, max: 79 },
  { label: '60点未満', min: 0, max: 59 },
]

/**
 * フィルタパネルコンポーネント
 * プラットフォームとスコア範囲でフィルタリング
 */
export default function FilterPanel() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [scoreRange, setScoreRange] = useState({ min: 0, max: 100 })

  // URLパラメータからフィルタを復元
  useEffect(() => {
    const platforms = searchParams.get('platforms')?.split(',').filter(Boolean) || []
    const minScore = parseInt(searchParams.get('minScore') || '0')
    const maxScore = parseInt(searchParams.get('maxScore') || '100')

    setSelectedPlatforms(platforms)
    setScoreRange({ min: minScore, max: maxScore })
  }, [searchParams])

  const updateFilters = (platforms: string[], scoreMin: number, scoreMax: number) => {
    const params = new URLSearchParams(searchParams.toString())

    if (platforms.length > 0) {
      params.set('platforms', platforms.join(','))
    } else {
      params.delete('platforms')
    }

    if (scoreMin !== 0 || scoreMax !== 100) {
      params.set('minScore', scoreMin.toString())
      params.set('maxScore', scoreMax.toString())
    } else {
      params.delete('minScore')
      params.delete('maxScore')
    }

    router.push(`/search?${params.toString()}`, { scroll: false })
  }

  const handlePlatformToggle = (platform: string) => {
    const newPlatforms = selectedPlatforms.includes(platform)
      ? selectedPlatforms.filter((p) => p !== platform)
      : [...selectedPlatforms, platform]

    setSelectedPlatforms(newPlatforms)
    updateFilters(newPlatforms, scoreRange.min, scoreRange.max)
  }

  const handleScoreRangeChange = (range: { min: number; max: number }) => {
    setScoreRange(range)
    updateFilters(selectedPlatforms, range.min, range.max)
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-bold mb-4">フィルター</h3>

      {/* プラットフォーム */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-text-secondary mb-3">
          プラットフォーム
        </h4>
        <div className="space-y-2">
          {PLATFORMS.map((platform) => (
            <label
              key={platform}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedPlatforms.includes(platform)}
                onChange={() => handlePlatformToggle(platform)}
                className="w-4 h-4 accent-accent"
              />
              <span className="text-text-primary">{platform}</span>
            </label>
          ))}
        </div>
      </div>

      {/* スコア範囲 */}
      <div>
        <h4 className="text-sm font-semibold text-text-secondary mb-3">
          メタスコア
        </h4>
        <div className="space-y-2">
          {SCORE_RANGES.map((range) => (
            <button
              key={range.label}
              onClick={() => handleScoreRangeChange({ min: range.min, max: range.max })}
              className={`w-full text-left px-3 py-2 rounded transition-colors
                ${scoreRange.min === range.min && scoreRange.max === range.max
                  ? 'bg-accent text-white'
                  : 'bg-gray-700/50 text-text-primary hover:bg-gray-700'
                }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
