/**
 * スコア表示バッジコンポーネント
 * メタスコアに応じて色分けを行う
 *
 * スコア基準:
 * - 80以上: 緑 (高評価)
 * - 60-79: 黄 (中評価)
 * - 59以下: 赤 (低評価)
 */

interface ScoreBadgeProps {
  score: number | null
  size?: 'sm' | 'md' | 'lg'
}

export default function ScoreBadge({ score, size = 'md' }: ScoreBadgeProps) {
  if (score === null) {
    return <div className="score-badge opacity-50">N/A</div>
  }

  // スコアに応じてスタイルを決定
  const getScoreStyle = (score: number) => {
    if (score >= 80) return 'score-badge-high'
    if (score >= 60) return 'score-badge-medium'
    return 'score-badge-low'
  }

  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-lg px-3 py-1.5',
    lg: 'text-xl px-4 py-2',
  }

  return (
    <div className={`${getScoreStyle(score)} ${sizeClasses[size]}`}>
      {score}
    </div>
  )
}
