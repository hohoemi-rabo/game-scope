interface ExternalLinksProps {
  opencriticId: string | null
  titleEn: string
}

/**
 * 外部リンクコンポーネント
 * OpenCritic、Steamへのリンクを表示
 */
export default function ExternalLinks({ opencriticId, titleEn }: ExternalLinksProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 sticky top-24">
      <h2 className="text-xl font-bold mb-4">外部リンク</h2>

      <div className="space-y-3">
        {/* OpenCritic */}
        {opencriticId && (
          <a
            href={`https://opencritic.com/game/${opencriticId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-gray-700/50
                       hover:bg-gray-700 rounded-lg transition-colors"
          >
            <span>OpenCritic で見る</span>
            <span>→</span>
          </a>
        )}

        {/* Steam（タイトル検索） */}
        <a
          href={`https://store.steampowered.com/search/?term=${encodeURIComponent(titleEn)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3 bg-gray-700/50
                     hover:bg-gray-700 rounded-lg transition-colors"
        >
          <span>Steam で検索</span>
          <span>→</span>
        </a>
      </div>
    </div>
  )
}
