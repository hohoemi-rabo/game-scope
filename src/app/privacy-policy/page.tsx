import type { Metadata } from 'next'
import Container from '../components/Container'

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  description: 'GameScopeのプライバシーポリシー',
}

/**
 * プライバシーポリシーページ
 */
export default function PrivacyPolicyPage() {
  return (
    <Container className="py-12">
      <article className="max-w-4xl mx-auto prose prose-invert">
        <h1 className="text-4xl font-bold mb-8">プライバシーポリシー</h1>

        <div className="text-text-secondary text-sm mb-8">
          最終更新日: 2025年12月28日
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">1. はじめに</h2>
          <p className="text-text-secondary mb-4">
            GameScope（以下「当サイト」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めています。
            本プライバシーポリシーは、当サイトがどのような情報を収集し、どのように使用するかを説明するものです。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">2. 収集する情報</h2>
          <p className="text-text-secondary mb-4">
            当サイトは、以下の情報を収集する場合があります：
          </p>

          <h3 className="text-xl font-bold mb-3 mt-6">2.1 アクセス情報</h3>
          <ul className="list-disc list-inside text-text-secondary space-y-2 mb-4">
            <li>アクセスログ（IPアドレス、ブラウザ情報、アクセス日時など）</li>
            <li>Cookie及び類似技術による情報</li>
            <li>ページ閲覧履歴、滞在時間などの利用状況</li>
          </ul>

          <h3 className="text-xl font-bold mb-3 mt-6">2.2 アカウント情報（ログイン時）</h3>
          <p className="text-text-secondary mb-4">
            Googleアカウントでログインした場合、以下の情報を取得・保存します：
          </p>
          <ul className="list-disc list-inside text-text-secondary space-y-2 mb-4">
            <li>メールアドレス</li>
            <li>表示名（Googleアカウントの名前）</li>
            <li>プロフィール画像URL</li>
            <li>ユーザーID（内部識別用）</li>
          </ul>

          <h3 className="text-xl font-bold mb-3 mt-6">2.3 ポートフォリオ情報（ログイン時）</h3>
          <p className="text-text-secondary mb-4">
            ゲームポートフォリオ機能を利用する場合、以下の情報をユーザー自身が入力・保存します：
          </p>
          <ul className="list-disc list-inside text-text-secondary space-y-2 mb-4">
            <li>登録したゲームタイトル</li>
            <li>購入金額</li>
            <li>プレイ時間</li>
            <li>プレイステータス（プレイ中、クリア済み、やめた、積みゲー）</li>
            <li>プレイしたプラットフォーム</li>
            <li>メモ（任意）</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">3. 情報の利用目的</h2>
          <p className="text-text-secondary mb-4">
            収集した情報は、以下の目的で利用します：
          </p>
          <ul className="list-disc list-inside text-text-secondary space-y-2">
            <li>サービスの提供、運営、改善</li>
            <li>アクセス状況の分析</li>
            <li>技術的な問題の診断と解決</li>
            <li>セキュリティの維持と向上</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">4. Cookie（クッキー）について</h2>
          <p className="text-text-secondary mb-4">
            当サイトでは、ユーザー体験の向上のためにCookieを使用する場合があります。
            Cookieとは、Webサイトがユーザーのブラウザに保存する小さなテキストファイルです。
          </p>
          <p className="text-text-secondary mb-4">
            ユーザーは、ブラウザの設定によりCookieの使用を拒否することができます。
            ただし、Cookieを無効にすると、一部の機能が正常に動作しない場合があります。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">5. 外部サービスの利用</h2>
          <p className="text-text-secondary mb-4">
            当サイトは、以下の外部サービスを利用しています。
            これらのサービスには、それぞれ独自のプライバシーポリシーが適用されます：
          </p>

          <h3 className="text-xl font-bold mb-3 mt-6">認証・インフラ</h3>
          <ul className="list-disc list-inside text-text-secondary space-y-2 mb-4">
            <li>
              <strong>Google（OAuth認証）</strong>: ログイン認証（
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                プライバシーポリシー
              </a>
              ）
            </li>
            <li>
              <strong>Supabase</strong>: データベース、認証、ホスティング（
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                プライバシーポリシー
              </a>
              ）
            </li>
          </ul>

          <h3 className="text-xl font-bold mb-3 mt-6">ゲーム情報</h3>
          <ul className="list-disc list-inside text-text-secondary space-y-2 mb-4">
            <li>
              <strong>OpenCritic API</strong>: ゲーム評価情報の取得（
              <a
                href="https://opencritic.com/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                プライバシーポリシー
              </a>
              ）
            </li>
            <li>
              <strong>RAWG API</strong>: ゲーム情報の取得・検索（
              <a
                href="https://rawg.io/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                プライバシーポリシー
              </a>
              ）
            </li>
            <li>
              <strong>Twitch API</strong>: ゲーム配信情報の取得（
              <a
                href="https://www.twitch.tv/p/legal/privacy-notice/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                プライバシーポリシー
              </a>
              ）
            </li>
          </ul>

          <h3 className="text-xl font-bold mb-3 mt-6">AI・翻訳</h3>
          <ul className="list-disc list-inside text-text-secondary space-y-2">
            <li>
              <strong>Google Gemini API</strong>: ニュース記事のAI要約生成（
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                プライバシーポリシー
              </a>
              ）
            </li>
            <li>
              <strong>DeepL API</strong>: ゲーム検索時の日本語→英語翻訳（
              <a
                href="https://www.deepl.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                プライバシーポリシー
              </a>
              ）
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">6. 第三者への情報提供</h2>
          <p className="text-text-secondary mb-4">
            当サイトは、法令に基づく場合を除き、ユーザーの同意なく第三者に個人情報を提供することはありません。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">7. セキュリティ</h2>
          <p className="text-text-secondary mb-4">
            当サイトは、情報の漏洩、紛失、改ざんなどを防止するため、適切なセキュリティ対策を講じています。
          </p>
          <ul className="list-disc list-inside text-text-secondary space-y-2">
            <li>すべての通信はHTTPSで暗号化されています</li>
            <li>ユーザーデータはRow Level Security（RLS）により、本人のみがアクセス可能です</li>
            <li>パスワードは当サイトでは保存しません（Google OAuth認証を使用）</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">8. データの保持期間</h2>
          <p className="text-text-secondary mb-4">
            当サイトで収集したデータは、以下の期間保持されます：
          </p>
          <ul className="list-disc list-inside text-text-secondary space-y-2">
            <li><strong>アカウント情報</strong>: アカウント削除まで</li>
            <li><strong>ポートフォリオ情報</strong>: アカウント削除まで</li>
            <li><strong>アクセスログ</strong>: 最大90日間</li>
            <li><strong>ニュース記事データ</strong>: 7日間（自動削除）</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">9. アカウント削除・データ削除</h2>
          <p className="text-text-secondary mb-4">
            ユーザーは、いつでもアカウントの削除を要求することができます。
            アカウントを削除すると、以下のデータがすべて削除されます：
          </p>
          <ul className="list-disc list-inside text-text-secondary space-y-2 mb-4">
            <li>アカウント情報（メールアドレス、表示名、プロフィール画像）</li>
            <li>ポートフォリオ情報（登録したすべてのゲームデータ）</li>
          </ul>
          <p className="text-text-secondary mb-4">
            アカウント削除をご希望の場合は、以下の方法でお問い合わせください：
          </p>
          <ul className="list-disc list-inside text-text-secondary space-y-2">
            <li>
              <a
                href="https://github.com/hohoemi-rabo/game-scope/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                GitHub Issues
              </a>
              にてリクエスト
            </li>
            <li>
              <a
                href="https://www.instagram.com/gamescope.jp/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Instagram DM
              </a>
              にてリクエスト
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">10. プライバシーポリシーの変更</h2>
          <p className="text-text-secondary mb-4">
            当サイトは、必要に応じて本プライバシーポリシーを変更することがあります。
            変更後のプライバシーポリシーは、本ページに掲載した時点で効力を生じるものとします。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">11. お問い合わせ</h2>
          <p className="text-text-secondary mb-4">
            本プライバシーポリシーに関するお問い合わせは、GitHubのIssueにてお願いいたします。
          </p>
          <p className="text-text-secondary">
            <a
              href="https://github.com/hohoemi-rabo/game-scope/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              GitHub Issues
            </a>
          </p>
        </section>
      </article>
    </Container>
  )
}
