import Link from 'next/link'

export const metadata = {
  title: '認証エラー | GameScope',
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 max-w-md">
        <span className="text-5xl mb-4 block">⚠️</span>
        <h1 className="text-2xl font-bold text-text-primary mb-4">
          認証エラー
        </h1>
        <p className="text-text-secondary mb-6">
          ログイン処理中にエラーが発生しました。
          <br />
          もう一度お試しください。
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-accent text-white rounded-lg
                     hover:bg-accent/80 transition-colors"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  )
}
