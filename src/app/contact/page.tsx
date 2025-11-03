import type { Metadata } from 'next'
import Link from 'next/link'
import Container from '../components/Container'

export const metadata: Metadata = {
  title: 'お問い合わせ',
  description: 'GameScopeへのお問い合わせ・バグ報告・機能要望はGitHub Issuesで受け付けています',
}

/**
 * お問い合わせページ
 * GitHub Issuesへの誘導
 */
export default function ContactPage() {
  return (
    <Container className="py-12">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">お問い合わせ</h1>
          <p className="text-text-secondary text-lg">
            バグ報告・機能要望・質問など、お気軽にお問い合わせください
          </p>
          <p className="text-text-secondary text-sm mt-2">
            お問い合わせ方法は2つあります。用途に応じてお選びください。
          </p>
        </div>

        {/* お問い合わせ方法（2つのカード） */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* GitHub Issuesカード */}
          <div className="bg-gradient-to-br from-[#5865f2] to-[#9b59b6]
                          rounded-xl p-8 text-center">
            <div className="mb-4">
              <span className="text-5xl">💬</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-3">
              GitHub Issues
            </h2>
            <p className="text-sm text-white/80 mb-2 font-semibold">
              📢 公開でお問い合わせ
            </p>
            <p className="text-white/90 text-sm mb-6">
              バグ報告・機能要望など、他のユーザーと共有したい内容に最適です。
            </p>
            <ul className="text-left text-white/90 text-sm space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>過去の質問を検索できる</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>他のユーザーも参考にできる</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>開発の進捗が見える</span>
              </li>
            </ul>
            <a
              href="https://github.com/hohoemi-rabo/game-scope/issues/new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900
                         rounded-lg font-bold hover:bg-gray-100 transition-colors w-full justify-center"
            >
              <span className="text-xl">📝</span>
              <span>Issueを作成</span>
            </a>
          </div>

          {/* Instagram DMカード */}
          <div className="bg-gradient-to-br from-[#e91e63] to-[#f59e0b]
                          rounded-xl p-8 text-center">
            <div className="mb-4">
              <span className="text-5xl">📷</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-3">
              Instagram DM
            </h2>
            <p className="text-sm text-white/80 mb-2 font-semibold">
              🔒 プライベートでお問い合わせ
            </p>
            <p className="text-white/90 text-sm mb-6">
              個人的な質問や、公開されたくない内容はこちらからどうぞ。
            </p>
            <ul className="text-left text-white/90 text-sm space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>プライベートなやり取り</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>気軽にメッセージできる</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>画像・動画も送信可能</span>
              </li>
            </ul>
            <a
              href="https://www.instagram.com/masayuki.kiwami/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900
                         rounded-lg font-bold hover:bg-gray-100 transition-colors w-full justify-center"
            >
              <span className="text-xl">💌</span>
              <span>DMを送る</span>
            </a>
          </div>
        </div>

        {/* GitHub Issuesとは */}
        <section className="mb-12 bg-gray-800/30 rounded-xl p-8 border border-gray-700">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-2xl">ℹ️</span>
            <span>GitHub Issuesとは？</span>
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">✅</span>
              <div>
                <h4 className="font-bold mb-1">誰でも無料で利用できます</h4>
                <p className="text-text-secondary text-sm">
                  GitHubアカウントがあれば誰でも利用可能
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🔍</span>
              <div>
                <h4 className="font-bold mb-1">過去のお問い合わせを検索</h4>
                <p className="text-text-secondary text-sm">
                  同じ問題の解決策がすぐ見つかります
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">💡</span>
              <div>
                <h4 className="font-bold mb-1">開発者と直接やり取り</h4>
                <p className="text-text-secondary text-sm">
                  迅速な対応とフィードバックが可能
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">👥</span>
              <div>
                <h4 className="font-bold mb-1">他のユーザーも参考に</h4>
                <p className="text-text-secondary text-sm">
                  公開されているため、みんなで共有できます
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 利用方法 */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold mb-6 text-center">利用方法（3ステップ）</h3>
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="bg-[#5865f2]/10 rounded-xl p-6 border-l-4 border-[#5865f2]">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#5865f2] rounded-full
                                flex items-center justify-center text-white font-bold text-xl">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold mb-2">GitHubにアクセス</h4>
                  <p className="text-text-secondary mb-3">
                    上記のボタンから、GameScopeのGitHub Issuesページにアクセスしてください。
                  </p>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#5865f2] hover:underline text-sm"
                  >
                    GitHubアカウントをお持ちでない方はこちら →
                  </a>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#00c896]/10 rounded-xl p-6 border-l-4 border-[#00c896]">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#00c896] rounded-full
                                flex items-center justify-center text-white font-bold text-xl">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold mb-2">内容を記入</h4>
                  <p className="text-text-secondary mb-3">
                    タイトルと詳細を記入してください。以下の情報があると対応がスムーズです：
                  </p>
                  <ul className="list-disc list-inside text-text-secondary text-sm space-y-1 ml-4">
                    <li>バグの場合：発生状況、再現手順、期待される動作</li>
                    <li>機能要望の場合：どんな機能が欲しいか、その理由</li>
                    <li>質問の場合：具体的に知りたいこと</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#f59e0b]/10 rounded-xl p-6 border-l-4 border-[#f59e0b]">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#f59e0b] rounded-full
                                flex items-center justify-center text-white font-bold text-xl">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold mb-2">送信して待つ</h4>
                  <p className="text-text-secondary mb-3">
                    「Submit new issue」ボタンで送信完了！開発者からの返信をお待ちください。
                  </p>
                  <p className="text-text-secondary text-sm">
                    💡 メール通知設定をオンにしておくと、返信があったときにすぐ気づけます。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 注意事項 */}
        <section className="mb-12 bg-[#ffb300]/10 rounded-xl p-6 border-2 border-[#ffb300]">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#ffb300]">
            <span className="text-2xl">⚠️</span>
            <span>ご注意ください</span>
          </h3>
          <ul className="space-y-2 text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-[#ffb300]">•</span>
              <span>Issueは公開されます。個人情報は記載しないでください。</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ffb300]">•</span>
              <span>返信には数日かかる場合があります。ご了承ください。</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ffb300]">•</span>
              <span>スパムや不適切な内容は削除される場合があります。</span>
            </li>
          </ul>
        </section>

        {/* CTAボタン */}
        <div className="text-center">
          <h3 className="text-xl font-bold mb-6">お問い合わせはこちらから</h3>
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <a
              href="https://github.com/hohoemi-rabo/game-scope/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4
                         bg-gradient-to-r from-[#5865f2] to-[#9b59b6]
                         text-white rounded-xl font-bold
                         hover:from-[#9b59b6] hover:to-[#5865f2]
                         transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <span className="text-2xl">💬</span>
              <span>GitHub Issues</span>
            </a>
            <a
              href="https://www.instagram.com/masayuki.kiwami/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4
                         bg-gradient-to-r from-[#e91e63] to-[#f59e0b]
                         text-white rounded-xl font-bold
                         hover:from-[#f59e0b] hover:to-[#e91e63]
                         transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <span className="text-2xl">📷</span>
              <span>Instagram DM</span>
            </a>
          </div>
        </div>

        {/* プライバシーポリシーへのリンク */}
        <div className="mt-12 text-center text-sm text-text-secondary">
          <Link href="/privacy-policy" className="hover:text-text-primary transition-colors">
            プライバシーポリシー
          </Link>
          <span className="mx-2">•</span>
          <span>GitHub Issuesは公開されます / Instagram DMはプライベートです</span>
        </div>
      </div>
    </Container>
  )
}
