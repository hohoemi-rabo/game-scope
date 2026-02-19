---
paths:
  - "src/app/components/**/*.tsx"
  - "src/app/*/page.tsx"
  - "src/app/page.tsx"
  - "tailwind.config.ts"
  - "src/app/globals.css"
---

# フロントエンド & デザインシステム

## カラーパレット

```css
:root {
  --bg-primary: #0e0e10;    /* ブラックグレー */
  --accent: #5865f2;        /* ブルーバイオレット */
  --success: #00c896;       /* エメラルドグリーン (スコア80+) */
  --warning: #ffb300;       /* アンバー (スコア60-79) */
  --danger: #ff5252;        /* コーラルレッド (スコア59以下) */
  --text-primary: #f2f2f2;
  --text-secondary: #9e9e9e;
}
```

## フォント設定

- **Inter**: 見出し用（Google Fonts、優先度高）
- **Noto Sans JP**: 日本語本文用（Google Fonts）
- **Geist Mono**: スコアバッジ用（Vercel提供）

## レスポンシブデザイン

- モバイルファースト設計、ブレークポイント: 768px (md:)
- SNSリンク: PCのみヘッダー表示、全デバイスでフッター表示（誤タップ防止）
- スムーズスクロール: `html { scroll-behavior: smooth; }`

## ヘッダー (`Header.tsx`)

- GameScopeロゴ: `public/logo.png`（Next.js Image使用）
- ナビゲーション: 高評価 | 検索 | ニュース | 更新状況
- SNSリンク（PCのみ表示）: Instagram (@gamescope.jp)、X (@gamescope_jp)
- デスクトップ: `hidden md:flex`、モバイル: ハンバーガーメニュー（MobileMenu）
- ログインボタン / ユーザーメニュー（ドロップダウン）実装済み

## モバイルメニュー (`MobileMenu.tsx`)

- React Portal使用（`createPortal`でbody直下にレンダリング）
  - 理由: ヘッダーの`backdrop-blur-sm`がスタッキングコンテキストを作成するため
- z-index階層: オーバーレイ z-[100]、メニュー z-[101]
- 背景色: インラインスタイルで確実に適用（`backgroundColor: '#111111'`）
- SSR対応: `mounted`状態でPortalを条件付きレンダリング

## フッター (`Footer.tsx`)

- 同期ステータス表示（最新情報更新済 / 更新エラー + 経過時間）
- SNSリンク（全デバイス表示）
- **SyncStatus**: Client ComponentでAPIから最新状態を取得（`/api/sync-status`）

## スクロールトップボタン (`ScrollToTopButton.tsx`)

- 300px以上スクロールで表示、fixed position（右下固定）
- `layout.tsx`で `next/dynamic` による遅延読み込み（初期バンドル削減）

## Server Components vs Client Components

- **デフォルトは Server Components**: データフェッチング、DB アクセスはサーバーで実行
- Client Components は `'use client'` で明示的に宣言
- **必要なデータのみをClient Componentに渡す**（全データを渡さない）

## パフォーマンスパターン

- **並列データ取得**: 独立したクエリは `Promise.all()` で並列化（ウォーターフォール防止）
- **遅延読み込み**: 初期レンダリングに不要な Client Component は `next/dynamic` で分離
  - `layout.tsx`: `ToasterProvider`, `ScrollToTopButton` を dynamic import
  - 注意: Server Component 内では `ssr: false` は使用不可（code splitting のみ）
- **スクロールリスナー**: `{ passive: true }` を付与してスクロール性能を確保
