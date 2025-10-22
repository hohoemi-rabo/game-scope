/**
 * ローディングスピナーコンポーネント
 * データ読み込み中の視覚的なフィードバックを提供
 */

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
}

export default function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-accent border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label="読み込み中"
      />
    </div>
  )
}
