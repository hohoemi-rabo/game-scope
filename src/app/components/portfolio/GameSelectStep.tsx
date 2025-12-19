'use client'

interface GameSelectStepProps {
  onSelectPopular: () => void
  onSelectSearch: () => void
}

/**
 * Step 1: 登録方法選択
 * - 人気ゲーム（Top60）から選ぶ
 * - 検索して探す
 */
export default function GameSelectStep({
  onSelectPopular,
  onSelectSearch,
}: GameSelectStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-text-secondary text-center mb-6">
        ゲームの登録方法を選んでください
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={onSelectPopular}
          className="p-6 bg-gray-800 rounded-xl border border-gray-700
                     hover:border-accent hover:bg-gray-800/80 transition-all
                     text-left group"
        >
          <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform">
            🏆
          </span>
          <h3 className="font-bold text-text-primary mb-1">人気ゲームから選ぶ</h3>
          <p className="text-sm text-text-secondary">
            Top60からすぐに選べます
          </p>
        </button>

        <button
          onClick={onSelectSearch}
          className="p-6 bg-gray-800 rounded-xl border border-gray-700
                     hover:border-[#06b6d4] hover:bg-gray-800/80 transition-all
                     text-left group"
        >
          <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform">
            🔍
          </span>
          <h3 className="font-bold text-text-primary mb-1">検索して探す</h3>
          <p className="text-sm text-text-secondary">
            RAWGデータベースから検索
          </p>
        </button>
      </div>
    </div>
  )
}
